import { settings as defaultSettings, type settingsType } from './settings'

const presetKeys = ['GUIT', 'BASS', 'CST1', 'CST2', 'CST3'] as const
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

// Helper to parse a number or return a default value
function parseNumberOrDefault(val: string, def?: number) {
  if (val === 'default') return def
  const n = Number(val)
  return isNaN(n) ? def : n
}

/**
 * Parses a settings.txt string and returns a settings object.
 * @param text The settings.txt file contents
 */
export function textToSettings(text: string): settingsType {
  // Start with a deep clone of the default settings as a base
  const settings: settingsType = JSON.parse(JSON.stringify(defaultSettings))

  // Regex to find section headers and ends
  const sectionRegex = /-{4,}(SETTINGS|OpenTuning|Temperament)-{4,}|-{8,}end-{8,}/gi
  const parts: { type: string; body: string }[] = []
  let match: RegExpExecArray | null
  let lastIndex = 0
  let lastType = ''
  // Split the text into named sections
  while ((match = sectionRegex.exec(text))) {
    if (lastType) {
      parts.push({ type: lastType, body: text.slice(lastIndex, match.index) })
    }
    lastType = match[1] || ''
    lastIndex = sectionRegex.lastIndex
  }

  // --- SETTINGS SECTION ---
  const settingsPart = parts.find((p) => p.type === 'SETTINGS')
  if (settingsPart) {
    // Split into lines and process each key/value
    const lines = settingsPart.body
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    for (const line of lines) {
      if (line.startsWith('//')) continue // skip comments
      const [key, ...rest] = line.split(':')
      if (!rest.length) continue
      const value = rest.join(':').trim()
      switch (key.trim()) {
        case 'A4Default':
          settings.A4Default = Number(value)
          break
        case 'Transpose':
          settings.Transpose = Number(value)
          break
        case 'PASSTHROUGH_MODE':
          settings.PASSTHROUGH_MODE = value === '1'
          break
        case 'STAY_ON':
          settings.STAY_ON = value === '1'
          break
        default:
          // GUIT: OpenTuning, etc.
          if (presetKeys.includes(key.trim() as any)) {
            if (value === 'OpenTuning' || value === 'Temperament') {
              settings.presets[key.trim() as (typeof presetKeys)[number]]!.mode = value
            }
          }
      }
    }
  }

  // --- OPEN TUNING SECTIONS ---
  for (const part of parts.filter((p) => p.type === 'OpenTuning')) {
    const lines = part.body
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    let mode = '',
      name = '',
      a4: number | undefined = undefined,
      transpose: number | undefined = undefined
    const strings: { note: string; offset: number }[] = []
    for (const line of lines) {
      if (line.startsWith('//')) continue
      if (line.startsWith('Mode:')) {
        mode = line.split(':')[1].trim()
      } else if (line.startsWith('Name:')) {
        name = line.split(':')[1].trim()
      } else if (line.startsWith('A4:')) {
        const val = line.split(':')[1].trim()
        a4 = parseNumberOrDefault(val, settings.A4Default)
        if (val === 'default') a4 = undefined // use global default if "default"
      } else if (line.startsWith('Transpose:')) {
        const val = line.split(':')[1].trim()
        transpose = parseNumberOrDefault(val, settings.Transpose)
        if (val === 'default') transpose = undefined // use global default if "default"
      } else if (/^\d+:/.test(line)) {
        // Parse string lines, e.g. 1:  E4    +0.0
        const m = line.match(/^\d+:\s*([A-G]#?\d)\s*([+-]?\d+(\.\d+)?)/)
        if (m) {
          strings.push({ note: m[1], offset: Number(m[2]) })
        }
      }
    }
    // Assign to the correct preset if mode is valid
    if (presetKeys.includes(mode as any)) {
      settings.presets[mode as (typeof presetKeys)[number]]!.OpenTuning = {
        name,
        A4: a4,
        Transpose: transpose,
        strings,
      }
    }
  }

  // --- TEMPERAMENT SECTIONS ---
  for (const part of parts.filter((p) => p.type === 'Temperament')) {
    const lines = part.body
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    let mode = '',
      name = '',
      a4: number | undefined = undefined,
      transpose: number | undefined = undefined
    const offsets: Record<string, number> = {}
    for (const line of lines) {
      if (line.startsWith('//')) continue
      if (line.startsWith('Mode:')) {
        mode = line.split(':')[1].trim()
      } else if (line.startsWith('Name:')) {
        name = line.split(':')[1].trim()
      } else if (line.startsWith('A4:')) {
        const val = line.split(':')[1].trim()
        a4 = parseNumberOrDefault(val, settings.A4Default)
        if (val === 'default') a4 = undefined
      } else if (line.startsWith('Transpose:')) {
        const val = line.split(':')[1].trim()
        transpose = parseNumberOrDefault(val, settings.Transpose)
        if (val === 'default') transpose = undefined
      } else {
        // Parse note offsets, e.g. C#: +0.0
        const m = line.match(/^([A-G]#?):\s*([+-]?\d+(\.\d+)?)/)
        if (m && noteNames.includes(m[1] as any)) {
          offsets[m[1]] = Number(m[2])
        }
      }
    }
    // Assign to the correct preset if mode is valid
    if (presetKeys.includes(mode as any)) {
      settings.presets[mode as (typeof presetKeys)[number]]!.Temperament = {
        name,
        A4: a4,
        Transpose: transpose,
        offsets: Object.fromEntries(noteNames.map((n) => [n, offsets[n] ?? 0])),
      }
    }
  }

  return settings
}

import { z } from 'zod'
import { formSchema, presetKeysSchema } from './settings'

type FormValues = z.infer<typeof formSchema>
type PresetKeysType = z.infer<typeof presetKeysSchema>

export function settingsToText(values: FormValues): string {
  // Helper for boolean to 0/1
  const boolToNum = (b: boolean) => (b ? 1 : 0)

  // Helper for formatting numbers
  const fmt = (n: number, digits = 1) => n.toFixed(digits)

  // Preset keys
  const presetKeys = Object.keys(values.presets) as PresetKeysType[]

  // Header
  let txt = `
-----SETTINGS-----

A4Default: ${Number(values.A4Default).toFixed(4)}
Transpose: ${values.Transpose}

`

  // Preset modes
  for (const key of presetKeys) {
    txt += `${key}: ${values.presets[key]?.mode}\n`
  }

  txt += `
PASSTHROUGH_MODE: ${boolToNum(values.PASSTHROUGH_MODE)}
STAY_ON: ${boolToNum(values.STAY_ON)}

--------end--------

`

  // OpenTuning blocks
  for (const key of presetKeys) {
    const preset = values.presets[key]
    const ot = preset!.OpenTuning
    txt += `
--------OpenTuning--------

Mode: ${key}
Name: ${ot.name}
A4: ${ot.A4}
Transpose: ${ot.Transpose === 0 ? 'default' : ot.Transpose}

`
    ot.strings.forEach((s, i) => {
      txt += `${i + 1}:  ${s.note.padEnd(3)}   ${s.offset >= 0 ? '+' : ''}${fmt(s.offset, 1)}\n`
    })
    txt += `
--------end--------

`
  }

  // Temperament blocks
  for (const key of presetKeys) {
    const preset = values.presets[key]
    const temp = preset!.Temperament
    txt += `
--------Temperament--------

Mode: ${key}
Name: ${temp.name}
A4: ${temp.A4}
Transpose: ${temp.Transpose === 0 ? 'default' : temp.Transpose}

`
    Object.entries(temp.offsets).forEach(([note, offset]) => {
      txt += `${note}:   ${offset >= 0 ? '+' : ''}${fmt(offset, 1)}\n`
    })
    txt += `
--------end--------

`
  }

  return txt
}

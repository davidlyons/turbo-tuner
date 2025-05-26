import { z } from 'zod'
import { formSchema, presetKeysSchema } from './settings'

type FormValues = z.infer<typeof formSchema>
type PresetKeysType = z.infer<typeof presetKeysSchema>

export function settingsToText(values: FormValues): string {
  // Helper for boolean to 0/1
  const boolToNum = (b: boolean) => (b ? 1 : 0)

  // Preset keys
  const presetKeys = Object.keys(values.presets) as PresetKeysType[]

  // Header
  let txt = `
-----SETTINGS-----

A4Default: ${Number(values.A4Default).toFixed(4)}
Transpose: ${values.Transpose > 0 ? '+' : ''}${values.Transpose}

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
A4: ${ot.A4 === undefined ? 'default' : ot.A4}
Transpose: ${ot.Transpose === undefined ? 'default' : `${ot.Transpose > 0 ? '+' : ''}${ot.Transpose}`}

`
    ot.strings.forEach((s, i) => {
      const offset = `${s.offset >= 0 ? '+' : ''}${s.offset.toFixed(1)}`
      txt += `${i + 1}:  ${s.note.padEnd(3)}  ${offset.padStart(5)}\n`
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
A4: ${temp.A4 === undefined ? 'default' : temp.A4}
Transpose: ${temp.Transpose === undefined ? 'default' : `${temp.Transpose > 0 ? '+' : ''}${temp.Transpose}`}

`
    Object.entries(temp.offsets).forEach(([note, offset]) => {
      const noteStr = `${note}:`
      const offsetStr = `${offset >= 0 ? '+' : ''}${offset.toFixed(1)}`
      txt += `${noteStr.padEnd(3)}  ${offsetStr.padStart(5)}\n`
    })
    txt += `
--------end--------

`
  }

  return txt
}

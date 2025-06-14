import { z } from 'zod'

export const presetKeysSchema = z.enum(['GUIT', 'BASS', 'CST1', 'CST2', 'CST3'])

export type presetKeysType = z.infer<typeof presetKeysSchema>

const notesKeysSchema = z.enum(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])
export const noteRegex = /^(?![EB]#)([A-G]#?)(\d)$/

const TransposeSchema = z.number().min(-9).max(9)
const A4Schema = z.number().min(300).max(599.9)
const offsetSchema = z.number().min(-50).max(50)

const modeSettingsSchema = z.object({
  name: z.string(),
  A4: A4Schema.optional(),
  Transpose: TransposeSchema.optional(),
})

const presetSchema = z.object({
  mode: z.enum(['OpenTuning', 'Temperament']),
  OpenTuning: modeSettingsSchema.and(
    z.object({
      strings: z.array(
        z.object({
          note: z.string().regex(noteRegex),
          offset: offsetSchema,
        })
      ),
    })
  ),
  Temperament: modeSettingsSchema.and(
    z.object({
      offsets: z.record(notesKeysSchema, offsetSchema),
    })
  ),
})

export const formSchema = z.object({
  A4Default: A4Schema,
  Transpose: TransposeSchema,
  PASSTHROUGH_MODE: z.boolean(),
  STAY_ON: z.boolean(),
  presets: z.record(presetKeysSchema, presetSchema),
})

export type settingsType = z.infer<typeof formSchema>

export const settings: settingsType = {
  A4Default: 440.0,
  Transpose: 0,
  PASSTHROUGH_MODE: false,
  STAY_ON: false,
  presets: {
    GUIT: {
      mode: 'OpenTuning',
      OpenTuning: {
        name: 'Standard',
        A4: undefined,
        Transpose: undefined,
        strings: [
          { note: 'E4', offset: 0.0 },
          { note: 'B3', offset: 0.0 },
          { note: 'G3', offset: 0.0 },
          { note: 'D3', offset: 0.0 },
          { note: 'A2', offset: 0.0 },
          { note: 'E2', offset: 0.0 },
          { note: 'B1', offset: 0.0 },
        ],
      },
      Temperament: {
        name: 'JUST INTONATION',
        A4: undefined,
        Transpose: undefined,
        offsets: {
          C: 15.6,
          'C#': -13.7,
          D: 19.5,
          'D#': 31.2,
          E: 1.9,
          F: 13.6,
          'F#': 5.8,
          G: 17.6,
          'G#': -11.8,
          A: 0.0,
          'A#': 33.2,
          B: 3.9,
        },
      },
    },
    BASS: {
      mode: 'OpenTuning',
      OpenTuning: {
        name: 'BASS-5',
        A4: undefined,
        Transpose: undefined,
        strings: [
          { note: 'G2', offset: 0.0 },
          { note: 'D2', offset: 0.0 },
          { note: 'A1', offset: 0.0 },
          { note: 'E1', offset: 0.0 },
          { note: 'B0', offset: 0.0 },
        ],
      },
      Temperament: {
        name: 'EQUAL',
        A4: undefined,
        Transpose: undefined,
        offsets: {
          C: 0.0,
          'C#': 0.0,
          D: 0.0,
          'D#': 0.0,
          E: 0.0,
          F: 0.0,
          'F#': 0.0,
          G: 0.0,
          'G#': 0.0,
          A: 0.0,
          'A#': 0.0,
          B: 0.0,
        },
      },
    },
    CST1: {
      mode: 'OpenTuning',
      OpenTuning: {
        name: 'Drop D',
        A4: undefined,
        Transpose: undefined,
        strings: [
          { note: 'E4', offset: 0.0 },
          { note: 'B3', offset: 0.0 },
          { note: 'G3', offset: 0.0 },
          { note: 'D3', offset: 0.0 },
          { note: 'A2', offset: 0.0 },
          { note: 'D2', offset: 0.0 },
        ],
      },
      Temperament: {
        name: 'Thidell',
        A4: undefined,
        Transpose: undefined,
        offsets: {
          C: 2.0,
          'C#': -4.0,
          D: 2.0,
          'D#': -4.0,
          E: -2.0,
          F: 0.0,
          'F#': -4.0,
          G: 4.0,
          'G#': -4.0,
          A: 0.0,
          'A#': -4.0,
          B: -1.0,
        },
      },
    },
    CST2: {
      mode: 'OpenTuning',
      OpenTuning: {
        name: 'Drop G',
        A4: undefined,
        Transpose: undefined,
        strings: [
          { note: 'D4', offset: 0.0 },
          { note: 'A3', offset: 0.0 },
          { note: 'F3', offset: 0.0 },
          { note: 'C3', offset: 0.0 },
          { note: 'G2', offset: 0.0 },
          { note: 'D2', offset: 0.0 },
          { note: 'G1', offset: 0.0 },
        ],
      },
      Temperament: {
        name: 'D.W.G.',
        A4: undefined,
        Transpose: undefined,
        offsets: {
          C: 5.9,
          'C#': 1.4,
          D: 2.0,
          'D#': 0.6,
          E: -2.0,
          F: 7.8,
          'F#': -1.4,
          G: 3.9,
          'G#': 0.2,
          A: 0.0,
          'A#': 3.9,
          B: 0.0,
        },
      },
    },
    CST3: {
      mode: 'OpenTuning',
      OpenTuning: {
        name: 'Drop F/C',
        A4: undefined,
        Transpose: undefined,
        strings: [
          { note: 'D4', offset: 0.0 },
          { note: 'A3', offset: 0.0 },
          { note: 'F3', offset: 0.0 },
          { note: 'C3', offset: 0.0 },
          { note: 'G2', offset: 0.0 },
          { note: 'C2', offset: 0.0 },
          { note: 'F1', offset: 0.0 },
        ],
      },
      Temperament: {
        name: 'MeanBlu',
        A4: undefined,
        Transpose: undefined,
        offsets: {
          C: 0.0,
          'C#': 0.0,
          D: 4.8,
          'D#': 0.0,
          E: -2.6,
          F: 0.0,
          'F#': 0.0,
          G: 7.2,
          'G#': 0.0,
          A: 0.0,
          'A#': 0.0,
          B: -4.0,
        },
      },
    },
  },
}

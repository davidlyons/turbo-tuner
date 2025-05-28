import { noteRegex } from '@/lib/settings'

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function shiftNote(noteWithOctave: string, semitones: number) {
  const match = noteWithOctave.match(noteRegex)

  if (!match) return noteWithOctave

  const [_, note, octaveStr] = match
  let index = notes.indexOf(note) + semitones
  let octave = parseInt(octaveStr)

  while (index < 0) {
    index += 12
    octave -= 1
  }

  while (index >= 12) {
    index -= 12
    octave += 1
  }

  // Limit from C0 to C8
  if (octave < 0) return 'C0'
  if (octave > 8 || (octave === 8 && notes[index] !== 'C')) return 'C8'

  return `${notes[index]}${octave}`
}

// Get frequency from note name (e.g. "A4" => 440)
export function noteToFrequency(noteWithOctave: string, a4: number = 440): number | null {
  const match = noteWithOctave.match(noteRegex)
  if (!match) return null
  const note = match[1]
  const octave = parseInt(match[2])
  const noteIndex = notes.indexOf(note)
  if (noteIndex === -1) return null
  // MIDI note number: C0 = 12
  const midi = 12 + noteIndex + octave * 12
  // A4 = MIDI 69 = a4 Hz
  return a4 * 2 ** ((midi - 69) / 12)
}

// Play a triangle wave for the given frequency, returns { stop }
export function playNote(frequency: number): { stop: () => void } {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = frequency

  // Dynamic gain for low notes
  const peakGain = frequency < 35 ? 4.0 : frequency < 100 ? 1.0 : frequency < 200 ? 0.7 : 0.5
  gain.gain.value = 0

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()

  let stopped = false
  let interval: ReturnType<typeof setInterval> | null = null

  // Envelope function: attack and decay
  function triggerEnvelope() {
    if (stopped) return
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.01)
    gain.gain.linearRampToValueAtTime(0, now + 1.0)
  }

  // Start the repeating envelope
  triggerEnvelope()
  interval = setInterval(triggerEnvelope, 1000)

  const stop = () => {
    stopped = true
    if (interval) clearInterval(interval)
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.1)
    setTimeout(() => {
      try {
        osc.stop()
      } catch {}
      ctx.close()
    }, 150)
  }

  osc.onended = () => {
    if (ctx.state !== 'closed') ctx.close()
  }

  return { stop }
}

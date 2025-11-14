import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import A4 from '@/notes/A4.mp3'

type TuningString = { note: string; offset: number }

// https://github.com/Tonejs/Tone.js/wiki/Using-Tone.js-with-React-React-Typescript-or-Vue#the-react-component-using-hooks-demo
// https://tonejs.github.io/#samples
// https://github.com/nbrosowsky/tonejs-instruments

// convert cents offset to semitones (100 cents = 1 semitone)
// transpose note with offset
const getFrequency = ({ note, offset }: TuningString) => {
  const semitoneOffset = (offset || 0) / 100
  let frequency: string | number = note
  if (semitoneOffset !== 0) {
    frequency = Tone.Frequency(note).transpose(semitoneOffset).toFrequency()
  }
  return frequency
}

export const useSampler = () => {
  const samplerRef = useRef<Tone.Sampler | null>(null)
  const loopRef = useRef<Tone.Loop | null>(null)
  const [isAudioLoaded, setAudioLoaded] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [isPlayingAll, setIsPlayingAll] = useState(false)

  useEffect(() => {
    samplerRef.current = new Tone.Sampler(
      { A4 },
      {
        onload: () => setAudioLoaded(true),
      }
    ).toDestination()

    return () => {
      samplerRef.current?.dispose()
      loopRef.current?.dispose()
    }
  }, [])

  const stopAudio = () => {
    setPlayingIndex(null)
    setIsPlayingAll(false)
    Tone.getTransport().stop()
    loopRef.current?.stop()
  }

  const playNote = async (string: TuningString, index: number) => {
    if (!isAudioLoaded) return
    await Tone.start()
    stopAudio()
    setPlayingIndex(index)
    const frequency = getFrequency(string)

    loopRef.current = new Tone.Loop((time) => {
      samplerRef.current?.triggerAttackRelease(frequency, '2n', time)
    }, '2n').start(0)

    Tone.getTransport().start()
  }

  const playAll = async (strings: TuningString[]) => {
    if (!isAudioLoaded) return
    await Tone.start()
    let index = playingIndex ?? strings.length - 1

    Tone.getTransport().stop()
    loopRef.current?.stop()
    setIsPlayingAll(true)

    loopRef.current = new Tone.Loop((time) => {
      setPlayingIndex(index)
      const frequency = getFrequency(strings[index])
      samplerRef.current?.triggerAttackRelease(frequency, '2n', time)
      index = (index - 1 + strings.length) % strings.length
    }, '2n').start(0)

    Tone.getTransport().start()
  }

  return {
    isAudioLoaded,
    playingIndex,
    isPlayingAll,
    playNote,
    playAll,
    stopAudio,
  }
}

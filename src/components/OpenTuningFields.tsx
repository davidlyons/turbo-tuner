'use client'

import { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { z } from 'zod'
import { formSchema, presetKeysSchema, noteRegex } from '@/lib/settings'

import {
  FormLabel,
  // FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/NumberInput'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'

import { ChevronDown, ChevronUp, Play, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

import { shiftNote, noteToFrequency, playNote } from '@/lib/audio-utils'

type TuningString = { note: string; offset: number }

export const OpenTuningFields = ({
  activePreset,
}: {
  activePreset: z.infer<typeof presetKeysSchema>
}) => {
  const form = useFormContext<z.infer<typeof formSchema>>()

  // Get OpenTuning's A4 value, or fallback to A4Default, or 440
  const a4Value =
    form.getValues?.(`presets.${activePreset}.OpenTuning.A4`) ??
    form.getValues?.('A4Default') ??
    440

  // Track which string is playing, and the stop function
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const stopRef = useRef<null | (() => void)>(null)
  // Track if the "all" button is playing
  const [playingAll, setPlayingAll] = useState(false)
  const allTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Stop any currently playing audio
  const stopAudio = () => {
    if (stopRef.current) {
      stopRef.current()
      stopRef.current = null
    }
    setPlayingIndex(null)
    setPlayingAll(false)
    if (allTimeoutRef.current) {
      clearTimeout(allTimeoutRef.current)
      allTimeoutRef.current = null
    }
  }

  // Play a single note, stopping any other audio
  const handlePlayNote = (freq: number, index: number) => {
    stopAudio()
    const { stop } = playNote(freq)
    stopRef.current = stop
    setPlayingIndex(index)
  }

  // Stop a single note
  const handleStopNote = () => {
    stopAudio()
  }

  // Play all notes in reverse order, one at a time, for 1s each
  const handlePlayAll = (strings: TuningString[]) => {
    stopAudio()
    setPlayingAll(true)
    let i = strings.length - 1

    const playNext = () => {
      if (i < 0) {
        i = strings.length - 1 // Loop back to the last string
      }

      const stringObj = strings[i]
      const freq = noteToFrequency(stringObj.note, a4Value)
      if (freq) {
        const offsetFreq = freq * 2 ** ((stringObj.offset || 0) / 1200)
        const { stop } = playNote(offsetFreq)
        stopRef.current = stop
        setPlayingIndex(i)
        allTimeoutRef.current = setTimeout(() => {
          stop()
          i--
          playNext()
        }, 1000)
      } else {
        i--
        playNext()
      }
    }
    playNext()
  }

  // Stop all notes
  const handleStopAll = () => {
    stopAudio()
  }

  return (
    <>
      {/* Strings array */}
      <FormField
        control={form.control}
        name={`presets.${activePreset}.OpenTuning.strings`}
        key={`presets.${activePreset}.OpenTuning.strings`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Strings</FormLabel>

            {/* Dropdown to select number of strings */}
            <div className="mb-2">
              <Select
                value={String(field.value.length)}
                onValueChange={(val) => {
                  const newCount = Number(val)
                  let newArr = [...field.value]
                  if (newCount > newArr.length) {
                    // Add new strings, each 5 semitones below the previous
                    for (let i = newArr.length; i < newCount; i++) {
                      const prevNote = newArr[i - 1]?.note
                      newArr.push({
                        note: shiftNote(prevNote, -5),
                        offset: 0.0,
                      })
                    }
                  } else if (newCount < newArr.length) {
                    // Remove strings from the end
                    newArr = newArr.slice(0, newCount)
                  }
                  field.onChange(newArr)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Strings" />
                </SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7, 8, 9].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} Strings
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-10 flex gap-2 align-middle">
              {/* shift all strings up or down one half step */}
              <ButtonGroup>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Shift all down"
                  disabled={field.value.every((string: TuningString) => string.note === 'C0')}
                  onClick={() => {
                    const newArr = field.value.map((string: TuningString) => ({
                      ...string,
                      note: shiftNote(string.note, -1),
                    }))
                    field.onChange(newArr)
                  }}
                >
                  <ChevronDown size={15} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Shift all up"
                  disabled={field.value.every((string: TuningString) => string.note === 'C8')}
                  onClick={() => {
                    const newArr = field.value.map((string: TuningString) => ({
                      ...string,
                      note: shiftNote(string.note, 1),
                    }))
                    field.onChange(newArr)
                  }}
                >
                  <ChevronUp size={15} />
                </Button>
              </ButtonGroup>

              {/* Play/Stop all button */}
              <Button
                type="button"
                variant="outline"
                className={cn('ml-auto', playingAll && 'dark:border-red-500')}
                size="icon"
                aria-label={playingAll ? 'Stop all' : 'Play all'}
                onClick={() => {
                  if (playingAll) {
                    handleStopAll()
                  } else {
                    handlePlayAll(field.value)
                  }
                }}
              >
                {playingAll ? <Square /> : <Play />}
              </Button>
            </div>

            {/* strings */}
            <div className="space-y-2">
              {Array.isArray(field.value) &&
                field.value.map((stringObj, index) => {
                  const freq = noteToFrequency(stringObj.note, a4Value)
                  const offsetFreq =
                    freq != null ? freq * 2 ** ((stringObj.offset || 0) / 1200) : null
                  const isPlaying = playingIndex === index

                  return (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-8 shrink-0">{index + 1}</span>

                      {/* Note */}
                      <div className="flex grow items-center">
                        <Input
                          placeholder="Note"
                          className="rounded-r-none"
                          value={stringObj.note}
                          onChange={(e) => {
                            const val = e.target.value

                            const match = val.match(noteRegex)
                            if (!match) return

                            // only allow C0 to C8
                            const note = match[1]
                            const octave = parseInt(match[2])
                            if (octave < 0 || octave > 8 || (octave === 8 && note !== 'C')) return

                            const newArr = [...field.value]
                            newArr[index] = { ...newArr[index], note: val }
                            field.onChange(newArr)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                              e.preventDefault()
                              const semitone = e.key === 'ArrowUp' ? 1 : -1
                              const newArr = [...field.value]
                              newArr[index] = {
                                ...newArr[index],
                                note: shiftNote(stringObj.note, semitone),
                              }
                              field.onChange(newArr)
                            }
                          }}
                        />

                        {/* shift string up or down one half step */}
                        <div className="flex flex-col">
                          <Button
                            aria-label="Shift up"
                            className="border-input h-4.5 rounded-l-none rounded-br-none border-b-[0.5px] border-l-0 px-2
                              focus-visible:relative"
                            variant="outline"
                            type="button"
                            tabIndex={-1}
                            disabled={stringObj.note === 'C8'}
                            onClick={() => {
                              const newArr = [...field.value]
                              newArr[index] = {
                                ...newArr[index],
                                note: shiftNote(stringObj.note, 1),
                              }
                              field.onChange(newArr)
                            }}
                          >
                            <ChevronUp size={15} />
                          </Button>
                          <Button
                            aria-label="Shift down"
                            className="border-input h-4.5 rounded-l-none rounded-tr-none border-t-[0.5px] border-l-0 px-2
                              focus-visible:relative"
                            variant="outline"
                            type="button"
                            tabIndex={-1}
                            disabled={stringObj.note === 'C0'}
                            onClick={() => {
                              const newArr = [...field.value]
                              newArr[index] = {
                                ...newArr[index],
                                note: shiftNote(stringObj.note, -1),
                              }
                              field.onChange(newArr)
                            }}
                          >
                            <ChevronDown size={15} />
                          </Button>
                        </div>
                      </div>

                      {/* Offset */}
                      <NumberInput
                        placeholder="Offset"
                        value={stringObj.offset}
                        onValueChange={(value) => {
                          const newArr = [...field.value]
                          newArr[index] = { ...newArr[index], offset: Number(value) }
                          field.onChange(newArr)
                        }}
                        decimalScale={1}
                        min={-50}
                        max={50}
                      />

                      {/* Play/Stop button */}
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(isPlaying && 'dark:border-red-500')}
                        size="icon"
                        aria-label={isPlaying ? `Stop ${stringObj.note}` : `Play ${stringObj.note}`}
                        onClick={() => {
                          if (isPlaying) {
                            handleStopNote()
                          } else if (offsetFreq) {
                            handlePlayNote(offsetFreq, index)
                          }
                        }}
                        tabIndex={-1}
                      >
                        {isPlaying ? <Square /> : <Play />}
                      </Button>
                    </div>
                  )
                })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

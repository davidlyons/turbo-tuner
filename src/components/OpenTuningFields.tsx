'use client'

import { useFormContext } from 'react-hook-form'

import { noteRegex, type settingsType, type presetKeysType } from '@/lib/settings'

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

import { useEffect } from 'react'
import { useSampler } from '@/hooks/useSampler'
import { cn } from '@/lib/utils'

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function shiftNote(noteWithOctave: string, semitones: number) {
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

type TuningString = { note: string; offset: number }

export const OpenTuningFields = ({ activePreset }: { activePreset: presetKeysType }) => {
  const form = useFormContext<settingsType>()

  const { isAudioLoaded, playingIndex, isPlayingAll, playNote, playAll, stopAudio } = useSampler()

  // if activePreset changes and audio is playing, stop audio
  useEffect(() => {
    if (playingIndex !== null) stopAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePreset])

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

            {/* Number of strings */}
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

                    if (isPlayingAll) playAll(newArr)
                  } else if (newCount < newArr.length) {
                    // Remove strings from the end
                    newArr = newArr.slice(0, newCount)

                    if (isPlayingAll) playAll(newArr)
                    // if audio is playing for a removed string, stop audio
                    else if (playingIndex !== null && playingIndex > newCount - 1) stopAudio()
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

            {/* shift all strings up or down one half step */}
            <div className="ml-10 flex gap-2 align-middle">
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

                    if (isPlayingAll) playAll(newArr)
                    else if (playingIndex !== null) playNote(newArr[playingIndex], playingIndex)
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

                    if (isPlayingAll) playAll(newArr)
                    else if (playingIndex !== null) playNote(newArr[playingIndex], playingIndex)
                  }}
                >
                  <ChevronUp size={15} />
                </Button>
              </ButtonGroup>

              {/* Play/Stop all button */}
              <Button
                type="button"
                variant="outline"
                className={cn('ml-auto', isPlayingAll && 'dark:border-red-500')}
                size="icon"
                aria-label={isPlayingAll ? 'Stop all' : 'Play all'}
                onClick={() => {
                  if (isPlayingAll) {
                    stopAudio()
                  } else {
                    playAll(field.value)
                  }
                }}
                disabled={!isAudioLoaded}
              >
                {isPlayingAll ? <Square /> : <Play />}
              </Button>
            </div>

            {/* strings */}
            <div className="space-y-2">
              {Array.isArray(field.value) &&
                field.value.map((stringObj, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-8 shrink-0 opacity-80">{index + 1}</span>

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

                          if (playingIndex === index) playNote(newArr[index], index)
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

                            if (playingIndex === index) playNote(newArr[index], index)
                          }
                        }}
                      />

                      {/* shift string up or down one half step */}
                      <div className="flex flex-col">
                        <Button
                          aria-label="Shift up"
                          className="border-input h-4.5 rounded-l-none rounded-br-none
                            border-b-[0.5px] border-l-0 px-2 focus-visible:relative"
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

                            if (playingIndex === index) playNote(newArr[index], index)
                          }}
                        >
                          <ChevronUp size={15} />
                        </Button>
                        <Button
                          aria-label="Shift down"
                          className="border-input h-4.5 rounded-l-none rounded-tr-none
                            border-t-[0.5px] border-l-0 px-2 focus-visible:relative"
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

                            if (playingIndex === index) playNote(newArr[index], index)
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
                      className={cn(playingIndex === index && 'dark:border-red-500')}
                      size="icon"
                      aria-label={
                        playingIndex === index ? `Stop ${stringObj.note}` : `Play ${stringObj.note}`
                      }
                      onClick={() => {
                        if (playingIndex === index) {
                          stopAudio()
                        } else {
                          playNote(stringObj, index)
                        }
                      }}
                      disabled={!isAudioLoaded}
                      tabIndex={-1}
                    >
                      {playingIndex === index ? <Square /> : <Play />}
                    </Button>
                  </div>
                ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

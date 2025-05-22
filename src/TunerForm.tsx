'use client'

import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { presetKeysSchema, formSchema, settings } from '@/lib/settings'
import { settingsToText } from '@/lib/settings-to-text'
import { DownloadButton } from '@/components/DownloadButton'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { NumberInput } from './components/NumberInput'

// https://react-hook-form.com/
// https://zod.dev/

//

export function TunerForm() {
  const [activePreset, setActivePreset] = useState<z.infer<typeof presetKeysSchema>>('GUIT')

  type TunerModel = 'mini' | 'fullsize'
  const [activeModel, setActiveModel] = useState<TunerModel>('mini')

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: settings,
  })

  // https://react-hook-form.com/docs/useform/watch
  // form.watch()

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    const text = settingsToText(values)
    console.log(text)
  }

  return (
    <>
      <Form {...form}>
        <div className="grid-cols-3 gap-8 lg:grid">
          <div className="col-span-1">
            <h1 className="mb-9 text-3xl">Turbo Tuner Settings</h1>

            {/* Global settings fields */}
            <div className="mb-8 space-y-8">
              {/* Tuner Model RadioGroup */}
              <FormItem>
                <Label>Model</Label>
                <Select
                  value={activeModel}
                  onValueChange={(value: TunerModel) => setActiveModel(value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mini">ST-300 Mini</SelectItem>
                    <SelectItem value="fullsize">ST-300 Full Size</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>

              <FormField
                control={form.control}
                name="A4Default"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>A4 Default</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="A4 Default (Hz)"
                        value={field.value ?? ''}
                        onValueChange={(value) => field.onChange(Number(value))}
                        decimalScale={4}
                        min={300}
                        max={599}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Transpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transpose</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder="0"
                        value={field.value ?? ''}
                        onValueChange={(value) => field.onChange(Number(value))}
                        min={-9}
                        max={9}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="STAY_ON"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>Stay On</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="PASSTHROUGH_MODE"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={activeModel === 'mini'}
                      />
                    </FormControl>
                    <FormLabel>Passthrough Mode</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <img
              src={activeModel === 'fullsize' ? '/ST300fs.png' : '/ST300mini.png'}
              alt={
                activeModel === 'fullsize'
                  ? 'Turbo Tuner ST300 Full Size'
                  : 'Turbo Tuner ST300 Mini'
              }
              className="mx-auto my-11 max-h-96 object-contain"
            />
          </div>
          <div className="col-span-1">
            <ToggleGroup
              type="single"
              variant="outline"
              className="mb-8 w-full"
              size="lg"
              // https://www.radix-ui.com/primitives/docs/components/toggle-group#ensuring-there-is-always-a-value
              value={activePreset}
              onValueChange={(value: z.infer<typeof presetKeysSchema>) => {
                if (value) setActivePreset(value)
              }}
            >
              <ToggleGroupItem value="GUIT" aria-label="Edit GUIT preset">
                GUIT
              </ToggleGroupItem>
              <ToggleGroupItem value="BASS" aria-label="Edit BASS preset">
                BASS
              </ToggleGroupItem>
              <ToggleGroupItem value="CST1" aria-label="Edit CST1 preset">
                CST1
              </ToggleGroupItem>
              <ToggleGroupItem value="CST2" aria-label="Edit CST2 preset">
                CST2
              </ToggleGroupItem>
              <ToggleGroupItem value="CST3" aria-label="Edit CST3 preset">
                CST3
              </ToggleGroupItem>
            </ToggleGroup>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mb-8 space-y-8">
              <FormField
                control={form.control}
                name={`presets.${activePreset}.mode`}
                key={`presets.${activePreset}.mode`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OpenTuning">Open Tuning</SelectItem>
                        <SelectItem value="Temperament">Temperament</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show OpenTuning fields if mode is OpenTuning */}
              {form.watch(`presets.${activePreset}.mode`) === 'OpenTuning' && (
                <>
                  <FormField
                    control={form.control}
                    name={`presets.${activePreset}.OpenTuning.name`}
                    key={`presets.${activePreset}.OpenTuning.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`presets.${activePreset}.OpenTuning.A4`}
                    key={`presets.${activePreset}.OpenTuning.A4`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>A4</FormLabel>
                        <FormControl>
                          <NumberInput
                            placeholder="Frequency (Hz)"
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                            decimalScale={4}
                            min={300}
                            max={599}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`presets.${activePreset}.OpenTuning.Transpose`}
                    key={`presets.${activePreset}.OpenTuning.Transpose`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transpose</FormLabel>
                        <FormControl>
                          <NumberInput
                            placeholder="default"
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                            min={-9}
                            max={9}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Strings array */}
                  <FormField
                    control={form.control}
                    name={`presets.${activePreset}.OpenTuning.strings`}
                    key={`presets.${activePreset}.OpenTuning.strings`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strings</FormLabel>
                        <div className="space-y-2">
                          {Array.isArray(field.value) &&
                            field.value.map((stringObj, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="w-8 shrink-0">{idx + 1}</span>
                                <Input
                                  placeholder="Note"
                                  value={stringObj.note}
                                  onChange={(e) => {
                                    const newArr = [...field.value]
                                    newArr[idx] = { ...newArr[idx], note: e.target.value }
                                    field.onChange(newArr)
                                  }}
                                />
                                <NumberInput
                                  placeholder="Offset"
                                  value={stringObj.offset}
                                  onValueChange={(value) => {
                                    const newArr = [...field.value]
                                    newArr[idx] = { ...newArr[idx], offset: Number(value) }
                                    field.onChange(newArr)
                                  }}
                                  decimalScale={1}
                                  min={-50}
                                  max={50}
                                />
                              </div>
                            ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Show Temperament fields if mode is Temperament */}
              {form.watch(`presets.${activePreset}.mode`) === 'Temperament' && (
                <>
                  <FormField
                    control={form.control}
                    name={`presets.${activePreset}.Temperament.name`}
                    key={`presets.${activePreset}.Temperament.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`presets.${activePreset}.Temperament.A4`}
                    key={`presets.${activePreset}.Temperament.A4`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>A4</FormLabel>
                        <FormControl>
                          <NumberInput
                            placeholder="Frequency (Hz)"
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                            decimalScale={4}
                            min={300}
                            max={599}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`presets.${activePreset}.Temperament.Transpose`}
                    key={`presets.${activePreset}.Temperament.Transpose`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transpose</FormLabel>
                        <FormControl>
                          <NumberInput
                            placeholder="default"
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                            min={-9}
                            max={9}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Note offsets */}
                  <FormField
                    control={form.control}
                    name={`presets.${activePreset}.Temperament.offsets`}
                    key={`presets.${activePreset}.Temperament.offsets`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offsets</FormLabel>
                        <div className="space-y-2">
                          {field.value &&
                            Object.entries(field.value).map(([note, offset]) => (
                              <div key={note} className="flex items-center gap-2">
                                <span className="w-8 shrink-0">{note}</span>
                                <NumberInput
                                  placeholder="Offset"
                                  value={offset}
                                  onValueChange={(value) => {
                                    field.onChange({
                                      ...field.value,
                                      [note]: Number(value),
                                    })
                                  }}
                                  decimalScale={1}
                                  min={-50}
                                  max={50}
                                />
                              </div>
                            ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <DownloadButton text={settingsToText(form.getValues())} />

              <Button type="submit" className="w-full" variant="secondary">
                Console Log
              </Button>
            </form>
          </div>
        </div>
      </Form>
    </>
  )
}

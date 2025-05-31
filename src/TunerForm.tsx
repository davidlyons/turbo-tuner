'use client'

import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Input } from '@/components/ui/input'

import { formSchema, settings, type settingsType, type presetKeysType } from '@/lib/settings'
import { textToSettings } from '@/lib/text-to-settings'
import { settingsToText } from '@/lib/settings-to-text'

import { NumberInput } from '@/components/NumberInput'

import { TemperamentFields } from '@/components/TemperamentFields'
import { OpenTuningFields } from '@/components/OpenTuningFields'

export function TunerForm() {
  const [activePreset, setActivePreset] = useState<presetKeysType>('GUIT')

  type TunerModel = 'mini' | 'fullsize'
  const [activeModel, setActiveModel] = useState<TunerModel>('mini')

  // 1. Define your form.
  const form = useForm<settingsType>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: settings,
  })

  const presetMode = form.watch(`presets.${activePreset}.mode`)

  // 2. Define a submit handler.
  function onSubmit(values: settingsType) {
    // Do something with the form values. This will be type-safe and validated.
    const text = settingsToText(values)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'turbo-tuner-settings.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handler for file input to import settings
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const parsed = textToSettings(text)
    if (parsed) {
      form.reset(parsed)
    } else {
      alert('Failed to parse settings file.')
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid-cols-2 gap-8 md:grid">
            <div className="col-span-1">
              <h1 className="mb-9 text-3xl">Turbo Tuner Settings</h1>

              <div className="mb-8 space-y-8">
                <FormItem>
                  <Label htmlFor="settings-file">Import</Label>
                  <Input id="settings-file" type="file" accept=".txt" onChange={handleFileChange} />
                </FormItem>

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

                {/* Global settings fields */}
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
                          decimalScale={1}
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
                src={activeModel === 'fullsize' ? 'ST300fs.png' : 'ST300mini.png'}
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
                onValueChange={(value: presetKeysType) => {
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

              <div className="mb-8 space-y-8">
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

                <FormField
                  control={form.control}
                  name={`presets.${activePreset}.${presetMode}.name`}
                  key={`presets.${activePreset}.${presetMode}.name`}
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
                  name={`presets.${activePreset}.${presetMode}.A4`}
                  key={`presets.${activePreset}.${presetMode}.A4`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>A4</FormLabel>
                      <FormControl>
                        <NumberInput
                          placeholder="default"
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                          decimalScale={1}
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
                  name={`presets.${activePreset}.${presetMode}.Transpose`}
                  key={`presets.${activePreset}.${presetMode}.Transpose`}
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

                {presetMode === 'OpenTuning' && <OpenTuningFields activePreset={activePreset} />}

                {presetMode === 'Temperament' && <TemperamentFields activePreset={activePreset} />}

                <Button type="submit" className="w-full">
                  Download
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}

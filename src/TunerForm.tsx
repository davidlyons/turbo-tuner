'use client'
import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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

import { presetKeysSchema, formSchema, settings } from './settings'

// https://react-hook-form.com/
// https://zod.dev/

//

export function TunerForm() {
  const [activePreset, setActivePreset] = useState<z.infer<typeof presetKeysSchema>>('GUIT')

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  })

  // https://react-hook-form.com/docs/useform/watch
  form.watch()

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <>
      <ToggleGroup
        type="single"
        variant="outline"
        className="mb-8"
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

      <Form {...form}>
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
                    <SelectTrigger>
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

          <Button type="submit">Submit</Button>
        </form>
      </Form>

      <div>GUIT Mode: {form.getValues().presets.GUIT?.mode}</div>
      <div>BASS Mode: {form.getValues().presets.BASS?.mode}</div>
    </>
  )
}

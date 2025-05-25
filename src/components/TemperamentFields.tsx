'use client'

import { useFormContext } from 'react-hook-form'

import { z } from 'zod'
import { formSchema, presetKeysSchema } from '@/lib/settings'

import {
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { NumberInput } from '@/components/NumberInput'

export const TemperamentFields = ({
  activePreset,
}: {
  activePreset: z.infer<typeof presetKeysSchema>
}) => {
  const form = useFormContext<z.infer<typeof formSchema>>()

  return (
    <>
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
  )
}

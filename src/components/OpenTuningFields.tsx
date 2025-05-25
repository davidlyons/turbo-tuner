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

import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/NumberInput'

export const OpenTuningFields = ({
  activePreset,
}: {
  activePreset: z.infer<typeof presetKeysSchema>
}) => {
  const form = useFormContext<z.infer<typeof formSchema>>()

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
  )
}

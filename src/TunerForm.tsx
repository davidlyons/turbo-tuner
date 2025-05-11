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

// https://react-hook-form.com/
// https://zod.dev/

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  firstname: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  mode: z.enum(['Open Tuning', 'Temperament']),
})

export function TunerForm() {
  const [value, setValue] = useState('GUIT')

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      firstname: '',
      mode: 'Open Tuning',
    },
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
        value={value}
        onValueChange={(value) => {
          if (value) setValue(value)
        }}
      >
        <ToggleGroupItem value="GUIT" aria-label="Toggle GUIT">
          GUIT
        </ToggleGroupItem>
        <ToggleGroupItem value="BASS" aria-label="Toggle BASS">
          BASS
        </ToggleGroupItem>
        <ToggleGroupItem value="CST1" aria-label="Toggle CST1">
          CST1
        </ToggleGroupItem>
        <ToggleGroupItem value="CST2" aria-label="Toggle CST2">
          CST2
        </ToggleGroupItem>
        <ToggleGroupItem value="CST3" aria-label="Toggle CST3">
          CST3
        </ToggleGroupItem>
      </ToggleGroup>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mb-8 space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>This is your first name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mode"
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
                    <SelectItem value="Open Tuning">Open Tuning</SelectItem>
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

      <div>Username: {form.getValues().username}</div>
      <div>First name: {form.getValues().firstname}</div>
      <div>First name: {form.getValues().mode}</div>
    </>
  )
}

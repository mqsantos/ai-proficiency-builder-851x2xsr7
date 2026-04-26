import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { User } from '@/services/api'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  headline: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  slug: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, 'Only letters, numbers, hyphens, and underscores allowed')
    .optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  user: User
  onSubmit: (data: FormValues) => Promise<void>
  children: React.ReactNode
}

export function ProfileForm({ user, onSubmit, children }: Props) {
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || '',
      headline: user.headline || '',
      bio: user.bio || '',
      slug: user.slug || '',
    },
  })

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Senior AI Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. your-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

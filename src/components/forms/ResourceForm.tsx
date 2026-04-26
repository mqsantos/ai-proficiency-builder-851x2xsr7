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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Resource, getAllTopics, Topic } from '@/services/api'
import { useState, useEffect } from 'react'

const schema = z.object({
  title: z.string().min(2, 'Title is too short'),
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['Video', 'Article', 'Course', 'Documentation']),
  topic_id: z.string().min(1, 'Topic is required'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initialData?: Partial<Resource>
  onSubmit: (data: FormValues) => Promise<void>
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ResourceForm({
  initialData,
  onSubmit,
  children,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    if (open) {
      getAllTopics().then(setTopics).catch(console.error)
    }
  }, [open])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      url: initialData?.url || '',
      type: initialData?.type || 'Article',
      topic_id: initialData?.topic_id || '',
      description: initialData?.description || '',
    },
  })

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        title: initialData.title || '',
        url: initialData.url || '',
        type: initialData.type || 'Article',
        topic_id: initialData.topic_id || '',
        description: initialData.description || '',
      })
    } else if (open && !initialData) {
      form.reset({
        title: '',
        url: '',
        type: 'Article',
        topic_id: '',
        description: '',
      })
    }
  }, [open, initialData, form])

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Resource Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="Course">Course</SelectItem>
                      <SelectItem value="Documentation">Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Resource
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

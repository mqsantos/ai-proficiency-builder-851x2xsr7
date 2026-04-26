import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { UserProgress } from '@/services/api'
import { useState } from 'react'

const schema = z.object({
  status: z.enum(['None', 'Learning', 'Familiar', 'Expert', 'Mentor of Others']),
  notes: z.string().optional(),
  evidence_url: z.union([z.string().url('Must be a valid URL'), z.string().length(0)]).optional(),
  is_available_to_mentor: z.boolean().default(false),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initialData?: Partial<UserProgress>
  topicName: string
  onSubmit: (data: FormValues) => Promise<void>
  children: React.ReactNode
}

export function ProgressForm({ initialData, topicName, onSubmit, children }: Props) {
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: initialData?.status || 'None',
      notes: initialData?.notes || '',
      evidence_url: initialData?.evidence_url || '',
      is_available_to_mentor: initialData?.is_available_to_mentor || false,
    },
  })

  const statusValue = form.watch('status')

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Progress: {topicName}</DialogTitle>
          <DialogDescription>Record your proficiency and add evidence.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proficiency Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                      <SelectItem value="Familiar">Familiar</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                      <SelectItem value="Mentor of Others">Mentor of Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20 animate-fade-in-up">
              <h4 className="font-medium text-sm">Notes & Evidence</h4>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes & Experience</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your experience..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evidence_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidence URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {statusValue === 'Mentor of Others' && (
              <FormField
                control={form.control}
                name="is_available_to_mentor"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 animate-fade-in-up">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Available to mentor others</FormLabel>
                      <FormDescription>
                        Allow others to find you in the mentors directory.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Progress
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

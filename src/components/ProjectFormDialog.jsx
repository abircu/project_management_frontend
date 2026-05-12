import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const isoDateOrEmpty = z
  .string()
  .refine((s) => s === '' || /^\d{4}-\d{2}-\d{2}$/.test(s), { message: 'Invalid date' });

const schema = z
  .object({
    name: z.string().min(2, 'Min 2 characters'),
    description: z.string().optional(),
    status: z.enum(['pending', 'active', 'completed']),
    start_date: isoDateOrEmpty,
    end_date: isoDateOrEmpty,
  })
  .superRefine((data, ctx) => {
    const start = data.start_date;
    const end = data.end_date;
    if (start && end && end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be on or after the start date',
        path: ['end_date'],
      });
    }
  });

const emptyDefaults = {
  name: '',
  description: '',
  status: 'pending',
  start_date: '',
  end_date: '',
};

const toFormValues = (project) =>
  project
    ? {
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'pending',
        start_date: project.start_date ? project.start_date.slice(0, 10) : '',
        end_date: project.end_date ? project.end_date.slice(0, 10) : '',
      }
    : emptyDefaults;

export default function ProjectFormDialog({ open, onOpenChange, project, onSaved }) {
  const isEdit = Boolean(project);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(project),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(project));
  }, [open, project, form]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      description: values.description || null,
    };
    try {
      const { data } = isEdit
        ? await api.put(`/projects/${project.id}`, payload)
        : await api.post('/projects', payload);
      onSaved?.(data);
      onOpenChange(false);
    } catch (err) {
      form.setError('root', {
        message: err.response?.data?.message || 'Save failed',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Project' : 'New Project'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update project details below.' : 'Fill in the project details.'}
          </DialogDescription>
        </DialogHeader>

        {form.formState.errors.root && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        <Form {...form}>
          <form id="project-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="project name" {...field} />
                  </FormControl>
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
                    <Textarea rows={3} placeholder="Optional details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          void form.trigger(['start_date', 'end_date']);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          void form.trigger(['start_date', 'end_date']);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="project-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

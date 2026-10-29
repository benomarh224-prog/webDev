'use client'

import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { Briefcase, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'

import {
  useDeleteExperience,
  useExperiences,
  useSaveExperience,
} from '@/hooks/use-portfolio'
import { useToast } from '@/hooks/use-toast'
import type { Experience, ExperienceInput } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface ExperienceFormState {
  company: string
  role: string
  description: string
  location: string
  startDate: string
  endDate: string
  current: boolean
}

const EMPTY_FORM: ExperienceFormState = {
  company: '',
  role: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
}

function toForm(e: Experience): ExperienceFormState {
  return {
    company: e.company,
    role: e.role,
    description: e.description,
    location: e.location ?? '',
    startDate: new Date(e.startDate).toISOString().slice(0, 10),
    endDate: e.current
      ? ''
      : e.endDate
        ? new Date(e.endDate).toISOString().slice(0, 10)
        : '',
    current: e.current,
  }
}

function experienceRange(e: Experience): string {
  const start = format(new Date(e.startDate), 'MMM yyyy')
  if (e.current) return `${start} — Present`
  if (e.endDate) return `${start} — ${format(new Date(e.endDate), 'MMM yyyy')}`
  return start
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

interface FormErrors {
  company?: string
  role?: string
  description?: string
  startDate?: string
  date?: string
}

export function ExperienceManager() {
  const { data, isLoading } = useExperiences()
  const saveExperience = useSaveExperience()
  const deleteExperience = useDeleteExperience()
  const { toast } = useToast()

  /** undefined = dialog closed, null = create mode, Experience = edit mode */
  const [editing, setEditing] = useState<Experience | null | undefined>(undefined)
  const [form, setForm] = useState<ExperienceFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  const experiences = data?.experiences ?? []

  const dialogOpen = editing !== undefined

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditing(null)
  }

  const openEdit = (exp: Experience) => {
    setForm(toForm(exp))
    setErrors({})
    setEditing(exp)
  }

  const closeDialog = () => setEditing(undefined)

  const handleDelete = (id: string) => {
    deleteExperience.mutate(id, {
      onSuccess: () => toast({ title: 'Experience deleted' }),
      onError: (err) =>
        toast({
          variant: 'destructive',
          title: 'Delete failed',
          description: errorMessage(err),
        }),
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: FormErrors = {}
    if (!form.company.trim()) nextErrors.company = 'Company is required.'
    if (!form.role.trim()) nextErrors.role = 'Role is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'
    if (!form.startDate) nextErrors.startDate = 'Start date is required.'
    if (!form.current && form.endDate && form.startDate && form.endDate < form.startDate) {
      nextErrors.date = 'End date must be on or after the start date.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload: ExperienceInput = {
      company: form.company.trim(),
      role: form.role.trim(),
      description: form.description.trim(),
      location: form.location.trim() || null,
      startDate: new Date(form.startDate).toISOString(),
      endDate: !form.current && form.endDate ? new Date(form.endDate).toISOString() : null,
      current: form.current,
      sortOrder: editing?.sortOrder ?? 0,
    }

    saveExperience.mutate(
      { id: editing?.id, data: payload },
      {
        onSuccess: () => {
          toast({
            title: editing ? 'Experience updated' : 'Experience created',
            description: `${payload.role} at ${payload.company}`,
          })
          closeDialog()
        },
        onError: (err) =>
          toast({
            variant: 'destructive',
            title: 'Save failed',
            description: errorMessage(err),
          }),
      }
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Experience</h2>
          <p className="text-sm text-muted-foreground">
            {experiences.length} {experiences.length === 1 ? 'role' : 'roles'} · your professional journey
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" className="size-4" />
          New experience
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Briefcase aria-hidden="true" className="size-10 text-muted-foreground" />
          <div>
            <p className="font-display font-semibold">No experience yet</p>
            <p className="text-sm text-muted-foreground">
              Add the roles and positions you have held.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" className="size-4" />
            Add experience
          </Button>
        </div>
      ) : (
        <div className="relative space-y-4">
          {experiences.map((e) => (
            <Card key={e.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-semibold">{e.role}</h3>
                    {e.current ? (
                      <Badge className="border-transparent bg-primary/10 text-primary">
                        Current
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-sm text-primary">{e.company}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{experienceRange(e)}</p>
                  {e.location ? (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin aria-hidden="true" className="size-3" />
                      {e.location}
                    </p>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {e.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Edit ${e.role} at ${e.company}`}
                    onClick={() => openEdit(e)}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        aria-label={`Delete ${e.role} at ${e.company}`}
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete experience?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove {e.role} at {e.company}. This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className={buttonVariants({ variant: 'destructive' })}
                          onClick={() => handleDelete(e.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit experience' : 'New experience'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the details of this position.'
                : 'Add a role to your professional journey.'}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="exp-company">
                Company <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exp-company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                placeholder="Acme Inc."
                aria-invalid={Boolean(errors.company)}
              />
              {errors.company ? (
                <p className="text-xs text-destructive">{errors.company}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exp-role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="Frontend Engineer"
                aria-invalid={Boolean(errors.role)}
              />
              {errors.role ? <p className="text-xs text-destructive">{errors.role}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="exp-description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What you did, what you built, what you learned"
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description ? (
                <p className="text-xs text-destructive">{errors.description}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-location">Location</Label>
              <Input
                id="exp-location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Remote · Berlin, Germany"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exp-startDate">
                  Start date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="exp-startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  aria-invalid={Boolean(errors.startDate)}
                />
                {errors.startDate ? (
                  <p className="text-xs text-destructive">{errors.startDate}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-endDate">End date</Label>
                <Input
                  id="exp-endDate"
                  type="date"
                  disabled={form.current}
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  aria-invalid={Boolean(errors.date)}
                />
                {errors.date ? <p className="text-xs text-destructive">{errors.date}</p> : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="exp-current">I currently work here</Label>
                <p className="text-xs text-muted-foreground">
                  The end date is left open and shown as Present
                </p>
              </div>
              <Switch
                id="exp-current"
                checked={form.current}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, current: checked, endDate: checked ? '' : f.endDate }))
                }
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={saveExperience.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveExperience.isPending}>
                {saveExperience.isPending ? (
                  <>
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

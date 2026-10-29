'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Pencil, Plus, Trash2, Wrench } from 'lucide-react'

import { useDeleteSkill, useSaveSkill, useSkills } from '@/hooks/use-portfolio'
import { useToast } from '@/hooks/use-toast'
import type { Skill, SkillInput } from '@/lib/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'

const BASE_CATEGORIES = ['Frontend', 'Backend', 'Mobile', 'Design & Tools', 'Other']

interface SkillFormState {
  name: string
  category: string
  level: number
}

const EMPTY_FORM: SkillFormState = { name: '', category: 'Frontend', level: 80 }

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export function SkillsManager() {
  const { data, isLoading } = useSkills()
  const saveSkill = useSaveSkill()
  const deleteSkill = useDeleteSkill()
  const { toast } = useToast()

  /** undefined = dialog closed, null = create mode, Skill = edit mode */
  const [editing, setEditing] = useState<Skill | null | undefined>(undefined)
  const [form, setForm] = useState<SkillFormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  const skills = data?.skills ?? []

  const categories = useMemo(() => {
    const set = new Set<string>(BASE_CATEGORIES)
    for (const s of skills) set.add(s.category)
    return Array.from(set)
  }, [skills])

  const groups = useMemo(() => {
    const map = new Map<string, Skill[]>()
    for (const s of skills) {
      const arr = map.get(s.category) ?? []
      arr.push(s)
      map.set(s.category, arr)
    }
    return Array.from(map.entries())
  }, [skills])

  const dialogOpen = editing !== undefined

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setError(null)
    setEditing(null)
  }

  const openEdit = (skill: Skill) => {
    setForm({ name: skill.name, category: skill.category, level: skill.level })
    setError(null)
    setEditing(skill)
  }

  const closeDialog = () => setEditing(undefined)

  const handleDelete = (id: string) => {
    deleteSkill.mutate(id, {
      onSuccess: () => toast({ title: 'Skill deleted' }),
      onError: (err) =>
        toast({ variant: 'destructive', title: 'Delete failed', description: errorMessage(err) }),
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    const payload: SkillInput = {
      name: form.name.trim(),
      category: form.category,
      level: form.level,
      sortOrder: editing?.sortOrder ?? 0,
    }
    saveSkill.mutate(
      { id: editing?.id, data: payload },
      {
        onSuccess: () => {
          toast({
            title: editing ? 'Skill updated' : 'Skill created',
            description: payload.name,
          })
          closeDialog()
        },
        onError: (err) =>
          toast({ variant: 'destructive', title: 'Save failed', description: errorMessage(err) }),
      }
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Skills</h2>
          <p className="text-sm text-muted-foreground">
            {skills.length} {skills.length === 1 ? 'skill' : 'skills'} · grouped by category
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" className="size-4" />
          New skill
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Wrench aria-hidden="true" className="size-10 text-muted-foreground" />
          <div>
            <p className="font-display font-semibold">No skills yet</p>
            <p className="text-sm text-muted-foreground">
              Add the technologies you work with.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" className="size-4" />
            Add your first skill
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([category, list]) => (
            <Card key={category} className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display font-semibold">{category}</h3>
                <Badge variant="secondary">
                  {list.length} {list.length === 1 ? 'skill' : 'skills'}
                </Badge>
              </div>
              <div>
                {list.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b py-3 last:border-0"
                  >
                    <span className="w-32 shrink-0 truncate text-sm font-medium sm:w-44">
                      {s.name}
                    </span>
                    <div className="flex min-w-[140px] flex-1 items-center gap-3">
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                        role="img"
                        aria-label={`${s.name} proficiency ${s.level} out of 100`}
                      >
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${s.level}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                        {s.level}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Edit ${s.name}`}
                        onClick={() => openEdit(s)}
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            aria-label={`Delete ${s.name}`}
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete skill?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove {s.name}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className={buttonVariants({ variant: 'destructive' })}
                              onClick={() => handleDelete(s.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit skill' : 'New skill'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update this skill and its proficiency.'
                : 'Add a technology to your skill set.'}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="skill-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="skill-name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }))
                  if (error) setError(null)
                }}
                placeholder="React"
                aria-invalid={Boolean(error)}
              />
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger id="skill-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Proficiency</span>
                <span className="font-display text-2xl font-bold text-primary">
                  {form.level}%
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[form.level]}
                onValueChange={(values) =>
                  setForm((f) => ({ ...f, level: values[0] ?? f.level }))
                }
                aria-label="Skill proficiency level"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={saveSkill.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveSkill.isPending}>
                {saveSkill.isPending ? (
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

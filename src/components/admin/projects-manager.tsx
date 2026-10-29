'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { FolderGit2, Loader2, Minus, Pencil, Plus, Star, Trash2 } from 'lucide-react'

import {
  useDeleteProject,
  useProjects,
  useSaveProject,
} from '@/hooks/use-portfolio'
import { useToast } from '@/hooks/use-toast'
import type { Project, ProjectInput } from '@/lib/types'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

interface ProjectFormState {
  title: string
  description: string
  content: string
  category: string
  technologies: string
  imageUrl: string
  demoUrl: string
  repoUrl: string
  featured: boolean
  status: 'published' | 'draft'
}

const EMPTY_FORM: ProjectFormState = {
  title: '',
  description: '',
  content: '',
  category: 'Web App',
  technologies: '',
  imageUrl: '',
  demoUrl: '',
  repoUrl: '',
  featured: false,
  status: 'published',
}

function toForm(p: Project): ProjectFormState {
  return {
    title: p.title,
    description: p.description,
    content: p.content ?? '',
    category: p.category,
    technologies: p.technologies.join(', '),
    imageUrl: p.imageUrl ?? '',
    demoUrl: p.demoUrl ?? '',
    repoUrl: p.repoUrl ?? '',
    featured: p.featured,
    status: p.status === 'draft' ? 'draft' : 'published',
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'draft') {
    return <Badge variant="secondary">Draft</Badge>
  }
  return (
    <Badge
      variant="outline"
      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    >
      Published
    </Badge>
  )
}

/** Remounted via `key` whenever the URL changes, so the error state resets naturally. */
function ImageUrlPreview({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)

  const trimmed = src.trim()
  if (!trimmed || failed) return null

  return (
    <div className="mt-2 w-fit overflow-hidden rounded-md border">
      <Image
        src={trimmed}
        alt="Project image preview"
        width={320}
        height={180}
        unoptimized
        className="h-[180px] w-[320px] object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

interface RowActionsProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

function RowActions({ project, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label={`Edit ${project.title}`}
        onClick={() => onEdit(project)}
      >
        <Pencil aria-hidden="true" className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            aria-label={`Delete ${project.title}`}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {project.title}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={() => onDelete(project.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function ProjectsManager() {
  const { data, isLoading } = useProjects(true)
  const saveProject = useSaveProject()
  const deleteProject = useDeleteProject()
  const { toast } = useToast()

  /** undefined = dialog closed, null = create mode, Project = edit mode */
  const [editing, setEditing] = useState<Project | null | undefined>(undefined)
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})

  const projects = data?.projects ?? []
  const published = projects.filter((p) => p.status === 'published').length
  const drafts = projects.filter((p) => p.status === 'draft').length

  const dialogOpen = editing !== undefined

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditing(null)
  }

  const openEdit = (project: Project) => {
    setForm(toForm(project))
    setErrors({})
    setEditing(project)
  }

  const closeDialog = () => setEditing(undefined)

  const handleDelete = (id: string) => {
    deleteProject.mutate(id, {
      onSuccess: () => toast({ title: 'Project deleted' }),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: 'Delete failed',
          description: errorMessage(error),
        }),
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: { title?: string; description?: string } = {}
    if (!form.title.trim()) nextErrors.title = 'Title is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'
    setErrors(nextErrors)
    if (nextErrors.title || nextErrors.description) return

    const payload: ProjectInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      content: form.content.trim() || null,
      technologies: form.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      imageUrl: form.imageUrl.trim() || null,
      demoUrl: form.demoUrl.trim() || null,
      repoUrl: form.repoUrl.trim() || null,
      category: form.category.trim() || 'Web App',
      featured: form.featured,
      status: form.status,
      sortOrder: editing?.sortOrder ?? 0,
    }

    saveProject.mutate(
      { id: editing?.id, data: payload },
      {
        onSuccess: () => {
          toast({
            title: editing ? 'Project updated' : 'Project created',
            description: payload.title,
          })
          closeDialog()
        },
        onError: (error) =>
          toast({
            variant: 'destructive',
            title: 'Save failed',
            description: errorMessage(error),
          }),
      }
    )
  }

  const actions = (p: Project) => (
    <RowActions project={p} onEdit={openEdit} onDelete={handleDelete} />
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Projects</h2>
          <p className="text-sm text-muted-foreground">
            {published} published · {drafts} {drafts === 1 ? 'draft' : 'drafts'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" className="size-4" />
          New project
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FolderGit2 aria-hidden="true" className="size-10 text-muted-foreground" />
          <div>
            <p className="font-display font-semibold">No projects yet</p>
            <p className="text-sm text-muted-foreground">
              Showcase your work by adding your first project.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus aria-hidden="true" className="size-4" />
            Create your first project
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-xs">
                      <p className="font-medium">{p.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-center">
                      {p.featured ? (
                        <Star
                          aria-label="Featured"
                          className="mx-auto size-4 fill-primary text-primary"
                        />
                      ) : (
                        <Minus aria-hidden="true" className="mx-auto size-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {p.sortOrder}
                    </TableCell>
                    <TableCell>{actions(p)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile stacked cards */}
          <div className="space-y-3 md:hidden">
            {projects.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{p.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{p.category}</Badge>
                  {p.featured ? (
                    <Star aria-label="Featured" className="size-4 fill-primary text-primary" />
                  ) : null}
                  <span>#{p.sortOrder}</span>
                </div>
                <div className="mt-3">{actions(p)}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit project' : 'New project'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the details of this project.'
                : 'Add a new project to your portfolio.'}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="project-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="My awesome app"
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="project-description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="A short summary shown on the portfolio card"
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description ? (
                <p className="text-xs text-destructive">{errors.description}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-content">Full case study (optional)</Label>
              <Textarea
                id="project-content"
                rows={5}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Longer write-up shown on the project detail page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-category">Category</Label>
              <Input
                id="project-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Web App"
              />
              <p className="text-xs text-muted-foreground">
                Free text — e.g. Web App, Mobile, Open Source
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-technologies">Technologies</Label>
              <Input
                id="project-technologies"
                value={form.technologies}
                onChange={(e) => setForm((f) => ({ ...f, technologies: e.target.value }))}
                placeholder="React, Next.js, Prisma"
              />
              <p className="text-xs text-muted-foreground">Comma separated</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-imageUrl">Image URL</Label>
              <Input
                id="project-imageUrl"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://example.com/screenshot.png"
              />
              <ImageUrlPreview key={form.imageUrl} src={form.imageUrl} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-demoUrl">Demo URL</Label>
              <Input
                id="project-demoUrl"
                value={form.demoUrl}
                onChange={(e) => setForm((f) => ({ ...f, demoUrl: e.target.value }))}
                placeholder="https://demo.example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-repoUrl">Repository URL</Label>
              <Input
                id="project-repoUrl"
                value={form.repoUrl}
                onChange={(e) => setForm((f) => ({ ...f, repoUrl: e.target.value }))}
                placeholder="https://github.com/you/project"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v === 'draft' ? 'draft' : 'published' }))
                  }
                >
                  <SelectTrigger id="project-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="project-featured">Featured project</Label>
                  <p className="text-xs text-muted-foreground">
                    Shown with a star on the portfolio
                  </p>
                </div>
                <Switch
                  id="project-featured"
                  checked={form.featured}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, featured: checked }))}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={saveProject.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveProject.isPending}>
                {saveProject.isPending ? (
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

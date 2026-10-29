'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink, FolderGit2, Github, Star } from 'lucide-react'
import { useProjects } from '@/hooks/use-portfolio'
import type { Project } from '@/lib/types'
import { SectionHeading } from './section-heading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const ALL_CATEGORIES = 'All'

function isExternalSrc(src: string): boolean {
  return /^https?:\/\//i.test(src)
}

function ProjectImage({
  project,
  sizes,
  className,
}: {
  project: Project
  sizes?: string
  className?: string
}) {
  const [error, setError] = useState(false)

  if (!project.imageUrl || error) {
    return (
      <div
        role="img"
        aria-label={`${project.title} preview`}
        className="flex h-full w-full items-center justify-center bg-muted"
      >
        <FolderGit2 className="h-10 w-10 text-muted-foreground/60" />
      </div>
    )
  }

  return (
    <Image
      src={project.imageUrl}
      alt={`${project.title} preview`}
      fill
      sizes={sizes ?? '(max-width: 640px) 100vw, 50vw'}
      onError={() => setError(true)}
      unoptimized={isExternalSrc(project.imageUrl)}
      className={cn('object-cover', className)}
    />
  )
}

function ProjectsSkeleton() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Projects() {
  const { data, isLoading } = useProjects()
  const [category, setCategory] = useState<string>(ALL_CATEGORIES)
  const [selected, setSelected] = useState<Project | null>(null)

  const projects = useMemo(() => data?.projects ?? [], [data])
  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(projects.map((project) => project.category).filter(Boolean)))],
    [projects]
  )
  const filtered = useMemo(
    () => (category === ALL_CATEGORIES ? projects : projects.filter((project) => project.category === category)),
    [category, projects]
  )

  const selectedParagraphs = selected
    ? (selected.content && selected.content.trim().length > 0 ? selected.content : selected.description)
        .split('\n\n')
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : []

  return (
    <section id="projects" className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Selected work"
          title="Featured projects"
          description="A hand-picked selection of things I've designed and built."
        />

        {isLoading ? (
          <ProjectsSkeleton />
        ) : projects.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">No projects yet — check back soon.</p>
        ) : (
          <>
            <div
              role="group"
              aria-label="Filter projects by category"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={cn(
                    'min-h-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    category === item
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.05, ease: 'easeOut' }}
                >
                  <Card className="group flex h-full flex-col gap-0 overflow-hidden pb-0 pt-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden">
                      <ProjectImage
                        project={project}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"
                      />
                      <Badge className="absolute left-3 top-3 border-transparent bg-background/80 text-foreground backdrop-blur">
                        {project.category}
                      </Badge>
                      {project.featured ? (
                        <span
                          title="Featured project"
                          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
                        >
                          <Star aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                          <span className="sr-only">Featured</span>
                        </span>
                      ) : null}
                    </div>

                    <CardContent className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-primary">
                        {project.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {project.technologies.slice(0, 3).map((technology) => (
                          <Badge key={technology} variant="secondary" className="text-[11px]">
                            {technology}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 ? (
                          <span className="text-[11px] text-muted-foreground">
                            +{project.technologies.length - 3} more
                          </span>
                        ) : null}
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between px-5 pb-5 pt-0">
                      <button
                        type="button"
                        onClick={() => setSelected(project)}
                        className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                      >
                        Case study
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        {project.demoUrl ? (
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Live demo of ${project.title}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : null}
                        {project.repoUrl ? (
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={project.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Source code of ${project.title}`}
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => (open ? undefined : setSelected(null))}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
          {selected ? (
            <div className="custom-scrollbar max-h-[85vh] overflow-y-auto">
              <div className="relative aspect-video w-full overflow-hidden">
                <ProjectImage project={selected} sizes="(max-width: 768px) 100vw, 672px" />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"
                />
              </div>

              <div className="p-6">
                <DialogHeader className="text-left">
                  <DialogTitle className="font-display text-2xl">{selected.title}</DialogTitle>
                  <DialogDescription className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="secondary">{selected.category}</Badge>
                    <Badge variant="outline" className="capitalize">
                      {selected.status.replace(/-/g, ' ')}
                    </Badge>
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-5 space-y-4">
                  {selectedParagraphs.map((paragraph, index) => (
                    <p key={index} className="text-sm leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {selected.technologies.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold">Technologies</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.technologies.map((technology) => (
                        <Badge key={technology} variant="secondary">
                          {technology}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selected.demoUrl || selected.repoUrl ? (
                  <DialogFooter className="mt-8">
                    {selected.demoUrl ? (
                      <Button asChild>
                        <a href={selected.demoUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Live demo
                        </a>
                      </Button>
                    ) : null}
                    {selected.repoUrl ? (
                      <Button variant="outline" asChild>
                        <a href={selected.repoUrl} target="_blank" rel="noreferrer">
                          <Github className="h-4 w-4" />
                          Source code
                        </a>
                      </Button>
                    ) : null}
                  </DialogFooter>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { format, isValid } from 'date-fns'
import { MapPin } from 'lucide-react'
import { useExperiences } from '@/hooks/use-portfolio'
import { SectionHeading } from './section-heading'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function formatSafe(value: string): string {
  const date = new Date(value)
  return isValid(date) ? format(date, 'MMM yyyy') : value
}

function formatDateRange(startDate: string, endDate: string | null, current: boolean): string {
  const start = formatSafe(startDate)
  if (current) return `${start} — Present`
  if (endDate) return `${start} — ${formatSafe(endDate)}`
  return start
}

function ExperienceSkeleton() {
  return (
    <div className="relative space-y-8 pl-8 before:absolute before:bottom-1 before:left-[7px] before:top-1 before:w-px before:bg-border">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="relative">
          <span aria-hidden="true" className="absolute -left-[31.5px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-border bg-background" />
          <div className="space-y-3 rounded-xl border bg-card p-5 md:p-6">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ExperienceSection() {
  const { data, isLoading } = useExperiences()
  const experiences = data?.experiences ?? []

  return (
    <section id="experience" className="bg-muted/40 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Career path"
          title="Work experience"
          description="Roles and teams that shaped how I build software."
        />

        <div className="mt-12 md:mt-16">
          {isLoading ? (
            <ExperienceSkeleton />
          ) : experiences.length === 0 ? (
            <p className="text-center text-muted-foreground">No experience listed yet — check back soon.</p>
          ) : (
            <div className="relative space-y-8 pl-8 before:absolute before:bottom-1 before:left-[7px] before:top-1 before:w-px before:bg-border">
              {experiences.map((experience, index) => (
                <motion.article
                  key={experience.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: Math.min(index, 4) * 0.08, ease: 'easeOut' }}
                  className="relative"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -left-[31.5px] top-1.5 h-3.5 w-3.5 rounded-full border-2',
                      experience.current
                        ? 'border-primary bg-primary ring-4 ring-primary/20'
                        : 'border-border bg-background'
                    )}
                  />
                  <div className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold">{experience.role}</h3>
                        <p className="mt-0.5 text-sm font-medium text-primary">{experience.company}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {formatDateRange(experience.startDate, experience.endDate, experience.current)}
                      </Badge>
                    </div>
                    {experience.location ? (
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {experience.location}
                      </p>
                    ) : null}
                    {experience.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{experience.description}</p>
                    ) : null}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

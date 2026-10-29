'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSkills } from '@/hooks/use-portfolio'
import type { Skill } from '@/lib/types'
import { SectionHeading } from './section-heading'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SkillGroup {
  category: string
  skills: Skill[]
}

function groupByCategory(skills: Skill[]): SkillGroup[] {
  const groups: SkillGroup[] = []
  for (const skill of skills) {
    const existing = groups.find((group) => group.category === skill.category)
    if (existing) {
      existing.skills.push(skill)
    } else {
      groups.push({ category: skill.category, skills: [skill] })
    }
  }
  return groups
}

function SkillBar({ skill }: { skill: Skill }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{skill.name}</span>
        <span className="text-sm text-muted-foreground">{skill.level}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${skill.name} proficiency`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function SkillsSkeleton() {
  return (
    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-9" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function Skills() {
  const { data, isLoading } = useSkills()
  const groups = useMemo(() => groupByCategory(data?.skills ?? []), [data])

  return (
    <section id="skills" className="bg-muted/40 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="My toolbox"
          title="Skills & technologies"
          description="The tools and technologies I reach for to bring ideas to life."
        />

        <div className="mt-12 md:mt-16">
          {isLoading ? (
            <SkillsSkeleton />
          ) : groups.length === 0 ? (
            <p className="text-center text-muted-foreground">No skills listed yet — check back soon.</p>
          ) : (
            <Tabs defaultValue={groups[0]?.category} className="w-full">
              <TabsList className="h-auto w-full flex-wrap justify-center gap-1.5 py-1.5 sm:w-auto">
                {groups.map((group) => (
                  <TabsTrigger key={group.category} value={group.category} className="min-h-9 flex-none gap-2 px-4 py-1.5">
                    {group.category}
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold leading-none text-primary">
                      {group.skills.length}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {groups.map((group) => (
                <TabsContent key={group.category} value={group.category} className="mt-8">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="grid gap-x-8 gap-y-6 sm:grid-cols-2"
                  >
                    {group.skills.map((skill) => (
                      <SkillBar key={skill.id} skill={skill} />
                    ))}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </section>
  )
}

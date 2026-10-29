'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Code, FileCode2, Mail, User, Zap } from 'lucide-react'
import { useProjects, useSettings } from '@/hooks/use-portfolio'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const FLOAT_CHIPS = [
  { label: 'React', icon: Code, position: '-left-8 top-12', duration: 3.2, delay: 0 },
  { label: 'TypeScript', icon: FileCode2, position: '-right-6 top-1/3', duration: 3.8, delay: 0.6 },
  { label: 'Next.js', icon: Zap, position: 'left-8 -bottom-5', duration: 4.2, delay: 1.1 },
] as const

function isExternalSrc(src: string): boolean {
  return /^https?:\/\//i.test(src)
}

function HeroAvatar({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        role="img"
        aria-label={`Portrait of ${name}`}
        className="flex aspect-[3/4] w-full items-center justify-center rounded-3xl border bg-muted ring-4 ring-primary/10"
      >
        <User className="h-16 w-16 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={`Portrait of ${name}`}
      width={432}
      height={576}
      priority
      onError={() => setError(true)}
      unoptimized={isExternalSrc(src)}
      className="aspect-[3/4] w-full rounded-3xl border object-cover ring-4 ring-primary/10"
    />
  )
}

function HeroSkeleton() {
  return (
    <div className="max-w-xl space-y-5">
      <Skeleton className="h-7 w-44 rounded-full" />
      <Skeleton className="h-5 w-52" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-5/6" />
      <div className="flex gap-3 pt-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid max-w-md grid-cols-3 gap-4 pt-5">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </div>
  )
}

export function Hero() {
  const { data: settingsData, isLoading } = useSettings()
  const { data: projectsData } = useProjects()
  const settings = settingsData?.settings

  const ownerName = settings?.ownerName ?? 'Alex Carter'
  const heroTitle = settings?.heroTitle ?? 'Full-Stack Developer & UI Designer'
  const heroSubtitle =
    settings?.heroSubtitle ??
    'I design and build fast, accessible web applications — from pixel-perfect interfaces to rock-solid APIs.'
  const projectCount = projectsData?.projects.length

  const stats = [
    { value: `${settings?.yearsExperience ?? 6}+`, label: 'Years experience' },
    { value: projectCount !== undefined ? String(projectCount) : '—', label: 'Projects shipped' },
    { value: `${settings?.clientsCount ?? 12}+`, label: 'Happy clients' },
  ]

  return (
    <section id="home" className="relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36">
      <div
        aria-hidden="true"
        className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_65%_60%_at_50%_35%,black_35%,transparent_75%)]"
      />
      <div aria-hidden="true" className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden="true" className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        {isLoading ? (
          <HeroSkeleton />
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-xl">
            {settings?.availableForWork ? (
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Available for work
                </span>
              </motion.div>
            ) : null}

            <motion.p variants={itemVariants} className="mt-5 font-display text-lg text-muted-foreground">
              Hi, I&apos;m <span className="font-semibold text-primary">{ownerName}</span>
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="mt-2 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              {heroTitle}
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {heroSubtitle}
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="group">
                <a href="#projects">
                  View my work
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#contact">
                  <Mail />
                  Get in touch
                </a>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 grid max-w-md grid-cols-3 divide-x divide-border">
              {stats.map((stat) => (
                <div key={stat.label} className="px-4 first:pl-0 last:pr-0">
                  <p className="font-display text-2xl font-bold md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div aria-hidden="true" className="absolute inset-0 rotate-3 rounded-3xl border border-primary/20" />
          <div aria-hidden="true" className="absolute inset-0 -rotate-2 rounded-3xl border border-primary/10" />

          {isLoading ? (
            <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
          ) : (
            <>
              <HeroAvatar src={settings?.avatarUrl || '/images/avatar.png'} name={ownerName} />
              {FLOAT_CHIPS.map((chip) => (
                <motion.span
                  key={chip.label}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: chip.duration, repeat: Infinity, ease: 'easeInOut', delay: chip.delay }}
                  className={`absolute ${chip.position} hidden items-center gap-1.5 rounded-lg border bg-card/90 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur sm:flex`}
                >
                  <chip.icon className="h-3.5 w-3.5 text-primary" />
                  {chip.label}
                </motion.span>
              ))}
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}

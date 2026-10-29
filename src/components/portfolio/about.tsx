'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Download,
  Dribbble,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Palette,
  ShieldCheck,
  Twitter,
  User,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSettings } from '@/hooks/use-portfolio'
import type { SiteSettings } from '@/lib/types'
import { SectionHeading } from './section-heading'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface SocialLink {
  label: string
  href: string
  icon: LucideIcon
}

const DEFAULT_ABOUT =
  "I'm a full-stack developer and UI designer who loves taking products from rough sketch to production. For the past several years I've helped startups and established teams ship fast, accessible web applications.\n\nMy sweet spot is the intersection of engineering and design — clean, maintainable architecture underneath and delightful, thoughtful interfaces on top. When I'm not coding, you'll find me sketching UI ideas, contributing to open source, or hunting for the perfect espresso."

const HIGHLIGHTS: Array<{ icon: LucideIcon; title: string; description: string }> = [
  { icon: Zap, title: 'Performance first', description: 'Sub-second loads and optimized assets, every time.' },
  { icon: Palette, title: 'Design-driven', description: 'Interfaces that users genuinely enjoy working with.' },
  { icon: ShieldCheck, title: 'Reliable & secure', description: 'Type-safe, tested and maintainable code.' },
]

function isExternalSrc(src: string): boolean {
  return /^https?:\/\//i.test(src)
}

function getSocialLinks(settings: SiteSettings | undefined): SocialLink[] {
  if (!settings) return []
  const links: Array<SocialLink | null> = [
    settings.githubUrl ? { label: 'GitHub', href: settings.githubUrl, icon: Github } : null,
    settings.linkedinUrl ? { label: 'LinkedIn', href: settings.linkedinUrl, icon: Linkedin } : null,
    settings.twitterUrl ? { label: 'Twitter', href: settings.twitterUrl, icon: Twitter } : null,
    settings.dribbbleUrl ? { label: 'Dribbble', href: settings.dribbbleUrl, icon: Dribbble } : null,
  ]
  return links.filter((link): link is SocialLink => link !== null)
}

function AboutAvatar({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        role="img"
        aria-label={`Portrait of ${name}`}
        className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border bg-muted"
      >
        <User className="h-16 w-16 text-muted-foreground/40" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={`Portrait of ${name}`}
      width={480}
      height={600}
      onError={() => setError(true)}
      unoptimized={isExternalSrc(src)}
      className="aspect-[4/5] w-full rounded-2xl border object-cover"
    />
  )
}

export function About() {
  const { data, isLoading } = useSettings()
  const settings = data?.settings

  const ownerName = settings?.ownerName ?? 'Alex Carter'
  const email = settings?.email ?? 'hello@alexcarter.dev'
  const location = settings?.location ?? 'San Francisco, CA'
  const years = settings?.yearsExperience ?? 6
  const avatarSrc = settings?.avatarUrl || '/images/avatar.png'
  const socials = getSocialLinks(settings)
  const paragraphs = (settings?.aboutText ?? DEFAULT_ABOUT)
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const facts: Array<{ icon: LucideIcon; label: string; value: string; href?: string }> = [
    { icon: MapPin, label: 'Based in', value: location },
    { icon: Mail, label: 'Email', value: email, href: `mailto:${email}` },
  ]

  return (
    <section id="about" className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="About me" title="Turning ideas into products people love" />

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative mx-auto w-full max-w-[17.5rem] pb-6 isolate sm:max-w-md"
          >
            <div
              aria-hidden="true"
              className="absolute -bottom-3 -right-3 -z-10 h-24 w-24 rounded-2xl border-2 border-primary/40"
            />
            {isLoading ? (
              <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            ) : (
              <AboutAvatar src={avatarSrc} name={ownerName} />
            )}
            <div className="absolute -bottom-2 left-4 flex items-center gap-3 rounded-xl border bg-card p-3 shadow-lg sm:left-6">
              <p className="font-display text-2xl font-bold text-primary">{years}+</p>
              <p className="max-w-[96px] text-xs leading-snug text-muted-foreground">Years of experience</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="mt-6 h-20 w-full" />
                <Skeleton className="mt-6 h-24 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paragraphs.map((paragraph, index) => (
                    <p key={index} className="leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                      <span className="rounded-lg bg-muted p-2.5">
                        <fact.icon className="h-4 w-4 text-primary" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{fact.label}</p>
                        {fact.href ? (
                          <a
                            href={fact.href}
                            className="block break-words text-sm font-medium transition-colors hover:text-primary"
                          >
                            {fact.value}
                          </a>
                        ) : (
                          <p className="truncate text-sm font-medium">{fact.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {socials.map((social) => (
                    <Button key={social.label} variant="outline" size="icon" asChild>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${ownerName} on ${social.label}`}
                      >
                        <social.icon className="h-4 w-4" />
                      </a>
                    </Button>
                  ))}
                  {settings?.resumeUrl ? (
                    <Button variant="outline" asChild className="ml-1">
                      <a href={settings.resumeUrl} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                        Download resume
                      </a>
                    </Button>
                  ) : null}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {HIGHLIGHTS.map((highlight) => (
                    <div key={highlight.title} className="rounded-xl border bg-card p-4">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <highlight.icon className="h-4 w-4 shrink-0 text-primary" />
                        {highlight.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{highlight.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { ArrowUp, Dribbble, Github, Linkedin, Twitter } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSettings } from '@/hooks/use-portfolio'
import type { SiteSettings } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface SocialLink {
  label: string
  href: string
  icon: LucideIcon
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

export function Footer() {
  const { data } = useSettings()
  const settings = data?.settings

  const ownerName = settings?.ownerName ?? 'Alex Carter'
  const year = new Date().getFullYear()
  const socials = getSocialLinks(settings)

  return (
    <footer className="mt-auto border-t bg-card/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="text-center sm:text-left">
          <p className="font-display text-sm font-semibold">
            © {year} {ownerName}. All rights reserved.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Built with Next.js, Tailwind & shadcn/ui</p>
        </div>

        <div className="flex items-center gap-1">
          {socials.map((social) => (
            <Button key={social.label} variant="ghost" size="icon" className="h-8 w-8" asChild>
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
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href="#home" aria-label="Back to top" title="Back to top">
              <ArrowUp className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  )
}

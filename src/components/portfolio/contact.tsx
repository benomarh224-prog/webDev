'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Clock, Dribbble, Github, Linkedin, Loader2, Mail, MapPin, Send, Twitter } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSendMessage, useSettings } from '@/hooks/use-portfolio'
import type { SiteSettings } from '@/lib/types'
import { SectionHeading } from './section-heading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ContactFormState {
  name: string
  email: string
  subject: string
  message: string
}

type ContactFormErrors = Partial<Record<keyof ContactFormState, string>>

const INITIAL_FORM: ContactFormState = { name: '', email: '', subject: '', message: '' }

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

function validateForm(form: ContactFormState): ContactFormErrors {
  const errors: ContactFormErrors = {}
  if (form.name.trim().length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).'
  }
  if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  if (form.message.trim().length < 10) {
    errors.message = 'Your message should be at least 10 characters.'
  }
  return errors
}

export function Contact() {
  const { data } = useSettings()
  const settings = data?.settings
  const mutation = useSendMessage()
  const { toast } = useToast()

  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<ContactFormErrors>({})

  const ownerName = settings?.ownerName ?? 'Alex Carter'
  const email = settings?.email ?? 'hello@alexcarter.dev'
  const location = settings?.location ?? 'San Francisco, CA'
  const socials = getSocialLinks(settings)

  const setField = (field: keyof ContactFormState) => (value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    mutation.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      },
      {
        onSuccess: () => {
          toast({
            title: 'Message sent!',
            description: "Thanks for reaching out — I'll get back to you soon.",
          })
          setForm(INITIAL_FORM)
          setErrors({})
        },
        onError: (error: Error) => {
          toast({
            title: 'Failed to send',
            description: error.message || 'Something went wrong. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const contactRows: Array<{ icon: LucideIcon; label: string; value: string; href?: string }> = [
    { icon: Mail, label: 'Email', value: email, href: `mailto:${email}` },
    { icon: MapPin, label: 'Location', value: location },
    { icon: Clock, label: 'Response time', value: 'Usually within 24 hours' },
  ]

  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something together"
          description="Have a project in mind or just want to say hi? My inbox is always open."
        />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1fr_1.2fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-display text-xl">Contact info</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="space-y-4">
                  {contactRows.map((row) => (
                    <div key={row.label} className="flex items-start gap-3">
                      <span className="rounded-lg bg-muted p-2.5">
                        <row.icon className="h-4 w-4 text-primary" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{row.label}</p>
                        {row.href ? (
                          <a href={row.href} className="break-words text-sm font-medium transition-colors hover:text-primary">
                            {row.value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium">{row.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {settings?.availableForWork ? (
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Available for work
                  </span>
                ) : null}

                {socials.length > 0 ? (
                  <div>
                    <p className="mb-3 text-xs text-muted-foreground">Find me on</p>
                    <div className="flex flex-wrap items-center gap-2">
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
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-display text-xl">Send me a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder="Jane Doe"
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) => setField('name')(event.target.value)}
                      aria-invalid={errors.name ? true : undefined}
                    />
                    {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => setField('email')(event.target.value)}
                      aria-invalid={errors.email ? true : undefined}
                    />
                    {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contact-subject">
                      Subject <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="contact-subject"
                      name="subject"
                      placeholder="What is this about?"
                      value={form.subject}
                      onChange={(event) => setField('subject')(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      placeholder="Tell me about your project..."
                      value={form.message}
                      onChange={(event) => setField('message')(event.target.value)}
                      aria-invalid={errors.message ? true : undefined}
                    />
                    {errors.message ? <p className="text-xs text-destructive">{errors.message}</p> : null}
                  </div>

                  <div className="sm:col-span-2">
                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={mutation.isPending}>
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send />
                          Send message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

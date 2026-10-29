'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { Loader2, RotateCcw, Save } from 'lucide-react'

import { useSaveSettings, useSettings } from '@/hooks/use-portfolio'
import { useToast } from '@/hooks/use-toast'
import type { SiteSettings, SiteSettingsInput } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface SettingsFormValues {
  siteTitle: string
  ownerName: string
  ownerRole: string
  heroTitle: string
  heroSubtitle: string
  aboutText: string
  avatarUrl: string
  resumeUrl: string
  email: string
  location: string
  githubUrl: string
  linkedinUrl: string
  twitterUrl: string
  dribbbleUrl: string
  yearsExperience: string
  clientsCount: string
  availableForWork: boolean
}

function toForm(s: SiteSettings): SettingsFormValues {
  return {
    siteTitle: s.siteTitle,
    ownerName: s.ownerName,
    ownerRole: s.ownerRole,
    heroTitle: s.heroTitle,
    heroSubtitle: s.heroSubtitle,
    aboutText: s.aboutText,
    avatarUrl: s.avatarUrl ?? '',
    resumeUrl: s.resumeUrl ?? '',
    email: s.email,
    location: s.location,
    githubUrl: s.githubUrl ?? '',
    linkedinUrl: s.linkedinUrl ?? '',
    twitterUrl: s.twitterUrl ?? '',
    dribbbleUrl: s.dribbbleUrl ?? '',
    yearsExperience: String(s.yearsExperience),
    clientsCount: String(s.clientsCount),
    availableForWork: s.availableForWork,
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

/** Remounted via `key` whenever the URL changes, so the error state resets naturally. */
function AvatarPreview({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)

  const trimmed = src.trim()
  if (!trimmed || failed) return null

  return (
    <div className="mt-2 size-24 overflow-hidden rounded-full border">
      <Image
        src={trimmed}
        alt="Avatar preview"
        width={96}
        height={96}
        unoptimized
        className="size-24 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

/**
 * The form is keyed by `settings.updatedAt`: it initializes its state from the
 * server values on mount and remounts only when the server version changes,
 * so background refetches never clobber in-progress edits.
 */
function SettingsForm({ settings }: { settings: SiteSettings }) {
  const saveSettings = useSaveSettings()
  const { toast } = useToast()

  const [state, setState] = useState<{ form: SettingsFormValues; original: SettingsFormValues }>(
    () => ({ form: toForm(settings), original: toForm(settings) })
  )

  const f = state.form
  const dirty = JSON.stringify(f) !== JSON.stringify(state.original)

  const update = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
    setState((prev) => (prev ? { ...prev, form: { ...prev.form, [key]: value } } : prev))
  }

  const handleReset = () => {
    setState((prev) => (prev ? { ...prev, form: prev.original } : prev))
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    const payload: SiteSettingsInput = {
      siteTitle: f.siteTitle.trim(),
      ownerName: f.ownerName.trim(),
      ownerRole: f.ownerRole.trim(),
      heroTitle: f.heroTitle.trim(),
      heroSubtitle: f.heroSubtitle.trim(),
      aboutText: f.aboutText.trim(),
      avatarUrl: f.avatarUrl.trim() || null,
      email: f.email.trim(),
      location: f.location.trim(),
      resumeUrl: f.resumeUrl.trim() || null,
      githubUrl: f.githubUrl.trim() || null,
      linkedinUrl: f.linkedinUrl.trim() || null,
      twitterUrl: f.twitterUrl.trim() || null,
      dribbbleUrl: f.dribbbleUrl.trim() || null,
      yearsExperience: Math.max(0, Number.parseInt(f.yearsExperience, 10) || 0),
      clientsCount: Math.max(0, Number.parseInt(f.clientsCount, 10) || 0),
      availableForWork: f.availableForWork,
    }

    saveSettings.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Settings saved' })
        setState((prev) => (prev ? { ...prev, original: prev.form } : prev))
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: 'Save failed',
          description: errorMessage(error),
        }),
    })
  }

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-6" noValidate>
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Branding</h2>
        <p className="mt-1 text-sm text-muted-foreground">Names shown across your site</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-siteTitle">Site title</Label>
            <Input
              id="settings-siteTitle"
              value={f.siteTitle}
              onChange={(e) => update('siteTitle', e.target.value)}
              placeholder="Portfolio"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-ownerName">Owner name</Label>
            <Input
              id="settings-ownerName"
              value={f.ownerName}
              onChange={(e) => update('ownerName', e.target.value)}
              placeholder="Alex Doe"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="settings-ownerRole">Owner role</Label>
            <Input
              id="settings-ownerRole"
              value={f.ownerRole}
              onChange={(e) => update('ownerRole', e.target.value)}
              placeholder="Full-stack Developer"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Hero section</h2>
        <p className="mt-1 text-sm text-muted-foreground">The first thing visitors see</p>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-heroTitle">Hero title</Label>
            <Input
              id="settings-heroTitle"
              value={f.heroTitle}
              onChange={(e) => update('heroTitle', e.target.value)}
              placeholder="Building thoughtful web experiences"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-heroSubtitle">Hero subtitle</Label>
            <Textarea
              id="settings-heroSubtitle"
              rows={3}
              value={f.heroSubtitle}
              onChange={(e) => update('heroSubtitle', e.target.value)}
              placeholder="A short line that introduces you"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">About</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your bio and identity</p>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-aboutText">About text</Label>
            <Textarea
              id="settings-aboutText"
              rows={6}
              value={f.aboutText}
              onChange={(e) => update('aboutText', e.target.value)}
              placeholder="Tell your story"
            />
            <p className="text-xs text-muted-foreground">
              Separate paragraphs with a blank line
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-avatarUrl">Avatar URL</Label>
              <Input
                id="settings-avatarUrl"
                value={f.avatarUrl}
                onChange={(e) => update('avatarUrl', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <AvatarPreview key={f.avatarUrl} src={f.avatarUrl} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-resumeUrl">Resume URL</Label>
              <Input
                id="settings-resumeUrl"
                value={f.resumeUrl}
                onChange={(e) => update('resumeUrl', e.target.value)}
                placeholder="https://example.com/resume.pdf"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Contact &amp; socials</h2>
        <p className="mt-1 text-sm text-muted-foreground">How people can reach you</p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={f.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="hello@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-location">Location</Label>
              <Input
                id="settings-location"
                value={f.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="Berlin, Germany"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-githubUrl">GitHub URL</Label>
              <Input
                id="settings-githubUrl"
                value={f.githubUrl}
                onChange={(e) => update('githubUrl', e.target.value)}
                placeholder="https://github.com/you"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-linkedinUrl">LinkedIn URL</Label>
              <Input
                id="settings-linkedinUrl"
                value={f.linkedinUrl}
                onChange={(e) => update('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/you"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-twitterUrl">Twitter URL</Label>
              <Input
                id="settings-twitterUrl"
                value={f.twitterUrl}
                onChange={(e) => update('twitterUrl', e.target.value)}
                placeholder="https://twitter.com/you"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-dribbbleUrl">Dribbble URL</Label>
              <Input
                id="settings-dribbbleUrl"
                value={f.dribbbleUrl}
                onChange={(e) => update('dribbbleUrl', e.target.value)}
                placeholder="https://dribbble.com/you"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Stats &amp; availability</h2>
        <p className="mt-1 text-sm text-muted-foreground">Numbers displayed on your portfolio</p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-yearsExperience">Years of experience</Label>
              <Input
                id="settings-yearsExperience"
                type="number"
                min={0}
                value={f.yearsExperience}
                onChange={(e) => update('yearsExperience', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-clientsCount">Clients count</Label>
              <Input
                id="settings-clientsCount"
                type="number"
                min={0}
                value={f.clientsCount}
                onChange={(e) => update('clientsCount', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="settings-availableForWork">Available for work</Label>
              <p className="text-xs text-muted-foreground">
                Shows the availability badge on your portfolio
              </p>
            </div>
            <Switch
              id="settings-availableForWork"
              checked={f.availableForWork}
              onCheckedChange={(checked) => update('availableForWork', checked)}
            />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Card className="flex items-center gap-3 p-3 shadow-lg">
          {dirty ? <span className="text-xs text-muted-foreground">Unsaved changes</span> : null}
          <Button
            type="button"
            variant="outline"
            disabled={!dirty || saveSettings.isPending}
            onClick={handleReset}
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </Button>
          <Button type="submit" disabled={!dirty || saveSettings.isPending}>
            {saveSettings.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save aria-hidden="true" className="size-4" />
                Save changes
              </>
            )}
          </Button>
        </Card>
      </div>
    </form>
  )
}

export function SettingsManager() {
  const { data, isLoading } = useSettings()
  const settings = data?.settings

  if (isLoading || !settings) {
    return (
      <div className="max-w-3xl space-y-6">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 w-full" />
        ))}
      </div>
    )
  }

  return <SettingsForm key={settings.updatedAt} settings={settings} />
}

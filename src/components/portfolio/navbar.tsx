'use client'

import { useEffect, useState } from 'react'
import { Download, Loader2, Menu, ShieldCheck } from 'lucide-react'
import { useSettings } from '@/hooks/use-portfolio'
import { useUIStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
] as const

function BrandMark({ name, className, ...props }: { name: string } & React.ComponentProps<'a'>) {
  const trimmed = name.trim() || 'Alex Carter'
  const spaceIndex = trimmed.indexOf(' ')
  const first = spaceIndex === -1 ? trimmed : trimmed.slice(0, spaceIndex)
  const rest = spaceIndex === -1 ? '' : trimmed.slice(spaceIndex + 1)

  return (
    <a
      href="#home"
      className={cn('font-display text-xl font-bold tracking-tight transition-opacity hover:opacity-80', className)}
      {...props}
    >
      {first}
      {rest ? (
        <>
          {' '}
          <span className="text-primary">{rest}</span>
        </>
      ) : null}
      <span className="text-primary">.</span>
    </a>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { data } = useSettings()
  const setView = useUIStore((state) => state.setView)
  const { toast } = useToast()
  const ownerName = data?.settings.ownerName ?? 'Alex Carter'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goToAdmin = () => {
    setOpen(false)
    setView('admin')
  }

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const res = await fetch('/api/download-project')
      if (!res.ok) throw new Error(`Download failed (${res.status})`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
          a.download = 'portfolio-source.zip'
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
      toast({
        title: 'Download started',
        description: 'The full project source is being downloaded as a ZIP archive.',
      })
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Could not generate the archive.',
        variant: 'destructive',
      })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300',
        scrolled && 'border-b border-border bg-background/80 shadow-sm backdrop-blur-md'
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <BrandMark name={ownerName} />

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative py-2 text-sm font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            className="hidden gap-2 sm:inline-flex"
            aria-label="Download project source code"
            title="Download the full project source as a ZIP"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Source</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={downloading}
            className="sm:hidden"
            aria-label="Download project source code"
            title="Download the full project source as a ZIP"
          >
            {downloading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Admin dashboard"
            title="Admin dashboard"
            onClick={() => setView('admin')}
          >
            <ShieldCheck className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="border-b p-4 text-left">
            <SheetTitle asChild>
              <BrandMark name={ownerName} />
            </SheetTitle>
            <SheetDescription className="sr-only">Portfolio navigation menu</SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex items-center justify-between border-t p-4">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Source
            </Button>
            <Button variant="outline" size="sm" onClick={goToAdmin}>
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Button>
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

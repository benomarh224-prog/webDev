'use client'

import { useEffect, useRef, useState } from 'react'
import { Menu, ShieldCheck } from 'lucide-react'
import { useSettings } from '@/hooks/use-portfolio'
import { useUIStore } from '@/lib/store'
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
  const menuButton = useRef<HTMLButtonElement>(null)
  const { data } = useSettings()
  const setView = useUIStore((state) => state.setView)
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

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 bg-background/95 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300',
        scrolled && 'border-b border-border bg-background/80 shadow-sm backdrop-blur-md'
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <BrandMark name={ownerName} className="min-w-0 truncate pr-3 text-lg sm:text-xl" />

        <ul className="hidden items-center gap-8 lg:flex">
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

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Admin dashboard"
            title="Admin dashboard"
            className="hidden lg:inline-flex"
            onClick={() => setView('admin')}
          >
            <ShieldCheck className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-haspopup="dialog"
            ref={menuButton}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="mobile-navigation"
          side="right"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            menuButton.current?.focus({ preventScroll: true })
          }}
          className="w-[min(24rem,100%)] gap-0 p-0 pt-[env(safe-area-inset-top)] [&>button]:flex [&>button]:size-11 [&>button]:items-center [&>button]:justify-center"
        >
          <SheetHeader className="border-b p-5 pr-16 text-left">
            <SheetTitle asChild>
              <BrandMark name={ownerName} className="block truncate" onClick={() => setOpen(false)} />
            </SheetTitle>
            <SheetDescription className="sr-only">Portfolio navigation menu</SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center rounded-md px-3 py-3 text-lg font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex shrink-0 items-center justify-between border-t p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <Button variant="outline" className="min-h-11" onClick={goToAdmin}>
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

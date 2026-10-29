'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  ExternalLink,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useAdmin, useLogout, useMessages } from '@/hooks/use-portfolio'
import { useUIStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { ExperienceManager } from '@/components/admin/experience-manager'
import { MessagesManager } from '@/components/admin/messages-manager'
import { Overview } from '@/components/admin/overview'
import { ProjectsManager } from '@/components/admin/projects-manager'
import { SettingsManager } from '@/components/admin/settings-manager'
import { SkillsManager } from '@/components/admin/skills-manager'

type AdminTab = 'overview' | 'projects' | 'skills' | 'experience' | 'messages' | 'settings'

interface TabDefinition {
  key: AdminTab
  label: string
  subtitle: string
  icon: LucideIcon
}

const TABS: TabDefinition[] = [
  {
    key: 'overview',
    label: 'Overview',
    subtitle: 'A snapshot of your portfolio activity',
    icon: LayoutDashboard,
  },
  {
    key: 'projects',
    label: 'Projects',
    subtitle: 'Create and manage your project showcase',
    icon: FolderGit2,
  },
  {
    key: 'skills',
    label: 'Skills',
    subtitle: 'Curate your skill set and proficiency levels',
    icon: Wrench,
  },
  {
    key: 'experience',
    label: 'Experience',
    subtitle: 'Your professional journey so far',
    icon: Briefcase,
  },
  {
    key: 'messages',
    label: 'Messages',
    subtitle: 'Inbox for your contact form submissions',
    icon: Mail,
  },
  {
    key: 'settings',
    label: 'Settings',
    subtitle: 'Configure your site content and profile',
    icon: Settings,
  },
]

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'AD'
  const first = parts[0].charAt(0)
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return (first + last).toUpperCase() || 'AD'
}

/**
 * Sidebar content shared by the desktop sidebar and the mobile sheet.
 * `onNavigate` closes the mobile sheet after a selection.
 */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const adminTab = useUIStore((s) => s.adminTab)
  const setAdminTab = useUIStore((s) => s.setAdminTab)
  const setView = useUIStore((s) => s.setView)
  const { data: adminData } = useAdmin()
  const { data: messagesData } = useMessages()
  const logout = useLogout()
  const admin = adminData?.admin ?? null
  const unread = messagesData?.messages.reduce((acc, m) => acc + (m.read ? 0 : 1), 0) ?? 0

  const handleLogout = () => {
    logout.mutate()
    setView('portfolio')
    onNavigate?.()
  }

  return (
    <>
      <div className="flex items-center gap-3 p-5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold">
          P
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-display font-bold">Portfolio</span>
          <Badge variant="secondary">Admin</Badge>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Admin navigation">
        {TABS.map((item) => {
          const active = adminTab === item.key
          return (
            <button
              key={item.key}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                setAdminTab(item.key)
                onNavigate?.()
              }}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                active
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon aria-hidden="true" className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.key === 'messages' && unread > 0 ? (
                <Badge className="rounded-full px-1.5 text-[10px] tabular-nums">
                  {unread > 99 ? '99+' : unread}
                </Badge>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/15 text-primary">
              {admin ? initialsOf(admin.name) : '··'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{admin ? admin.name : 'Admin'}</p>
            <p className="truncate text-xs text-muted-foreground">
              {admin ? admin.email : 'Signed in'}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setView('portfolio')
              onNavigate?.()
            }}
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            View site
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" className="size-4" />
            Log out
          </Button>
        </div>
      </div>
    </>
  )
}

function renderTab(tab: string) {
  switch (tab) {
    case 'projects':
      return <ProjectsManager />
    case 'skills':
      return <SkillsManager />
    case 'experience':
      return <ExperienceManager />
    case 'messages':
      return <MessagesManager />
    case 'settings':
      return <SettingsManager />
    case 'overview':
    default:
      return <Overview />
  }
}

export function AdminApp() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const adminTab = useUIStore((s) => s.adminTab)
  const setView = useUIStore((s) => s.setView)
  const logout = useLogout()
  const active = TABS.find((t) => t.key === adminTab) ?? TABS[0]

  const handleMobileLogout = () => {
    logout.mutate()
    setView('portfolio')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex min-h-screen bg-background"
    >
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            onClick={() => setSheetOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
          <span className="font-display font-bold">Admin</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            className="text-destructive hover:text-destructive"
            onClick={handleMobileLogout}
          >
            <LogOut aria-hidden="true" className="size-5" />
          </Button>
        </header>

        {/* Content header (desktop only, mobile uses the bar above) */}
        <div className="hidden px-6 pb-2 pt-6 lg:block">
          <h1 className="font-display text-2xl font-bold capitalize">{active.label}</h1>
          <p className="text-sm text-muted-foreground">{active.subtitle}</p>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
          {renderTab(adminTab)}
        </main>
      </div>

      {/* Mobile navigation sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Switch between dashboard sections
          </SheetDescription>
          <SidebarContent onNavigate={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}

'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Briefcase, FolderGit2, Inbox, Mail, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useMessages, useStats } from '@/hooks/use-portfolio'
import { useUIStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { DashboardStats, Message } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const DAY_COUNT = 14

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

interface ActivityTooltipProps {
  active?: boolean
  payload?: { value?: number | string }[]
  label?: string
}

function ActivityTooltip({ active, payload, label }: ActivityTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0]?.value ?? 0
  const count = typeof value === 'number' ? value : Number(value) || 0
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {count} {count === 1 ? 'message' : 'messages'}
      </p>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  note?: string
  noteEmphasis?: boolean
  icon: LucideIcon
  index: number
}

function StatCard({ label, value, note, noteEmphasis, icon: Icon, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-3xl font-bold leading-none">{value}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
            {note ? (
              <p
                className={cn(
                  'mt-1 text-xs',
                  noteEmphasis ? 'font-medium text-primary' : 'text-muted-foreground'
                )}
              >
                {note}
              </p>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function RecentMessagesCard({ stats }: { stats: DashboardStats }) {
  const setAdminTab = useUIStore((s) => s.setAdminTab)
  const recent = stats.recentMessages.slice(0, 5)

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold">Recent messages</h2>
      {recent.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Inbox aria-hidden="true" className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-1">
          {recent.map((m: Message) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setAdminTab('messages')}
                className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent/50"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-2 h-2 w-2 shrink-0 rounded-full',
                    m.read ? 'bg-transparent' : 'bg-primary'
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{m.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {m.subject || '(no subject)'}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(m.createdAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button
        variant="link"
        className="mt-4 h-auto p-0 text-sm"
        onClick={() => setAdminTab('messages')}
      >
        View all messages →
      </Button>
    </Card>
  )
}

function ActivityCard() {
  const { data: messagesData, isLoading } = useMessages()

  const chartData = useMemo(() => {
    const messages = messagesData?.messages ?? []
    const today = new Date()
    const buckets: { key: string; label: string; count: number }[] = []
    const index = new Map<string, number>()
    for (let i = DAY_COUNT - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = dayKey(d)
      index.set(key, buckets.length)
      buckets.push({ key, label: format(d, 'dd MMM'), count: 0 })
    }
    for (const m of messages) {
      const key = dayKey(new Date(m.createdAt))
      const at = index.get(key)
      if (at !== undefined) buckets[at].count += 1
    }
    return buckets
  }, [messagesData])

  const total = chartData.reduce((acc, d) => acc + d.count, 0)

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold">Message activity</h2>
      <p className="mt-1 text-sm text-muted-foreground">Messages received in the last 14 days</p>
      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : total === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={30}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip content={<ActivityTooltip />} cursor={{ fill: 'var(--accent)' }} />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}

export function Overview() {
  const { data, isLoading } = useStats()

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[104px] w-full" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const stats = data.stats

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Published Projects"
          value={stats.publishedProjects}
          note={
            stats.draftProjects === 1
              ? '1 draft'
              : `${stats.draftProjects} drafts`
          }
          icon={FolderGit2}
          index={0}
        />
        <StatCard label="Skills" value={stats.totalSkills} icon={Wrench} index={1} />
        <StatCard
          label="Messages"
          value={stats.totalMessages}
          note={
            stats.unreadMessages === 1
              ? '1 unread'
              : `${stats.unreadMessages} unread`
          }
          noteEmphasis={stats.unreadMessages > 0}
          icon={Mail}
          index={2}
        />
        <StatCard label="Experience" value={stats.totalExperiences} icon={Briefcase} index={3} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <RecentMessagesCard stats={stats} />
        <ActivityCard />
      </div>
    </div>
  )
}

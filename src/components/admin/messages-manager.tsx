'use client'

import { useState, type KeyboardEvent } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  RefreshCw,
  Reply,
  Trash2,
} from 'lucide-react'

import {
  useDeleteMessage,
  useMarkMessage,
  useMessages,
} from '@/hooks/use-portfolio'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Message } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export function MessagesManager() {
  const { data, isLoading, isRefetching, refetch } = useMessages()
  const markMessage = useMarkMessage()
  const deleteMessage = useDeleteMessage()
  const { toast } = useToast()

  const [selected, setSelected] = useState<Message | null>(null)

  const messages = data?.messages ?? []
  const unread = messages.reduce((acc, m) => acc + (m.read ? 0 : 1), 0)

  // Opening an unread message marks it as read immediately.
  const openMessage = (m: Message) => {
    setSelected(m)
    if (!m.read) {
      markMessage.mutate(
        { id: m.id, read: true },
        {
          onError: (error) =>
            toast({
              variant: 'destructive',
              title: 'Update failed',
              description: errorMessage(error),
            }),
        }
      )
    }
  }

  const handleToggleRead = (m: Message) => {
    markMessage.mutate(
      { id: m.id, read: !m.read },
      {
        onError: (error) =>
          toast({
            variant: 'destructive',
            title: 'Update failed',
            description: errorMessage(error),
          }),
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteMessage.mutate(id, {
      onSuccess: () => toast({ title: 'Message deleted' }),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: 'Delete failed',
          description: errorMessage(error),
        }),
    })
  }

  const onRowKeyDown = (e: KeyboardEvent<HTMLDivElement>, m: Message) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMessage(m)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Inbox</h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{unread} unread</span> ·{' '}
            {messages.length} {messages.length === 1 ? 'message' : 'messages'} total
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void refetch()
          }}
          disabled={isRefetching}
        >
          <RefreshCw
            aria-hidden="true"
            className={cn('size-4', isRefetching && 'animate-spin')}
          />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Inbox aria-hidden="true" className="size-10 text-muted-foreground" />
          <div>
            <p className="font-display font-semibold">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Messages from your contact form will appear here
            </p>
          </div>
        </Card>
      ) : (
        <Card className="max-h-[calc(100vh-16rem)] divide-y overflow-y-auto custom-scrollbar p-0">
          {messages.map((m) => (
            <div
              key={m.id}
              role="button"
              tabIndex={0}
              onClick={() => openMessage(m)}
              onKeyDown={(e) => onRowKeyDown(e, m)}
              aria-label={`Open message from ${m.name}: ${m.subject || '(no subject)'}`}
              className={cn(
                'group w-full cursor-pointer p-4 text-left transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none',
                !m.read && 'bg-primary/5'
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn('h-2 w-2 shrink-0 rounded-full', m.read ? 'bg-border' : 'bg-primary')}
                />
                <span className="truncate text-sm font-medium">{m.name}</span>
                <span className="hidden max-w-48 truncate text-xs text-muted-foreground md:inline">
                  {m.email}
                </span>
                <span className="flex-1" />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(m.createdAt)}
                </span>
                <div
                  className="flex gap-1 transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={m.read ? 'Mark as unread' : 'Mark as read'}
                    onClick={() => handleToggleRead(m)}
                  >
                    {m.read ? (
                      <Mail aria-hidden="true" className="size-4" />
                    ) : (
                      <MailOpen aria-hidden="true" className="size-4" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        aria-label={`Delete message from ${m.name}`}
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete message?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the message from {m.name}. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className={buttonVariants({ variant: 'destructive' })}
                          onClick={() => handleDelete(m.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {m.subject || '(no subject)'}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{m.message}</p>
            </div>
          ))}
        </Card>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg font-semibold">
                  {selected.subject || 'No subject'}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="text-sm font-medium text-foreground">{selected.name}</span>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-primary hover:underline"
                    >
                      {selected.email}
                    </a>
                    <span>· {format(new Date(selected.createdAt), 'PPP p')}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {selected.message}
              </p>
              <DialogFooter className="sm:justify-start">
                <Button asChild variant="outline">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(
                      `Re: ${selected.subject || 'Your message'}`
                    )}`}
                  >
                    <Reply aria-hidden="true" className="size-4" />
                    Reply by email
                  </a>
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 aria-hidden="true" className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

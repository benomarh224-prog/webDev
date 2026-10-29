'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Code, Info, Loader2, Lock, Mail } from 'lucide-react'

import { useLogin } from '@/hooks/use-portfolio'
import { useUIStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const setView = useUIStore((s) => s.setView)
  const { toast } = useToast()
  const login = useLogin()

  const clearErrors = () => {
    if (formError) setFormError(null)
    if (login.isError) login.reset()
  }

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    clearErrors()
  }

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    clearErrors()
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setFormError('Please enter both your email and password.')
      return
    }
    login.mutate(
      { email: email.trim(), password },
      {
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: 'Sign in failed',
            description:
              error instanceof Error ? error.message : 'Something went wrong. Please try again.',
          })
        },
      }
    )
  }

  const serverError = login.isError && login.error instanceof Error ? login.error.message : null
  const bannerMessage = formError ?? serverError

  return (
    <div className="dot-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <Card className="rounded-2xl border bg-card p-6 shadow-xl md:p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Code className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Sign in to manage your portfolio</p>
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
            {bannerMessage ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertTitle>Sign in failed</AlertTitle>
                <AlertDescription>{bannerMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@portfolio.dev"
                  className="pl-9"
                  value={email}
                  onChange={onEmailChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={onPasswordChange}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Sign in with the admin credentials configured when setting up this site.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="mt-4 w-full"
            onClick={() => setView('portfolio')}
          >
            ← Back to site
          </Button>
        </Card>
      </motion.div>
    </div>
  )
}

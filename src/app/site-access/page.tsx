import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LockKeyhole } from 'lucide-react'
import { safeDestination, SITE_COOKIE, verifySiteSession } from '@/lib/site-access'

export const metadata: Metadata = { title: 'Private site', robots: { index: false, follow: false } }

export default async function SiteAccess({ searchParams }: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next = safeDestination(params.next)
  if (await verifySiteSession((await cookies()).get(SITE_COOKIE)?.value)) redirect(next)

  return (
    <main dir="rtl" lang="ar" className="grid min-h-svh place-items-center bg-background px-5 py-12 text-foreground">
      <section className="w-full max-w-sm rounded-2xl bg-card p-6 sm:p-8" aria-labelledby="access-title">
        <LockKeyhole aria-hidden="true" className="mb-6 size-8 text-primary" />
        <h1 id="access-title" className="text-3xl font-bold">الموقع خاص</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">دخل كود الدخول باش تقدر تشوف الموقع.</p>
        <form action="/api/site-access" method="post" className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="site-password" className="mb-2 block text-sm font-medium">كود الدخول</label>
            <input
              id="site-password" name="password" type="password" required maxLength={128}
              autoComplete="current-password" autoCapitalize="none" spellCheck={false} dir="ltr"
              aria-invalid={params.error ? true : undefined}
              aria-describedby={params.error ? 'access-error' : undefined}
              className="h-12 w-full rounded-lg border border-input bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {params.error ? <p id="access-error" role="alert" className="mt-2 text-sm text-destructive">الكود غير صحيح، عاود جرّب.</p> : null}
          </div>
          <button type="submit" className="min-h-12 w-full rounded-lg bg-primary px-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">دخول للموقع</button>
        </form>
      </section>
    </main>
  )
}

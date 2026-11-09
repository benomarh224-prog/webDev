import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { createSiteSession, safeDestination, SITE_COOKIE, SITE_SESSION_SECONDS, siteAccessConfigured } from '@/lib/site-access'

export const runtime = 'nodejs'

// A bounded, per-instance throttle; infrastructure can apply additional rate limits.
const attempts = new Map<string, { count: number; reset: number }>()
const WINDOW_MS = 15 * 60 * 1000

export async function POST(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' }
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403, headers })
  }
  if (!siteAccessConfigured()) {
    return NextResponse.json({ error: 'Site access is not configured' }, { status: 503, headers })
  }
  const length = Number(request.headers.get('content-length'))
  if (length > 4096) return new NextResponse(null, { status: 413, headers })

  const now = Date.now()
  for (const [key, value] of attempts) if (value.reset <= now) attempts.delete(key)
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const entry = attempts.get(ip) ?? { count: 0, reset: now + WINDOW_MS }
  if (entry.count >= 10 || !attempts.has(ip) && attempts.size >= 10000) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, {
      status: 429, headers: { ...headers, 'Retry-After': String(Math.max(1, Math.ceil((entry.reset - now) / 1000))) },
    })
  }
  entry.count++
  attempts.set(ip, entry)

  let form: FormData
  try { form = await request.formData() } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400, headers })
  }
  const password = form.get('password')
  const next = safeDestination(form.get('next'))
  const hash = Buffer.from(process.env.SITE_PASSWORD_HASH!, 'base64url').toString('utf8')
  if (typeof password !== 'string' || password.length > 128 || !await bcrypt.compare(password, hash)) {
    const url = new URL('/site-access', request.url)
    url.searchParams.set('error', '1')
    url.searchParams.set('next', next)
    return NextResponse.redirect(url, { status: 303, headers })
  }
  attempts.delete(ip)
  const response = NextResponse.redirect(new URL(next, request.url), { status: 303, headers })
  response.cookies.set(SITE_COOKIE, await createSiteSession(), {
    httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:',
    path: '/', maxAge: SITE_SESSION_SECONDS,
  })
  return response
}

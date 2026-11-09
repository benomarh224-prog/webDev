import { NextRequest, NextResponse } from 'next/server'
import { SITE_COOKIE, verifySiteSession } from '@/lib/site-access'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (pathname === '/site-access' || pathname === '/api/site-access') return NextResponse.next()

  if (await verifySiteSession(request.cookies.get(SITE_COOKIE)?.value)) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return response
  }

  const headers = { 'Cache-Control': 'private, no-store' }
  if (pathname.startsWith('/api/') || request.method !== 'GET' && request.method !== 'HEAD') {
    return NextResponse.json({ error: 'Site access code required' }, { status: 401, headers })
  }
  const url = new URL('/site-access', request.url)
  url.searchParams.set('next', pathname + request.nextUrl.search)
  const response = NextResponse.redirect(url, 307)
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

// Only framework JS/CSS is public. APIs, public images, and optimized images are gated.
export const config = { matcher: ['/((?!_next/static/|_next/webpack-hmr).*)'] }

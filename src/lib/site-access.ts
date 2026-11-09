import { SignJWT, jwtVerify } from 'jose'

export const SITE_COOKIE = 'portfolio_site_access'
export const SITE_SESSION_SECONDS = 60 * 60 * 8
const ISSUER = 'portfolio-site-access'

function secret() {
  const value = process.env.SITE_SESSION_SECRET
  if (!value || value.length < 32) throw new Error('SITE_SESSION_SECRET is not configured')
  // Changing the access code also invalidates all existing visitor sessions.
  return new TextEncoder().encode(`${value}:${process.env.SITE_PASSWORD_HASH}`)
}

export function siteAccessConfigured() {
  return Boolean(process.env.SITE_PASSWORD_HASH && (process.env.SITE_SESSION_SECRET?.length ?? 0) >= 32)
}

export async function createSiteSession() {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience('portfolio')
    .setSubject('site-visitor')
    .setIssuedAt()
    .setExpirationTime(`${SITE_SESSION_SECONDS}s`)
    .sign(secret())
}

export async function verifySiteSession(token?: string) {
  if (!token || !siteAccessConfigured()) return false
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ['HS256'], issuer: ISSUER, audience: 'portfolio',
    })
    return payload.sub === 'site-visitor'
  } catch {
    return false
  }
}

export function safeDestination(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return '/'
  const url = new URL(value, 'https://portfolio.invalid')
  if (url.origin !== 'https://portfolio.invalid' || url.pathname.startsWith('/site-access') || url.pathname.startsWith('/api/site-access')) return '/'
  return url.pathname + url.search + url.hash
}

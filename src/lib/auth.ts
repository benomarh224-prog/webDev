import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import type { AdminUser } from '@/lib/types'

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('Set AUTH_SECRET to a random secret of at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export const AUTH_COOKIE = 'portfolio_admin_token'
const SESSION_DAYS = 7

export async function createSessionToken(adminId: string): Promise<string> {
  return new SignJWT({ sub: adminId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getJwtSecret())
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return (payload.sub as string) || null
  } catch {
    return null
  }
}

/**
 * Get the currently authenticated admin from the request cookies.
 * Returns null when not authenticated.
 */
export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const store = await cookies()
    const token = store.get(AUTH_COOKIE)?.value
    if (!token) return null

    const adminId = await verifySessionToken(token)
    if (!adminId) return null

    const admin = await db.admin.findUnique({ where: { id: adminId } })
    if (!admin) return null

    return { id: admin.id, email: admin.email, name: admin.name }
  } catch {
    return null
  }
}

/**
 * Helper for API routes: returns the admin session or throws a 401 Response.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminSession()
  if (!admin) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return admin
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

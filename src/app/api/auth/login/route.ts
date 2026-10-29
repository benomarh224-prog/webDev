import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { AUTH_COOKIE, createSessionToken } from '@/lib/auth'
import { readJsonBody, zodBadRequest } from '@/lib/serialize'

const loginSchema = z.object({
  email: z.email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: Request) {
  const body = await readJsonBody(req)
  if (!body.ok) {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body.data)
  if (!parsed.success) {
    return zodBadRequest(parsed.error)
  }

  const { email, password } = parsed.data

  const admin = await db.admin.findUnique({ where: { email } })
  if (!admin) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const passwordValid = await bcrypt.compare(password, admin.passwordHash)
  if (!passwordValid) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = await createSessionToken(admin.id)

  const store = await cookies()
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
  })

  return Response.json({
    admin: { id: admin.id, email: admin.email, name: admin.name },
  })
}

import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import {
  badRequest,
  handlePrismaError,
  readJsonBody,
  serializeMessage,
  zodBadRequest,
} from '@/lib/serialize'

const messageInputSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('A valid email is required'),
  subject: z.string().nullable().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const messages = await db.message.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return Response.json({ messages: messages.map(serializeMessage) })
}

export async function POST(req: Request) {
  const body = await readJsonBody(req)
  if (!body.ok) return badRequest('Invalid JSON body')

  const parsed = messageInputSchema.safeParse(body.data)
  if (!parsed.success) return zodBadRequest(parsed.error)
  const input = parsed.data

  try {
    const message = await db.message.create({
      data: {
        name: input.name,
        email: input.email,
        subject: input.subject ?? null,
        message: input.message,
        read: false,
      },
    })
    return Response.json({ message: serializeMessage(message) })
  } catch (error) {
    return handlePrismaError(error, 'Message not found')
  }
}

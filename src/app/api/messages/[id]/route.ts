import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import {
  badRequest,
  handlePrismaError,
  notFound,
  readJsonBody,
  serializeMessage,
  zodBadRequest,
} from '@/lib/serialize'

const messagePatchSchema = z.object({
  read: z.boolean(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const { id } = await params

  const body = await readJsonBody(req)
  if (!body.ok) return badRequest('Invalid JSON body')

  const parsed = messagePatchSchema.safeParse(body.data)
  if (!parsed.success) return zodBadRequest(parsed.error)

  try {
    const message = await db.message.update({
      where: { id },
      data: { read: parsed.data.read },
    })
    return Response.json({ message: serializeMessage(message) })
  } catch (error) {
    return handlePrismaError(error, 'Message not found')
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const { id } = await params

  try {
    await db.message.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return handlePrismaError(error, 'Message not found')
  }
}

import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import {
  badRequest,
  handlePrismaError,
  notFound,
  readJsonBody,
  serializeSkill,
  zodBadRequest,
} from '@/lib/serialize'

const skillUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  level: z
    .number()
    .int('Level must be an integer')
    .min(0, 'Level must be at least 0')
    .max(100, 'Level must be at most 100')
    .optional(),
  sortOrder: z.number().int().optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const { id } = await params

  const body = await readJsonBody(req)
  if (!body.ok) return badRequest('Invalid JSON body')

  const parsed = skillUpdateSchema.safeParse(body.data)
  if (!parsed.success) return zodBadRequest(parsed.error)
  const input = parsed.data

  const existing = await db.skill.findUnique({ where: { id } })
  if (!existing) return notFound('Skill not found')

  try {
    const skill = await db.skill.update({
      where: { id },
      data: {
        name: input.name ?? existing.name,
        category: input.category ?? existing.category,
        level: input.level ?? existing.level,
        sortOrder: input.sortOrder ?? existing.sortOrder,
      },
    })
    return Response.json({ skill: serializeSkill(skill) })
  } catch (error) {
    return handlePrismaError(error, 'Skill not found')
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
    await db.skill.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return handlePrismaError(error, 'Skill not found')
  }
}

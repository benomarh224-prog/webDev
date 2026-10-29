import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import {
  badRequest,
  handlePrismaError,
  readJsonBody,
  serializeSkill,
  zodBadRequest,
} from '@/lib/serialize'

const skillInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  level: z
    .number()
    .int('Level must be an integer')
    .min(0, 'Level must be at least 0')
    .max(100, 'Level must be at most 100'),
  sortOrder: z.number().int().optional(),
})

export async function GET() {
  const skills = await db.skill.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
  return Response.json({ skills: skills.map(serializeSkill) })
}

export async function POST(req: Request) {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const body = await readJsonBody(req)
  if (!body.ok) return badRequest('Invalid JSON body')

  const parsed = skillInputSchema.safeParse(body.data)
  if (!parsed.success) return zodBadRequest(parsed.error)
  const input = parsed.data

  try {
    const skill = await db.skill.create({
      data: {
        name: input.name,
        category: input.category,
        level: input.level,
        sortOrder: input.sortOrder ?? 0,
      },
    })
    return Response.json({ skill: serializeSkill(skill) })
  } catch (error) {
    return handlePrismaError(error, 'Skill not found')
  }
}

import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import {
  badRequest,
  handlePrismaError,
  readJsonBody,
  serializeExperience,
  zodBadRequest,
} from '@/lib/serialize'

/** Accepts any string parseable as a date (ISO datetime or plain date). */
const dateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date format',
  })

const experienceInputSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().nullable().optional(),
  startDate: dateString,
  endDate: dateString.nullable().optional(),
  current: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export async function GET() {
  const experiences = await db.experience.findMany({
    orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
  })
  return Response.json({ experiences: experiences.map(serializeExperience) })
}

export async function POST(req: Request) {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const body = await readJsonBody(req)
  if (!body.ok) return badRequest('Invalid JSON body')

  const parsed = experienceInputSchema.safeParse(body.data)
  if (!parsed.success) return zodBadRequest(parsed.error)
  const input = parsed.data

  // A current position never has an end date.
  const current = input.current ?? false
  const endDate = current ? null : input.endDate ? new Date(input.endDate) : null

  try {
    const experience = await db.experience.create({
      data: {
        company: input.company,
        role: input.role,
        description: input.description,
        location: input.location ?? null,
        startDate: new Date(input.startDate),
        endDate,
        current,
        sortOrder: input.sortOrder ?? 0,
      },
    })
    return Response.json({ experience: serializeExperience(experience) })
  } catch (error) {
    return handlePrismaError(error, 'Experience not found')
  }
}

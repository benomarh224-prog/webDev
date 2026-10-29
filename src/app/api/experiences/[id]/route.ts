import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import {
  badRequest,
  handlePrismaError,
  notFound,
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

const experienceUpdateSchema = z.object({
  company: z.string().min(1, 'Company is required').optional(),
  role: z.string().min(1, 'Role is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  location: z.string().nullable().optional(),
  startDate: dateString.optional(),
  endDate: dateString.nullable().optional(),
  current: z.boolean().optional(),
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

  const parsed = experienceUpdateSchema.safeParse(body.data)
  if (!parsed.success) return zodBadRequest(parsed.error)
  const input = parsed.data

  const existing = await db.experience.findUnique({ where: { id } })
  if (!existing) return notFound('Experience not found')

  const current = input.current ?? existing.current

  // A current position never has an end date.
  let endDate: Date | null
  if (current) {
    endDate = null
  } else if (input.endDate !== undefined) {
    endDate = input.endDate === null ? null : new Date(input.endDate)
  } else {
    endDate = existing.endDate
  }

  try {
    const experience = await db.experience.update({
      where: { id },
      data: {
        company: input.company ?? existing.company,
        role: input.role ?? existing.role,
        description: input.description ?? existing.description,
        location: input.location !== undefined ? input.location : existing.location,
        startDate: input.startDate
          ? new Date(input.startDate)
          : existing.startDate,
        endDate,
        current,
        sortOrder: input.sortOrder ?? existing.sortOrder,
      },
    })
    return Response.json({ experience: serializeExperience(experience) })
  } catch (error) {
    return handlePrismaError(error, 'Experience not found')
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
    await db.experience.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return handlePrismaError(error, 'Experience not found')
  }
}

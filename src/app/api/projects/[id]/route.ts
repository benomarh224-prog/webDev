import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import {
  badRequest,
  generateUniqueSlug,
  handlePrismaError,
  joinTechnologies,
  notFound,
  readJsonBody,
  serializeProject,
  zodBadRequest,
} from '@/lib/serialize'

const projectUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().optional(),
  description: z.string().min(1, 'Description is required').optional(),
  content: z.string().nullable().optional(),
  technologies: z.union([z.array(z.string()), z.string()]).optional(),
  imageUrl: z.string().nullable().optional(),
  demoUrl: z.string().nullable().optional(),
  repoUrl: z.string().nullable().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['published', 'draft']).optional(),
  sortOrder: z.number().int().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return notFound('Project not found')

  return Response.json({ project: serializeProject(project) })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const { id } = await params

  const body = await readJsonBody(req)
  if (!body.ok) return badRequest('Invalid JSON body')

  const parsed = projectUpdateSchema.safeParse(body.data)
  if (!parsed.success) return zodBadRequest(parsed.error)
  const input = parsed.data

  const existing = await db.project.findUnique({ where: { id } })
  if (!existing) return notFound('Project not found')

  // Keep the existing slug unless a new one is provided; resolve collisions.
  const slugBase =
    input.slug && input.slug.trim().length > 0 ? input.slug : existing.slug
  const slug = await generateUniqueSlug(slugBase, id)

  try {
    const project = await db.project.update({
      where: { id },
      data: {
        title: input.title ?? existing.title,
        slug,
        description: input.description ?? existing.description,
        content:
          input.content !== undefined ? input.content : existing.content,
        technologies:
          input.technologies !== undefined
            ? joinTechnologies(input.technologies)
            : existing.technologies,
        imageUrl: input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl,
        demoUrl: input.demoUrl !== undefined ? input.demoUrl : existing.demoUrl,
        repoUrl: input.repoUrl !== undefined ? input.repoUrl : existing.repoUrl,
        category: input.category ?? existing.category,
        featured: input.featured ?? existing.featured,
        status: input.status ?? existing.status,
        sortOrder: input.sortOrder ?? existing.sortOrder,
      },
    })
    return Response.json({ project: serializeProject(project) })
  } catch (error) {
    return handlePrismaError(error, 'Project not found')
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
    await db.project.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (error) {
    return handlePrismaError(error, 'Project not found')
  }
}

import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import {
  badRequest,
  generateUniqueSlug,
  handlePrismaError,
  joinTechnologies,
  readJsonBody,
  serializeProject,
  zodBadRequest,
} from '@/lib/serialize'

const projectInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
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

export async function GET(req: Request) {
  const url = new URL(req.url)
  const includeAll = url.searchParams.get('all') === 'true'

  if (includeAll) {
    const admin = await getAdminSession()
    if (!admin) return unauthorized()
  }

  const projects = await db.project.findMany({
    where: includeAll ? {} : { status: 'published' },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return Response.json({ projects: projects.map(serializeProject) })
}

export async function POST(req: Request) {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const body = await readJsonBody(req)
  if (!body.ok) return badRequest('Invalid JSON body')

  const parsed = projectInputSchema.safeParse(body.data)
  if (!parsed.success) return zodBadRequest(parsed.error)
  const input = parsed.data

  // Auto-generate slug from title when missing/empty, ensuring uniqueness.
  const slugBase =
    input.slug && input.slug.trim().length > 0 ? input.slug : input.title
  const slug = await generateUniqueSlug(slugBase)

  try {
    const project = await db.project.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        content: input.content ?? null,
        technologies: joinTechnologies(input.technologies),
        imageUrl: input.imageUrl ?? null,
        demoUrl: input.demoUrl ?? null,
        repoUrl: input.repoUrl ?? null,
        category: input.category ?? 'Web App',
        featured: input.featured ?? false,
        status: input.status ?? 'published',
        sortOrder: input.sortOrder ?? 0,
      },
    })
    return Response.json({ project: serializeProject(project) })
  } catch (error) {
    return handlePrismaError(error, 'Project not found')
  }
}

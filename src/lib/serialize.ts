// Shared serializers + small request/response helpers for API routes.
// Converts Prisma records (Date objects, comma-joined technologies) into the
// JSON shapes declared in @/lib/types (ISO strings, string arrays).

import { Prisma } from '@prisma/client'
import type {
  Project as ProjectRecord,
  Skill as SkillRecord,
  Experience as ExperienceRecord,
  Message as MessageRecord,
  SiteSettings as SiteSettingsRecord,
} from '@prisma/client'
import type {
  Project,
  Skill,
  Experience,
  Message,
  SiteSettings,
} from '@/lib/types'
import { db } from '@/lib/db'

/** Split a comma-separated technologies string into a clean string array. */
export function splitTechnologies(raw: string): string[] {
  return raw
    .split(',')
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0)
}

/** Normalize a technologies input (string[] or comma string) into a comma string. */
export function joinTechnologies(input: string[] | string | undefined): string {
  if (input === undefined || input === null) return ''
  if (Array.isArray(input)) {
    return input.map((t) => t.trim()).filter((t) => t.length > 0).join(',')
  }
  return input
}

export function serializeProject(project: ProjectRecord): Project {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    content: project.content,
    technologies: splitTechnologies(project.technologies),
    imageUrl: project.imageUrl,
    demoUrl: project.demoUrl,
    repoUrl: project.repoUrl,
    category: project.category,
    featured: project.featured,
    status: project.status,
    sortOrder: project.sortOrder,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }
}

export function serializeSkill(skill: SkillRecord): Skill {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    level: skill.level,
    sortOrder: skill.sortOrder,
  }
}

export function serializeExperience(experience: ExperienceRecord): Experience {
  return {
    id: experience.id,
    company: experience.company,
    role: experience.role,
    description: experience.description,
    location: experience.location,
    startDate: experience.startDate.toISOString(),
    endDate: experience.endDate ? experience.endDate.toISOString() : null,
    current: experience.current,
    sortOrder: experience.sortOrder,
  }
}

export function serializeMessage(message: MessageRecord): Message {
  return {
    id: message.id,
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
    read: message.read,
    createdAt: message.createdAt.toISOString(),
  }
}

export function serializeSettings(settings: SiteSettingsRecord): SiteSettings {
  return {
    id: settings.id,
    siteTitle: settings.siteTitle,
    ownerName: settings.ownerName,
    ownerRole: settings.ownerRole,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    aboutText: settings.aboutText,
    avatarUrl: settings.avatarUrl,
    email: settings.email,
    location: settings.location,
    resumeUrl: settings.resumeUrl,
    githubUrl: settings.githubUrl,
    linkedinUrl: settings.linkedinUrl,
    twitterUrl: settings.twitterUrl,
    dribbbleUrl: settings.dribbbleUrl,
    yearsExperience: settings.yearsExperience,
    clientsCount: settings.clientsCount,
    availableForWork: settings.availableForWork,
    updatedAt: settings.updatedAt.toISOString(),
  }
}

/** Convert a title (or raw slug) into a URL-safe slug. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a project slug that does not collide with any other project.
 * `excludeId` lets a project keep its own slug during updates.
 */
export async function generateUniqueSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(base) || 'project'
  let candidate = baseSlug
  let counter = 2
  let existing = await db.project.findUnique({ where: { slug: candidate } })
  while (existing && existing.id !== excludeId) {
    candidate = `${baseSlug}-${counter}`
    counter += 1
    existing = await db.project.findUnique({ where: { slug: candidate } })
  }
  return candidate
}

/**
 * Safely read a JSON body. Never throws — returns `{ ok: false }` when the
 * request body is not valid JSON.
 */
export async function readJsonBody(
  req: Request
): Promise<{ ok: true; data: unknown } | { ok: false }> {
  try {
    return { ok: true, data: (await req.json()) as unknown }
  } catch {
    return { ok: false }
  }
}

/** 400 response with `{ error }` shape. */
export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 })
}

/** 404 response with `{ error }` shape. */
export function notFound(message: string): Response {
  return Response.json({ error: message }, { status: 404 })
}

/** Turn a zod safeParse failure into a 400 response with the first issue message. */
export function zodBadRequest(error: {
  issues: ReadonlyArray<{ message: string }>
}): Response {
  return badRequest(error.issues[0]?.message ?? 'Invalid request')
}

/**
 * Map known Prisma errors to clean JSON responses:
 * - P2002 (unique constraint) → 409
 * - P2025 (record not found)  → 404
 * Anything else is logged and returns a 500.
 */
export function handlePrismaError(error: unknown, notFoundMessage = 'Record not found'): Response {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return Response.json(
        { error: 'A record with this value already exists' },
        { status: 409 }
      )
    }
    if (error.code === 'P2025') {
      return notFound(notFoundMessage)
    }
  }
  console.error('[api] unexpected error:', error)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}

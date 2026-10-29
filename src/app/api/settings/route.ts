import { z } from 'zod'
import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import {
  badRequest,
  handlePrismaError,
  readJsonBody,
  serializeSettings,
  zodBadRequest,
} from '@/lib/serialize'

const settingsInputSchema = z.object({
  siteTitle: z.string().min(1, 'Site title is required').optional(),
  ownerName: z.string().min(1, 'Owner name is required').optional(),
  ownerRole: z.string().min(1, 'Owner role is required').optional(),
  heroTitle: z.string().min(1, 'Hero title is required').optional(),
  heroSubtitle: z.string().optional(),
  aboutText: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  email: z.email('A valid email is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  resumeUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  twitterUrl: z.string().nullable().optional(),
  dribbbleUrl: z.string().nullable().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  clientsCount: z.number().int().min(0).optional(),
  availableForWork: z.boolean().optional(),
})

/** Fallback defaults used when the settings row does not exist yet. */
const defaultSettings = {
  siteTitle: 'Alex Carter — Portfolio',
  ownerName: 'Alex Carter',
  ownerRole: 'Full-Stack Developer',
  heroTitle: 'Building digital experiences that matter',
  heroSubtitle: 'Full-Stack Developer crafting modern, performant web applications.',
  aboutText:
    'I design and build modern web applications with a focus on performance, accessibility, and great user experience.',
  email: 'hello@alexcarter.dev',
  location: 'Paris, France',
  yearsExperience: 5,
  clientsCount: 20,
  availableForWork: true,
}

export async function GET() {
  let settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
  if (!settings) {
    settings = await db.siteSettings.create({
      data: { id: 'main', ...defaultSettings },
    })
  }
  return Response.json({ settings: serializeSettings(settings) })
}

export async function PUT(req: Request) {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const body = await readJsonBody(req)
  if (!body.ok) return badRequest('Invalid JSON body')

  const parsed = settingsInputSchema.safeParse(body.data)
  if (!parsed.success) return zodBadRequest(parsed.error)
  const input = parsed.data

  const existing = await db.siteSettings.findUnique({ where: { id: 'main' } })

  const data = {
    siteTitle: input.siteTitle ?? existing?.siteTitle ?? defaultSettings.siteTitle,
    ownerName: input.ownerName ?? existing?.ownerName ?? defaultSettings.ownerName,
    ownerRole: input.ownerRole ?? existing?.ownerRole ?? defaultSettings.ownerRole,
    heroTitle: input.heroTitle ?? existing?.heroTitle ?? defaultSettings.heroTitle,
    heroSubtitle: input.heroSubtitle ?? existing?.heroSubtitle ?? defaultSettings.heroSubtitle,
    aboutText: input.aboutText ?? existing?.aboutText ?? defaultSettings.aboutText,
    avatarUrl:
      input.avatarUrl !== undefined
        ? input.avatarUrl
        : (existing?.avatarUrl ?? null),
    email: input.email ?? existing?.email ?? defaultSettings.email,
    location: input.location ?? existing?.location ?? defaultSettings.location,
    resumeUrl:
      input.resumeUrl !== undefined ? input.resumeUrl : (existing?.resumeUrl ?? null),
    githubUrl:
      input.githubUrl !== undefined ? input.githubUrl : (existing?.githubUrl ?? null),
    linkedinUrl:
      input.linkedinUrl !== undefined
        ? input.linkedinUrl
        : (existing?.linkedinUrl ?? null),
    twitterUrl:
      input.twitterUrl !== undefined ? input.twitterUrl : (existing?.twitterUrl ?? null),
    dribbbleUrl:
      input.dribbbleUrl !== undefined
        ? input.dribbbleUrl
        : (existing?.dribbbleUrl ?? null),
    yearsExperience:
      input.yearsExperience ?? existing?.yearsExperience ?? defaultSettings.yearsExperience,
    clientsCount:
      input.clientsCount ?? existing?.clientsCount ?? defaultSettings.clientsCount,
    availableForWork:
      input.availableForWork ?? existing?.availableForWork ?? defaultSettings.availableForWork,
  }

  try {
    const settings = await db.siteSettings.upsert({
      where: { id: 'main' },
      update: data,
      create: { id: 'main', ...data },
    })
    return Response.json({ settings: serializeSettings(settings) })
  } catch (error) {
    return handlePrismaError(error, 'Settings not found')
  }
}

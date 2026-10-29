import { db } from '@/lib/db'
import { getAdminSession, unauthorized } from '@/lib/auth'
import { serializeMessage } from '@/lib/serialize'
import type { DashboardStats } from '@/lib/types'

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) return unauthorized()

  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    featuredProjects,
    totalSkills,
    totalExperiences,
    totalMessages,
    unreadMessages,
    recentMessageRecords,
  ] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: 'published' } }),
    db.project.count({ where: { status: 'draft' } }),
    db.project.count({ where: { featured: true } }),
    db.skill.count(),
    db.experience.count(),
    db.message.count(),
    db.message.count({ where: { read: false } }),
    db.message.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  const stats: DashboardStats = {
    totalProjects,
    publishedProjects,
    draftProjects,
    featuredProjects,
    totalSkills,
    totalExperiences,
    totalMessages,
    unreadMessages,
    recentMessages: recentMessageRecords.map(serializeMessage),
  }

  return Response.json({ stats })
}

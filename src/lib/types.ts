// Shared types for the portfolio application (used by both client and server)

export interface AdminUser {
  id: string
  email: string
  name: string
}

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  content: string | null
  technologies: string[]
  imageUrl: string | null
  demoUrl: string | null
  repoUrl: string | null
  category: string
  featured: boolean
  status: 'published' | 'draft' | string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  title: string
  slug?: string
  description: string
  content?: string | null
  technologies?: string[] | string
  imageUrl?: string | null
  demoUrl?: string | null
  repoUrl?: string | null
  category?: string
  featured?: boolean
  status?: string
  sortOrder?: number
}

export interface Skill {
  id: string
  name: string
  category: string
  level: number
  sortOrder: number
}

export interface SkillInput {
  name: string
  category: string
  level: number
  sortOrder?: number
}

export interface Experience {
  id: string
  company: string
  role: string
  description: string
  location: string | null
  startDate: string
  endDate: string | null
  current: boolean
  sortOrder: number
}

export interface ExperienceInput {
  company: string
  role: string
  description: string
  location?: string | null
  startDate: string
  endDate?: string | null
  current?: boolean
  sortOrder?: number
}

export interface Message {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  createdAt: string
}

export interface MessageInput {
  name: string
  email: string
  subject?: string | null
  message: string
}

export interface SiteSettings {
  id: string
  siteTitle: string
  ownerName: string
  ownerRole: string
  heroTitle: string
  heroSubtitle: string
  aboutText: string
  avatarUrl: string | null
  email: string
  location: string
  resumeUrl: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  dribbbleUrl: string | null
  yearsExperience: number
  clientsCount: number
  availableForWork: boolean
  updatedAt: string
}

export type SiteSettingsInput = Omit<SiteSettings, 'id' | 'updatedAt'>

export interface DashboardStats {
  totalProjects: number
  publishedProjects: number
  draftProjects: number
  featuredProjects: number
  totalSkills: number
  totalExperiences: number
  totalMessages: number
  unreadMessages: number
  recentMessages: Message[]
}

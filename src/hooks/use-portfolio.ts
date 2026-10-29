'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, patch, del } from '@/lib/api'
import type {
  AdminUser,
  Project,
  ProjectInput,
  Skill,
  SkillInput,
  Experience,
  ExperienceInput,
  Message,
  MessageInput,
  SiteSettings,
  SiteSettingsInput,
  DashboardStats,
} from '@/lib/types'

// ---------------- Query keys ----------------
export const qk = {
  me: ['me'] as const,
  settings: ['settings'] as const,
  projects: (all?: boolean) => ['projects', { all }] as const,
  skills: ['skills'] as const,
  experiences: ['experiences'] as const,
  messages: ['messages'] as const,
  stats: ['stats'] as const,
}

// ---------------- Queries ----------------

export function useAdmin() {
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      try {
        return await get<{ admin: AdminUser | null }>('/api/auth/me')
      } catch {
        return { admin: null }
      }
    },
    staleTime: 60_000,
  })
}

export function useSettings() {
  return useQuery({
    queryKey: qk.settings,
    queryFn: () => get<{ settings: SiteSettings }>('/api/settings'),
  })
}

export function useProjects(all = false) {
  return useQuery({
    queryKey: qk.projects(all),
    queryFn: () => get<{ projects: Project[] }>(`/api/projects${all ? '?all=true' : ''}`),
  })
}

export function useSkills() {
  return useQuery({
    queryKey: qk.skills,
    queryFn: () => get<{ skills: Skill[] }>('/api/skills'),
  })
}

export function useExperiences() {
  return useQuery({
    queryKey: qk.experiences,
    queryFn: () => get<{ experiences: Experience[] }>('/api/experiences'),
  })
}

export function useMessages(enabled = true) {
  return useQuery({
    queryKey: qk.messages,
    queryFn: () => get<{ messages: Message[] }>('/api/messages'),
    enabled,
  })
}

export function useStats(enabled = true) {
  return useQuery({
    queryKey: qk.stats,
    queryFn: () => get<{ stats: DashboardStats }>('/api/stats'),
    enabled,
  })
}

// ---------------- Auth mutations ----------------

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      post<{ admin: AdminUser }>('/api/auth/login', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.me })
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => post<{ success: boolean }>('/api/auth/logout'),
    onSuccess: () => {
      qc.setQueryData(qk.me, { admin: null })
      qc.invalidateQueries()
    },
  })
}

// ---------------- Project mutations ----------------

export function useSaveProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: ProjectInput }) =>
      id ? put<{ project: Project }>(`/api/projects/${id}`, data) : post<{ project: Project }>('/api/projects', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: qk.stats })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del<{ success: boolean }>(`/api/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: qk.stats })
    },
  })
}

// ---------------- Skill mutations ----------------

export function useSaveSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: SkillInput }) =>
      id ? put<{ skill: Skill }>(`/api/skills/${id}`, data) : post<{ skill: Skill }>('/api/skills', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.skills }),
  })
}

export function useDeleteSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del<{ success: boolean }>(`/api/skills/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.skills }),
  })
}

// ---------------- Experience mutations ----------------

export function useSaveExperience() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: ExperienceInput }) =>
      id
        ? put<{ experience: Experience }>(`/api/experiences/${id}`, data)
        : post<{ experience: Experience }>('/api/experiences', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.experiences }),
  })
}

export function useDeleteExperience() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del<{ success: boolean }>(`/api/experiences/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.experiences }),
  })
}

// ---------------- Message mutations ----------------

export function useSendMessage() {
  return useMutation({
    mutationFn: (data: MessageInput) => post<{ message: Message }>('/api/messages', data),
  })
}

export function useMarkMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) =>
      patch<{ message: Message }>(`/api/messages/${id}`, { read }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.messages })
      qc.invalidateQueries({ queryKey: qk.stats })
    },
  })
}

export function useDeleteMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del<{ success: boolean }>(`/api/messages/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.messages })
      qc.invalidateQueries({ queryKey: qk.stats })
    },
  })
}

// ---------------- Settings mutations ----------------

export function useSaveSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SiteSettingsInput) => put<{ settings: SiteSettings }>('/api/settings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.settings }),
  })
}

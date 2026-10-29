import { create } from 'zustand'

export type AppView = 'portfolio' | 'admin'

interface UIState {
  view: AppView
  setView: (view: AppView) => void
  /** Active admin dashboard tab */
  adminTab: string
  setAdminTab: (tab: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  view: 'portfolio',
  setView: (view) => {
    set({ view })
    if (typeof window !== 'undefined') {
      const newHash = view === 'admin' ? '#admin' : ''
      if (window.location.hash !== newHash) {
        // Use replaceState to avoid polluting history when switching views
        window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash)
      }
    }
  },
  adminTab: 'overview',
  setAdminTab: (adminTab) => set({ adminTab }),
}))

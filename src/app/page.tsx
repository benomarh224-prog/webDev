'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useAdmin } from '@/hooks/use-portfolio'
import { PortfolioView } from '@/components/portfolio/portfolio-view'
import { LoginScreen } from '@/components/admin/login-screen'
import { AdminApp } from '@/components/admin/admin-app'

export default function Home() {
  const view = useUIStore((s) => s.view)
  const setView = useUIStore((s) => s.setView)
  const { data, isLoading } = useAdmin()

  // Keep the view in sync with the URL hash (#admin) so the dashboard
  // can be bookmarked / refreshed. replaceState in the store avoids loops.
  useEffect(() => {
    const applyHash = () => {
      setView(window.location.hash === '#admin' ? 'admin' : 'portfolio')
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [setView])

  if (view === 'admin') {
    if (isLoading) {
      return (
        <div className="min-h-screen grid place-items-center bg-background">
          <Loader2
            className="h-8 w-8 animate-spin text-primary"
            aria-label="Loading admin session"
          />
        </div>
      )
    }
    return data?.admin ? <AdminApp /> : <LoginScreen />
  }

  return <PortfolioView />
}

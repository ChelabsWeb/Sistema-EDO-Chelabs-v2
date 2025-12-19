'use client'

import { useState, useEffect } from 'react'
import type { UserRole } from '@/types/database'

export type LayoutType = 'mobile' | 'desktop'

interface UseRoleBasedLayoutOptions {
  role: UserRole | null
}

interface UseRoleBasedLayoutReturn {
  layoutType: LayoutType
  isMobile: boolean
  isDesktop: boolean
  showBottomNav: boolean
  showSidebar: boolean
}

const MOBILE_BREAKPOINT = 768 // md breakpoint

/**
 * Hook to determine layout based on user role and viewport
 *
 * Rules:
 * - JO (jefe_obra) ALWAYS gets mobile layout regardless of viewport
 * - DO (director_obra) and Compras get desktop layout on ≥768px, mobile on <768px
 * - Admin gets desktop layout on ≥768px, mobile on <768px
 */
export function useRoleBasedLayout({ role }: UseRoleBasedLayoutOptions): UseRoleBasedLayoutReturn {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : MOBILE_BREAKPOINT
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Set initial value
    setWindowWidth(window.innerWidth)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // JO always gets mobile layout
  const isJO = role === 'jefe_obra'

  // Determine layout based on role and viewport
  const isMobileViewport = windowWidth < MOBILE_BREAKPOINT
  const layoutType: LayoutType = isJO || isMobileViewport ? 'mobile' : 'desktop'

  return {
    layoutType,
    isMobile: layoutType === 'mobile',
    isDesktop: layoutType === 'desktop',
    showBottomNav: layoutType === 'mobile',
    showSidebar: layoutType === 'desktop',
  }
}

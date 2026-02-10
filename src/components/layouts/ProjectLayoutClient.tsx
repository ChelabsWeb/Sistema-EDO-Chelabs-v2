'use client'

import { ProjectHeader } from '@/components/edo/obra/ProjectHeader'
import type { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProjectLayoutClientProps {
    children: React.ReactNode
    projectId: string
    userRole: UserRole | null
    userName: string | null
    userEmail: string | null
}

export function ProjectLayoutClient({
    children,
    projectId,
    userRole,
    userName,
    userEmail,
}: ProjectLayoutClientProps) {
    return (
        <div className="min-h-screen bg-transparent text-foreground relative overflow-hidden selection:bg-blue-500/30 transition-colors duration-500">
            {/* Background noise texture */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
                        backgroundSize: '128px 128px'
                    }}
                />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Project Specific Header */}
                <ProjectHeader
                    projectId={projectId}
                    userRole={userRole}
                    userName={userName}
                />

                {/* Main Content - Full Screen (no sidebar) */}
                <main className="flex-1 animate-apple-fade-in">
                    {children}
                </main>
            </div>
        </div>
    )
}

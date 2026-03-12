'use client'

import { ProjectHeader } from '@/components/edo/obra/ProjectHeader'
import type { UserRole } from '@/types/database'

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
        <div className="flex flex-col space-y-6 w-full animate-in fade-in duration-500">
            <ProjectHeader
                projectId={projectId}
                userRole={userRole}
                userName={userName}
            />
            <div className="flex-1 w-full">
                {children}
            </div>
        </div>
    )
}

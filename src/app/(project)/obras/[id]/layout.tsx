import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectLayoutClient } from '@/components/layouts/ProjectLayoutClient'
import type { Usuario, UserRole } from '@/types/database'

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    const isDemo = process.env.DEMO_MODE === 'true'

    let userProfile: any = null
    let userEmail: string | null = null

    if (isDemo) {
        userProfile = {
            id: 'demo-user',
            nombre: 'Usuario Demo',
            rol: 'admin' as UserRole,
            email: 'demo@chelabs.com',
            auth_user_id: 'demo-auth',
            activo: true,
            obra_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null
        }
        userEmail = 'demo@chelabs.com'
    } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) redirect('/auth/login')
        userEmail = user.email ?? null

        const { data: profile } = await supabase
            .from('usuarios')
            .select('*')
            .eq('auth_user_id', user.id)
            .single()

        userProfile = profile as Usuario | null
    }

    return (
        <ProjectLayoutClient
            projectId={id}
            userRole={userProfile?.rol ?? null}
            userName={userProfile?.nombre ?? null}
            userEmail={userEmail}
        >
            {children}
        </ProjectLayoutClient>
    )
}

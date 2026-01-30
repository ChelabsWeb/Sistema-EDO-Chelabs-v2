import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportAnalytics } from '@/components/reportes/ReportAnalytics'
import { Activity, BarChart3, TrendingDown, Wallet } from 'lucide-react'

export default async function ReportesPage() {
    const supabase = await createClient()
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (!isDemo) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) redirect('/auth/login')
    }

    // Mock data for the Demo Analytics experience
    const mockEfficiencyData = [
        { material: 'Hemento Portland', estimado: 1200, real: 1280, unidad: 'kg' },
        { material: 'Arena Fina', estimado: 500, real: 480, unidad: 'm3' },
        { material: 'Hierro 8mm', estimado: 800, real: 850, unidad: 'm' },
        { material: 'Ladrillo Campo', estimado: 5000, real: 5200, unidad: 'un' },
        { material: 'Piedra Partida', estimado: 300, real: 310, unidad: 'm3' },
    ]

    const mockMonthlyInvestment = [
        { name: 'Ene', inversion: 450000, presupuesto: 500000 },
        { name: 'Feb', inversion: 520000, presupuesto: 500000 },
        { name: 'Mar', inversion: 480000, presupuesto: 500000 },
        { name: 'Abr', inversion: 610000, presupuesto: 600000 },
        { name: 'May', inversion: 550000, presupuesto: 600000 },
        { name: 'Jun', inversion: 670000, presupuesto: 650000 },
    ]

    const mockTopDeviations = [
        { item: 'Mano de Obra - Cimientos', desvio: 15.4, costo: 125000, trend: 'up' },
        { item: 'Hierro de Armadura', desvio: 8.2, costo: 85000, trend: 'up' },
        { item: 'Arena y Gravilla', desvio: -2.1, costo: 42000, trend: 'down' },
    ]

    return (
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-black p-6 md:p-14 antialiased">
            <ReportAnalytics
                efficiencyData={mockEfficiencyData}
                monthlyInvestment={mockMonthlyInvestment}
                topDeviations={mockTopDeviations}
            />
        </div>
    )
}

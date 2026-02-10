import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportAnalytics } from '@/components/reportes/ReportAnalytics'

export default async function ReportesPage() {
    const supabase = await createClient()
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (!isDemo) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) redirect('/auth/login')
    }

    // Mock data for the Demo Analytics experience
    const mockEfficiencyData = [
        { material: 'Cemento Portland', estimado: 1200, real: 1280, unidad: 'kg' },
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

    const mockTopDeviations: { item: string; desvio: number; costo: number; trend: 'up' | 'down' }[] = [
        { item: 'Mano de Obra - Cimientos', desvio: 15.4, costo: 125000, trend: 'up' },
        { item: 'Hierro de Armadura', desvio: 8.2, costo: 85000, trend: 'up' },
        { item: 'Arena y Gravilla', desvio: -2.1, costo: 42000, trend: 'down' },
    ]

    const mockRadarData = [
        { subject: 'Costo', A: 120, B: 110, fullMark: 150 },
        { subject: 'Tiempo', A: 98, B: 130, fullMark: 150 },
        { subject: 'Materiales', A: 86, B: 130, fullMark: 150 },
        { subject: 'Productividad', A: 99, B: 100, fullMark: 150 },
        { subject: 'Calidad', A: 85, B: 90, fullMark: 150 },
    ];

    const mockDistributionData = [
        { name: 'Cimientos', value: 4500, color: '#0071e3' },
        { name: 'Estructura', value: 3200, color: '#6366f1' },
        { name: 'Albañilería', value: 2800, color: '#10b981' },
        { name: 'Instalaciones', value: 1500, color: '#f59e0b' },
        { name: 'Terminaciones', value: 1000, color: '#ef4444' },
    ];

    return (
        <div className="min-h-screen bg-grid-pattern transition-all duration-500 overflow-x-hidden">
            <ReportAnalytics
                efficiencyData={mockEfficiencyData}
                monthlyInvestment={mockMonthlyInvestment}
                topDeviations={mockTopDeviations}
                radarData={mockRadarData}
                distributionData={mockDistributionData}
            />
        </div>
    )
}

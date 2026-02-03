'use client'

import { useState } from 'react'
import {
    AnimatedCard,
    AnimatedStatCard,
    AnimatedButton,
    AnimatedBadge,
    AnimatedProgress,
    AnimatedAlert,
    StaggeredList,
    PageTransition
} from '@/components/animated/AnimatedComponents'
import { RiveEmptyState } from '@/components/animated/RiveComponents'
import {
    Package, TrendingUp, Users, DollarSign,
    Zap, Download, Plus
} from 'lucide-react'

/**
 * Demo page showing all animated components
 * Visit: /demo/animations to see this page
 */

export default function AnimationsDemo() {
    const [loading, setLoading] = useState(false)
    const [showEmpty, setShowEmpty] = useState(false)

    const handleLoadingDemo = () => {
        setLoading(true)
        setTimeout(() => setLoading(false), 3000)
    }

    const demoItems = [
        { id: '1', content: <AnimatedCard title="Card 1" description="This card animates in" /> },
        { id: '2', content: <AnimatedCard title="Card 2" description="With a stagger effect" /> },
        { id: '3', content: <AnimatedCard title="Card 3" description="One after another" /> },
    ]

    return (
        <PageTransition>
            <div className="max-w-7xl mx-auto p-8 space-y-16">
                {/* Header */}
                <header className="space-y-4">
                    <div className="flex items-center gap-3">
                        <AnimatedBadge variant="default" pulse>
                            <Zap className="w-3 h-3 mr-1" />
                            Demo
                        </AnimatedBadge>
                    </div>
                    <h1 className="text-6xl font-black text-foreground tracking-tight">
                        Componentes Animados<span className="text-apple-blue">.</span>
                    </h1>
                    <p className="text-xl text-apple-gray-400 max-w-2xl">
                        Ejemplos de todos los componentes animados disponibles usando Framer Motion, shadcn/ui y Rive.
                    </p>
                </header>

                {/* Stats Grid */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-foreground">Tarjetas de Estadísticas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnimatedStatCard
                            title="Órdenes Activas"
                            value={24}
                            change="+12% vs mes anterior"
                            icon={Package}
                            trend="up"
                        />
                        <AnimatedStatCard
                            title="Inversión Total"
                            value="$1.2M"
                            change="+8.5% este mes"
                            icon={DollarSign}
                            trend="up"
                        />
                        <AnimatedStatCard
                            title="Eficiencia"
                            value="94%"
                            change="-2% vs objetivo"
                            icon={TrendingUp}
                            trend="down"
                        />
                        <AnimatedStatCard
                            title="Usuarios Activos"
                            value={156}
                            change="Sin cambios"
                            icon={Users}
                            trend="neutral"
                        />
                    </div>
                </section>

                {/* Buttons */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-foreground">Botones Animados</h2>
                    <div className="flex flex-wrap gap-4">
                        <AnimatedButton icon={Plus}>
                            Crear Nuevo
                        </AnimatedButton>
                        <AnimatedButton variant="outline" icon={Download}>
                            Descargar
                        </AnimatedButton>
                        <AnimatedButton
                            variant="secondary"
                            loading={loading}
                            onClick={handleLoadingDemo}
                        >
                            Probar Loading
                        </AnimatedButton>
                    </div>
                </section>

                {/* Badges */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-foreground">Badges Animados</h2>
                    <div className="flex flex-wrap gap-4">
                        <AnimatedBadge variant="default">En Progreso</AnimatedBadge>
                        <AnimatedBadge variant="success">Completado</AnimatedBadge>
                        <AnimatedBadge variant="warning">Pendiente</AnimatedBadge>
                        <AnimatedBadge variant="error">Cancelado</AnimatedBadge>
                        <AnimatedBadge variant="default" pulse>
                            <Zap className="w-3 h-3 mr-1" />
                            Urgente
                        </AnimatedBadge>
                    </div>
                </section>

                {/* Progress Bars */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-foreground">Barras de Progreso</h2>
                    <div className="space-y-4 max-w-2xl">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-apple-gray-400">Obra Principal</span>
                                <span className="text-sm font-black text-foreground">75%</span>
                            </div>
                            <AnimatedProgress value={75} color="bg-apple-blue" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-apple-gray-400">Presupuesto Utilizado</span>
                                <span className="text-sm font-black text-foreground">92%</span>
                            </div>
                            <AnimatedProgress value={92} color="bg-amber-500" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-apple-gray-400">Materiales Recibidos</span>
                                <span className="text-sm font-black text-foreground">45%</span>
                            </div>
                            <AnimatedProgress value={45} color="bg-emerald-500" />
                        </div>
                    </div>
                </section>

                {/* Alerts */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-foreground">Alertas Animadas</h2>
                    <div className="space-y-4 max-w-2xl">
                        <AnimatedAlert
                            variant="info"
                            title="Información"
                            description="Esta es una alerta informativa con animación de entrada."
                        />
                        <AnimatedAlert
                            variant="success"
                            title="¡Éxito!"
                            description="La operación se completó correctamente."
                        />
                        <AnimatedAlert
                            variant="warning"
                            title="Advertencia"
                            description="El presupuesto está cerca de agotarse."
                        />
                        <AnimatedAlert
                            variant="error"
                            title="Error"
                            description="No se pudo completar la operación."
                        />
                    </div>
                </section>

                {/* Staggered List */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-foreground">Lista con Efecto Stagger</h2>
                    <StaggeredList items={demoItems} />
                </section>

                {/* Empty State (Rive) */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-foreground">Estado Vacío (Rive)</h2>
                    <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] border border-apple-gray-100 dark:border-white/5 p-8">
                        {!showEmpty ? (
                            <div className="text-center py-12">
                                <AnimatedButton onClick={() => setShowEmpty(true)}>
                                    Mostrar Estado Vacío
                                </AnimatedButton>
                            </div>
                        ) : (
                            <RiveEmptyState
                                title="No hay órdenes de trabajo"
                                description="Crea tu primera orden de trabajo para comenzar a gestionar la ejecución de obra."
                                actionLabel="Nueva Orden de Trabajo"
                                onAction={() => setShowEmpty(false)}
                            />
                        )}
                    </div>
                    <p className="text-sm text-apple-gray-400 italic">
                        Nota: Para que funcione completamente, necesitas agregar archivos .riv en public/animations/
                    </p>
                </section>

                {/* Instructions */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-black text-foreground">Cómo Usar</h2>
                    <div className="bg-apple-gray-50 dark:bg-white/5 rounded-[32px] p-8 space-y-4">
                        <h3 className="text-xl font-black text-foreground">Importa los componentes:</h3>
                        <pre className="bg-black/5 dark:bg-black/20 p-4 rounded-2xl overflow-x-auto">
                            <code className="text-sm text-apple-gray-400 font-mono">
                                {`import { 
  AnimatedCard, 
  AnimatedStatCard,
  AnimatedButton 
} from '@/components/animated/AnimatedComponents'

import { 
  RiveEmptyState,
  RiveLoader 
} from '@/components/animated/RiveComponents'`}
                            </code>
                        </pre>
                        <p className="text-apple-gray-400">
                            Consulta <code className="px-2 py-1 bg-black/5 dark:bg-black/20 rounded text-sm">ANIMATION_GUIDE.md</code> para más ejemplos y documentación completa.
                        </p>
                    </div>
                </section>
            </div>
        </PageTransition>
    )
}

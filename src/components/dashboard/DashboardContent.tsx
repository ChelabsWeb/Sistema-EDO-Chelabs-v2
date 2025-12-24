'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { Building2, Plus, ClipboardList, ShoppingCart, AlertTriangle, TrendingUp, CheckCircle2, Clock } from 'lucide-react'

interface DashboardContentProps {
  userName: string
  obrasCount: number
  otEnEjecucion: number
  otPendientes: number
  otCerradas: number
  otsConDesvio: number
  otsConDesvioCritico: number
}

export function DashboardContent({
  userName,
  obrasCount,
  otEnEjecucion,
  otPendientes,
  otCerradas,
  otsConDesvio,
  otsConDesvioCritico,
}: DashboardContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const statsRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Initial state
      gsap.set('.page-header', { opacity: 0, y: -20 })
      gsap.set('.stat-card', { opacity: 0, y: 30, scale: 0.95 })
      gsap.set('.alert-card', { opacity: 0, x: -30 })
      gsap.set('.actions-section', { opacity: 0, y: 20 })
      gsap.set('.action-card', { opacity: 0, scale: 0.9 })

      // Animation timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.to('.page-header', { opacity: 1, y: 0, duration: 0.6 })
        .to('.stat-card', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
        }, '-=0.3')
        .to('.alert-card', { opacity: 1, x: 0, duration: 0.5 }, '-=0.3')
        .to('.actions-section', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .to('.action-card', {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
        }, '-=0.2')

      // Animate counters
      statsRefs.current.forEach((ref) => {
        if (!ref) return
        const value = parseInt(ref.dataset.value || '0', 10)
        if (value === 0) return

        const obj = { value: 0 }
        gsap.to(obj, {
          value,
          duration: 1.5,
          delay: 0.5,
          ease: 'power2.out',
          onUpdate: () => {
            ref.textContent = Math.round(obj.value).toString()
          }
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const stats = [
    {
      label: 'Obras Activas',
      value: obrasCount,
      icon: Building2,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/30',
    },
    {
      label: 'OT en Ejecucion',
      value: otEnEjecucion,
      icon: TrendingUp,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/30',
    },
    {
      label: 'OT Pendientes',
      value: otPendientes,
      icon: Clock,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/30',
    },
    {
      label: 'OT Cerradas',
      value: otCerradas,
      icon: CheckCircle2,
      color: 'green',
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-500/30',
    },
  ]

  const actions = [
    {
      href: '/obras',
      label: 'Ver Obras',
      icon: Building2,
      variant: 'default' as const,
    },
    {
      href: '/obras/nueva',
      label: 'Nueva Obra',
      icon: Plus,
      variant: 'primary' as const,
    },
    {
      href: '/ordenes-trabajo',
      label: 'Ordenes de Trabajo',
      icon: ClipboardList,
      variant: 'default' as const,
    },
    {
      href: '/ordenes-compra',
      label: 'Compras',
      icon: ShoppingCart,
      variant: 'default' as const,
    },
  ]

  return (
    <div ref={containerRef} className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="page-header mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[--color-apple-gray-600] tracking-tight">
          Bienvenido, {userName}
        </h1>
        <p className="text-[--color-apple-gray-400] mt-2 text-lg">
          Resumen del estado de tus obras
        </p>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="stat-card group relative bg-white rounded-[24px] p-6 border border-white/50
                shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300
                hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:scale-[1.02]
                overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0
                group-hover:opacity-[0.03] transition-opacity duration-300`} />

              {/* Icon with gradient */}
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient}
                flex items-center justify-center shadow-lg ${stat.shadow} mb-4
                group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>

              {/* Animated Counter */}
              <div
                ref={(el) => { statsRefs.current[index] = el }}
                data-value={stat.value}
                className="relative text-4xl font-bold text-[--color-apple-gray-600] counter-value"
              >
                0
              </div>

              <div className="relative text-sm text-[--color-apple-gray-400] mt-1 font-medium">
                {stat.label}
              </div>

              {/* Bottom indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}
                rounded-b-[24px] transform scale-x-0 group-hover:scale-x-100
                transition-transform duration-300 origin-left`} />
            </div>
          )
        })}
      </div>

      {/* Deviation Alert */}
      {otsConDesvio > 0 && (
        <div
          className={`alert-card mb-8 p-6 rounded-[20px] border animate-pulse-soft
            ${otsConDesvioCritico > 0
              ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50'
              : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200/50'
            }`}
        >
          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4
                ${otsConDesvioCritico > 0
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30'
                  : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30'
                }`}
            >
              <AlertTriangle className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className={`font-semibold text-lg ${otsConDesvioCritico > 0 ? 'text-red-700' : 'text-orange-700'}`}>
                {otsConDesvio} OT{otsConDesvio > 1 ? 's' : ''} con desvio de presupuesto
                {otsConDesvioCritico > 0 && (
                  <span className="ml-2 text-sm font-medium opacity-80">
                    ({otsConDesvioCritico} critico{otsConDesvioCritico > 1 ? 's' : ''} &gt;20%)
                  </span>
                )}
              </p>
              <p className="text-sm text-[--color-apple-gray-500] mt-0.5">
                Revisa las ordenes de trabajo que exceden su costo estimado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Premium Section */}
      <div className="actions-section bg-white rounded-[24px] p-6 md:p-8 border border-white/50
        shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <h2 className="text-xl font-bold text-[--color-apple-gray-600] mb-6 tracking-tight">
          Acciones Rapidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            const isPrimary = action.variant === 'primary'
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`action-card group flex flex-col items-center justify-center p-6
                  rounded-[20px] min-h-[120px] transition-all duration-300
                  active:scale-[0.97] relative overflow-hidden
                  ${isPrimary
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                    : 'bg-[--color-apple-gray-50] hover:bg-[--color-apple-gray-100]'
                  }`}
              >
                {/* Glow effect for primary */}
                {isPrimary && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                    -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                )}

                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center mb-3
                  transition-transform duration-300 group-hover:scale-110
                  ${isPrimary
                    ? 'bg-white/20'
                    : 'bg-white shadow-md'
                  }`}>
                  <Icon
                    className={`w-6 h-6 ${isPrimary ? 'text-white' : 'text-[--color-apple-gray-500]'}`}
                    strokeWidth={1.5}
                  />
                </div>
                <span className={`relative text-sm font-semibold text-center
                  ${isPrimary ? 'text-white' : 'text-[--color-apple-gray-600]'}`}>
                  {action.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* System Status - Only show if no obras */}
      {obrasCount === 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50
          rounded-[20px] p-6 animate-float">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600
              flex items-center justify-center mr-4 shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-blue-700">
                Comenza creando tu primera obra
              </p>
              <p className="text-sm text-blue-600/70 mt-0.5">
                El sistema esta listo para comenzar a gestionar tus proyectos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

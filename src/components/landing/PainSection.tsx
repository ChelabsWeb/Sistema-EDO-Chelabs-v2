'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PainSection() {
  const pains = [
    {
      title: 'Desvíos de Presupuesto',
      description: 'Materiales no contabilizados y compras de emergencia que destruyen la rentabilidad planificada.',
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    },
    {
      title: 'Caos Logístico',
      description: 'Materiales que no llegan a tiempo a la obra, generando tiempos muertos y cuadrillas ociosas.',
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    {
      title: 'Falta de Trazabilidad',
      description: 'Órdenes de trabajo ambiguas y papeleo perdido que hacen imposible una auditoría real.',
      icon: AlertTriangle,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ]

  return (
    <section className="w-full py-32 bg-slate-50 dark:bg-[#0b0f1a] border-t border-black/5 dark:border-white/5 relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(#94a3b8 0.5px, transparent 0.5px)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-extrabold uppercase tracking-widest mb-8"
          >
            El Problema Real
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 text-balance font-display"
          >
            ¿Dónde se escapa la rentabilidad de tu obra?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
          >
            La construcción moderna no perdona ineficiencias. Cada error de cálculo y falta de coordinación se paga con los márgenes del proyecto.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 * (i + 1) }}
              className="p-8 rounded-[2rem] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 relative group cursor-default shadow-sm hover:shadow-xl dark:shadow-none transition-shadow duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-transparent dark:border-white/5 shadow-sm group-hover:scale-110 transition-transform duration-500", pain.bg)}>
                <pain.icon className={cn("w-6 h-6", pain.color)} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">{pain.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{pain.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

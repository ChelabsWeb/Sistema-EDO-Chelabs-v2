'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, ArrowRight, DollarSign } from 'lucide-react'
import { LandingButton } from '@/components/ui/landing-button'

export function ROICalculator() {
  const [obras, setObras] = useState<number>(3)
  const [presupuesto, setPresupuesto] = useState<number>(500000)
  
  // Asumimos un sobrecosto promedio del 8% por falta de control (dato típico en construcción)
  const sobreecostoPorcentaje = 0.08
  const perdidaAnual = obras * presupuesto * sobreecostoPorcentaje
  const ahorroPotencial = perdidaAnual * 0.75 // EDO puede salvar el 75% de esas pérdidas

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <section className="w-full py-32 relative overflow-hidden bg-white dark:bg-[#0b0f1a]">
      <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 skew-y-3 origin-top-left -z-10" />
      
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-widest mb-8"
            >
              Calculadora de ROI
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight font-display"
            >
              Calcula cuánto <span className="text-blue-600 dark:text-blue-500">sobrecosto</span> asumes hoy
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed"
            >
              La falta de trazabilidad en materiales y cuadrillas genera un promedio del 8% de sobrecostos en la industria. Ingresa tus datos reales y descubre cuánto dinero puedes retener al mes usando Sistema EDO.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-white/[0.03] rounded-[2.5rem] p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] -z-10 group-hover:bg-blue-400/30 transition-colors duration-500" />
            
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Obras activas por año
                  </label>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{obras}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={obras}
                  onChange={(e) => setObras(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Presupuesto medio por obra
                  </label>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(presupuesto)}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="5000000"
                  step="50000"
                  value={presupuesto}
                  onChange={(e) => setPresupuesto(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="pt-8 border-t border-slate-200 dark:border-white/10">
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Pérdida anual estimada (8%)
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-red-500 mb-6 drop-shadow-sm">
                  -{formatCurrency(perdidaAnual)}
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-500/20">
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                    Retorno con EDO (Ahorro 75%)
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-emerald-500 dark:text-emerald-400">
                    +{formatCurrency(ahorroPotencial)}
                  </div>
                </div>
              </div>

              <LandingButton href="/auth/register" intent="primary" size="full" className="group mt-8">
                Recuperar estos márgenes
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </LandingButton>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

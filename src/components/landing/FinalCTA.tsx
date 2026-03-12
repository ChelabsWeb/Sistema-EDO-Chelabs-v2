'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Calendar, CheckCircle2 } from 'lucide-react'
import { LandingButton } from '@/components/ui/landing-button'
import { Logo } from '@/components/shared/Logo'

export function FinalCTA() {
  return (
    <section className="w-full py-32 relative overflow-hidden bg-white dark:bg-[#0b0f1a]">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-white/[0.03] rounded-[3rem] p-10 md:p-20 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden text-center max-w-5xl mx-auto"
        >
          {/* Subtle logo background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <Logo size={400} />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 text-balance font-display"
            >
              ¿Listo para construir con <span className="text-blue-600 dark:text-blue-500">certeza</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-500 dark:text-slate-400 font-medium mb-12 leading-relaxed"
            >
              Agenda hoy una Evaluación de Procesos con nuestros expertos. Analizaremos tu operación sin compromiso y te mostraremos exactamente dónde estás perdiendo rentabilidad.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
            >
              <LandingButton href="/auth/register" intent="primary" size="md" className="w-full sm:w-auto group px-8">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Evaluación Gratuita
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </LandingButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-bold text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Llamada consultiva de 15 min
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sin demo guiada forzada
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Onboarding en 48 horas
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

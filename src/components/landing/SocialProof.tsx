'use client'

import { motion } from 'framer-motion'
import { Star, Building2, Quote } from 'lucide-react'

export function SocialProof() {
  const testimonials = [
    {
      quote: "Desde que implementamos EDO, redujimos nuestros sobrecostos operativos en un 14% en los primeros dos trimestres. Tener control en tiempo real de los insumos en obra cambió las reglas del juego.",
      author: "Carlos Mendoza",
      role: "Director de Obra",
      company: "Constructora Urbania",
      image: "CM"
    },
    {
      quote: "La fluidez entre la orden de compra y la recepción de materiales nos ahorró cientos de horas de trabajo administrativo mensual. Es la plataforma que nuestra industria necesitaba.",
      author: "Elena Ríos",
      role: "Gerente de Finanzas",
      company: "Vertical S.A.",
      image: "ER"
    }
  ]

  return (
    <section className="w-full py-32 bg-slate-50 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 border border-slate-300/50 dark:border-white/20 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-widest mb-8"
          >
            Validación de la Industria
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 text-balance font-display"
          >
            Constructores que ya blindan sus márgenes
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 * i }}
              className="bg-white dark:bg-[#0b0f1a] p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm relative group hover:shadow-xl transition-all duration-500"
            >
              <Quote className="absolute top-10 right-10 w-12 h-12 text-slate-100 dark:text-white/5 group-hover:text-blue-50 dark:group-hover:text-blue-500/10 transition-colors" />
              
              <div className="flex gap-1 mb-8 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-current" />
                ))}
              </div>

              <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-10">
                "{test.quote}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xl border border-slate-200 dark:border-white/10">
                  {test.image}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{test.author}</h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    {test.role} <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /> <Building2 className="w-3 h-3" /> {test.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Construction, BarChart3, Package, ArrowRight } from 'lucide-react'

export function BeamAnimation() {
  return (
    <div className="w-full h-48 md:h-64 relative flex items-center justify-center bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden mb-16">
      {/* Background Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200/50 to-transparent dark:from-white/[0.05] dark:to-transparent" />
      
      <div className="relative w-full max-w-2xl px-8 flex justify-between items-center z-10">
        
        {/* Node 1: Obras */}
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0f1322] border border-blue-200 dark:border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Construction className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Obras</span>
        </div>

        {/* Node 2: Compras */}
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0f1322] border border-orange-200 dark:border-orange-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.2)]">
            <Package className="w-8 h-8 text-orange-600 dark:text-orange-500" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logística</span>
        </div>

        {/* Node 3: Presupuesto */}
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#0f1322] border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <BarChart3 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Finanzas</span>
        </div>

        {/* Beams (SVG Connections) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          {/* Path from Obras to Compras */}
          <path
            d="M 15% 50% L 50% 50%"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-slate-200 dark:text-white/10"
            strokeDasharray="4 4"
          />
          <motion.path
            d="M 15% 50% L 50% 50%"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-blue-500 dark:text-blue-400"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Path from Compras to Finanzas */}
          <path
            d="M 50% 50% L 85% 50%"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-slate-200 dark:text-white/10"
            strokeDasharray="4 4"
          />
          <motion.path
            d="M 50% 50% L 85% 50%"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-orange-500 dark:text-orange-400"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>

        {/* Moving Particles */}
        <motion.div
          className="absolute top-1/2 left-[15%] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
          style={{ transform: 'translateY(-50%)' }}
          animate={{ left: ['15%', '50%'], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-[50%] w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"
          style={{ transform: 'translateY(-50%)' }}
          animate={{ left: ['50%', '85%'], opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Central Notification Popup */}
      <motion.div 
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#0f1322] border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 z-20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Datos sincronizados</span>
      </motion.div>
    </div>
  )
}

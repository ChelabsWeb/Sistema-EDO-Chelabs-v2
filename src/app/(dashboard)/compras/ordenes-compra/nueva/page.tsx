import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NuevaOrdenCompraForm } from './nueva-oc-form'

export default async function NuevaOrdenCompraPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Obtener obras activas para el select del formulario
  const { data: obras } = await supabase
    .from('obras')
    .select('id, nombre')
    .is('deleted_at', null)
    .order('nombre')

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 antialiased pb-32 px-8 pt-10">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8 animate-apple-fade-in">
        <Link
          href="/compras/ordenes-compra"
          className="w-12 h-12 rounded-full bg-apple-gray-50 dark:bg-white/5 flex items-center justify-center text-apple-gray-400 hover:text-foreground hover:bg-apple-gray-100 dark:hover:bg-white/10 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase font-display">
            Nueva Orden de Compra
          </h2>
          <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest mt-1">
            Emisión de documento para proveedores
          </p>
        </div>
      </div>

      <main className="animate-apple-slide-up" style={{ animationDelay: '0.1s' }}>
        <NuevaOrdenCompraForm obras={obras || []} />
      </main>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { OTCreateForm } from '@/components/edo/ot/ot-create-form'
import { ArrowLeft, Hammer, Info, LayoutGrid } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function NuevaOTPage({ params }: Props) {
  const { id: obraId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get obra info
  const { data: obra } = await supabase
    .from('obras')
    .select('id, nombre')
    .eq('id', obraId)
    .single()

  if (!obra) notFound()

  // Get rubros for this obra
  const { data: rubros } = await supabase
    .from('rubros')
    .select('id, nombre, unidad, presupuesto')
    .eq('obra_id', obraId)
    .order('nombre')

  // Get insumos for this obra
  const { data: insumosObra } = await supabase
    .from('insumos')
    .select('id, nombre, unidad, tipo, precio_referencia, precio_unitario')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('nombre')

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black p-6 md:p-14 antialiased">
      {/* Header Glassmorphic */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 backdrop-blur-xl bg-white/70 dark:bg-apple-gray-50/70 border-b border-apple-gray-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href={`/obras/${obraId}/ordenes-trabajo`}
            className="w-12 h-12 glass dark:glass-dark rounded-full flex items-center justify-center hover:scale-110 transition-all active:scale-95 group shadow-apple-sm"
          >
            <ArrowLeft className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue" />
          </Link>
          <div>
            <p className="text-[10px] font-black text-apple-blue uppercase tracking-[0.2em] mb-0.5">Gestión de Obra</p>
            <h1 className="text-xl font-black text-foreground tracking-tight">Nueva Orden de Trabajo</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-apple-gray-50 dark:bg-white/5 rounded-full border border-apple-gray-100 dark:border-white/10">
          <LayoutGrid className="w-4 h-4 text-apple-gray-300" />
          <span className="text-xs font-bold text-apple-gray-400">{obra.nombre}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto pt-28 pb-20 animate-apple-slide-up">
        {(!rubros || rubros.length === 0) ? (
          <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-16 text-center border border-apple-gray-100 dark:border-white/5 shadow-apple-float">
            <div className="w-24 h-24 bg-amber-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8">
              <Hammer className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className="text-3xl font-black text-foreground tracking-tighter mb-4">No hay rubros de base</h3>
            <p className="text-lg text-apple-gray-400 font-medium mb-10 max-w-md mx-auto">
              Necesitas definir al menos un rubro en esta obra para poder asignar órdenes de trabajo.
            </p>
            <Link
              href={`/obras/${obraId}/rubros/nuevo`}
              className="inline-flex items-center gap-3 px-10 py-5 bg-apple-blue text-white text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-95"
            >
              Crear primer rubro
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">Configuración de Tarea</h2>
              <p className="text-lg text-apple-gray-400 font-medium tracking-tight">Define el alcance, selecciona los recursos y monitorea el presupuesto en tiempo real.</p>
            </div>

            <div className="bg-white dark:bg-apple-gray-50 rounded-[48px] p-10 md:p-14 border border-apple-gray-100 dark:border-white/5 shadow-apple-float overflow-hidden relative">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-apple-blue/5 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <OTCreateForm
                obraId={obraId}
                rubros={rubros}
                insumosObra={(insumosObra || []) as any}
              />
            </div>

            {/* Hint Box */}
            <div className="flex items-center gap-4 px-8 py-6 glass dark:glass-dark rounded-[32px] border border-apple-gray-100 dark:border-white/10">
              <Info className="w-6 h-6 text-apple-blue shrink-0" />
              <p className="text-xs font-bold text-apple-gray-400 leading-relaxed uppercase tracking-widest">
                La Orden de Trabajo se creará en estado <span className="text-foreground">BORRADOR</span>. Deberá ser aprobada por un Director de Obra antes de iniciar el consumo de materiales.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Building2, CalendarIcon, FileText, ShoppingCart,
  Save, Loader2, Plus, Trash2, Box, BadgeDollarSign, Sparkles
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatPesos } from '@/lib/utils/currency' 
import { motion, AnimatePresence } from 'framer-motion'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

interface Obra {
  id: string
  nombre: string
}

interface NuevaOrdenCompraFormProps {
  obras: Obra[]
}

const itemSchema = z.object({
  descripcion: z.string().min(2, "La descripción es requerida."),
  cantidad: z.coerce.number().min(0.01, "Debe ser mayor a 0"),
  precio_unitario: z.coerce.number().min(0, "No puede ser negativo"),
})

const formSchema = z.object({
  proveedor: z.string().min(2, "El nombre del proveedor es requerido."),
  fecha_emision: z.date(),
  obra_id: z.string().min(1, "Selecciona una obra vinculada."),
  notas: z.string().optional(),
  items: z.array(itemSchema).min(1, "Debes agregar al menos un insumo/partida a la OC."),
})

type FormValues = z.infer<typeof formSchema>

export function NuevaOrdenCompraForm({ obras }: NuevaOrdenCompraFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      proveedor: '',
      obra_id: '',
      notas: '',
      items: [{ descripcion: '', cantidad: 1, precio_unitario: 0 }],
    },
  })

  // Hook robusto de react-hook-form para campos dinámicos
  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  })

  // Cálculo del total reactivo
  const formItems = form.watch("items")
  const subtotalOC = formItems.reduce((acc, item) => {
    return acc + ((Number(item.cantidad) || 0) * (Number(item.precio_unitario) || 0))
  }, 0)

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      // AQUÍ IRÍA LA LLAMADA AL SERVER ACTION DE BASE DE DATOS
      // ej: await createOrdenCompra(values)
      console.log('Datos de OC a guardar:', values)
      
      // Simulación de delay de red
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      router.push('/compras/ordenes-compra')
      router.refresh()
    } catch (error) {
      console.error(error)
      // Idealmente, lanzar un toast de shadcn-sonner indicando el error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white dark:bg-apple-gray-50 rounded-[48px] shadow-apple-float border border-apple-gray-100 dark:border-white/5 overflow-hidden relative">
        {/* Accent Decoration Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple-blue/5 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

        <div className="p-10 md:p-16 space-y-16 relative z-10">
          
          {/* SECCIÓN 1: Datos Generales */}
          <section className="space-y-10">
            <div className="flex items-center gap-4 border-b border-apple-gray-50 dark:border-white/5 pb-8">
              <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue shadow-sm">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Datos Generales</h3>
                <p className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest">Información principal del proveedor</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FormField control={form.control} name="proveedor" render={({ field }) => (
                <FormItem className="space-y-4 md:col-span-1">
                  <div className="flex items-center gap-3 px-2">
                    <Building2 className="w-4 h-4 text-apple-blue" />
                    <FormLabel className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Proveedor / Razón Social</FormLabel>
                  </div>
                  <FormControl>
                    <Input placeholder="Ej. Barraca Maldonado" className="w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/5 focus-visible:ring-4 focus-visible:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none" {...field} />
                  </FormControl>
                  <FormMessage className="px-2" />
                </FormItem>
              )} />

              <FormField control={form.control} name="fecha_emision" render={({ field }) => (
                <FormItem className="space-y-4 flex flex-col pt-1.5 md:col-span-1">
                  <div className="flex items-center gap-3 px-2 mb-2">
                    <CalendarIcon className="w-4 h-4 text-apple-blue" />
                    <FormLabel className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Fecha de Emisión</FormLabel>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <button className={cn("w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 hover:bg-apple-gray-100 dark:hover:bg-white/5 px-6 font-bold text-left transition-all outline-none flex items-center gap-3", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-3xl" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-4" />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="px-2" />
                </FormItem>
              )} />

              <FormField control={form.control} name="obra_id" render={({ field }) => (
                <FormItem className="space-y-4 md:col-span-1">
                  <div className="flex items-center gap-3 px-2">
                    <Building2 className="w-4 h-4 text-apple-blue" />
                    <FormLabel className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Obra Asignada</FormLabel>
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full h-16 rounded-2xl bg-apple-gray-50 dark:bg-black/20 border border-apple-gray-100 dark:border-white/5 focus:ring-4 focus:ring-apple-blue/10 px-6 font-bold text-foreground transition-all outline-none">
                        <SelectValue placeholder="Destino del suministro..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl border-apple-gray-100 dark:border-white/10 dark:bg-[#0f111a] p-2">
                      {obras.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id} className="rounded-xl focus:bg-apple-gray-50 dark:focus:bg-white/5 cursor-pointer py-3 px-4">
                          <span className="font-bold">{obra.nombre}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="px-2" />
                </FormItem>
              )} />
            </div>
          </section>

          {/* SECCIÓN 2: Items / Partidas */}
          <section className="space-y-10 pt-10 border-t border-apple-gray-50 dark:border-white/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Detalle de Insumos</h3>
                  <p className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest">Líneas de pedido de compra</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-apple-gray-50/50 dark:bg-white/[0.02] border border-apple-gray-100/50 dark:border-white/5 rounded-[24px] items-start relative group"
                  >
                    <FormField control={form.control} name={`items.${index}.descripcion`} render={({ field }) => (
                      <FormItem className="md:col-span-5 space-y-2">
                        <FormLabel className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest ml-2">Descripción</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Cemento Portland 25kg" className="h-14 rounded-xl bg-white dark:bg-black/40 border-apple-gray-100 dark:border-white/5 font-bold" {...field} />
                        </FormControl>
                        <FormMessage className="ml-2 text-[10px]" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name={`items.${index}.cantidad`} render={({ field }) => (
                      <FormItem className="md:col-span-2 space-y-2">
                        <FormLabel className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest ml-2">Cantidad</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="0" className="h-14 rounded-xl bg-white dark:bg-black/40 border-apple-gray-100 dark:border-white/5 font-bold" {...field} />
                        </FormControl>
                        <FormMessage className="ml-2 text-[10px]" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name={`items.${index}.precio_unitario`} render={({ field }) => (
                      <FormItem className="md:col-span-3 space-y-2">
                        <FormLabel className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest ml-2">P. Unitario ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" placeholder="0.00" className="h-14 rounded-xl bg-white dark:bg-black/40 border-apple-gray-100 dark:border-white/5 font-bold" {...field} />
                        </FormControl>
                        <FormMessage className="ml-2 text-[10px]" />
                      </FormItem>
                    )} />

                    {/* Fila Calculada + Botón Eliminar */}
                    <div className="md:col-span-2 space-y-2 flex flex-col justify-end h-full pt-6 md:pt-0">
                      <FormLabel className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest ml-2 md:block hidden">Subtotal</FormLabel>
                      <div className="h-14 flex items-center justify-between w-full px-2">
                         <span className="font-black text-foreground tracking-tighter">
                            {formatPesos((Number(formItems[index]?.cantidad) || 0) * (Number(formItems[index]?.precio_unitario) || 0))}
                         </span>
                         {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-3 text-apple-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => append({ descripcion: '', cantidad: 1, precio_unitario: 0 })}
                className="w-full h-16 border-2 border-dashed border-apple-gray-200 dark:border-white/10 hover:border-apple-blue dark:hover:border-apple-blue/50 rounded-[24px] flex items-center justify-center gap-3 text-apple-gray-400 hover:text-apple-blue transition-colors font-black text-[11px] uppercase tracking-widest mt-4"
              >
                <Plus className="w-4 h-4" />
                Agregar Partida Adicional
              </button>
              {form.formState.errors.items && (
                 <p className="text-sm font-medium text-destructive mt-2 px-4">{form.formState.errors.items.message}</p>
              )}
            </div>
          </section>

          {/* SECCIÓN 3: Resumen y Notas */}
          <section className="space-y-10 pt-10 border-t border-apple-gray-50 dark:border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Notas */}
              <FormField control={form.control} name="notas" render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <FileText className="w-4 h-4 text-apple-blue" />
                    <FormLabel className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest">Condiciones Comerciales / Notas</FormLabel>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Ej. Entrega programada para viernes. Pago a 30 días..." 
                      className="w-full min-h-[160px] resize-none rounded-3xl bg-apple-gray-50 dark:bg-black/20 border-apple-gray-100 dark:border-white/5 focus-visible:ring-4 focus-visible:ring-apple-blue/10 p-6 font-medium text-foreground transition-all outline-none leading-relaxed" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="px-2" />
                </FormItem>
              )} />

              {/* Totalizador */}
              <div className="bg-apple-gray-50/50 dark:bg-white/[0.02] rounded-[32px] p-8 border border-apple-gray-100 dark:border-white/5 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <BadgeDollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-apple-gray-400 uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Total Proyectado</span>
                </div>
                
                <div className="text-5xl lg:text-6xl font-black text-foreground tracking-tighter relative z-10">
                  {formatPesos(subtotalOC)}
                </div>
                <p className="text-xs font-bold text-apple-gray-300 uppercase tracking-widest mt-4">
                  Impuestos y retenciones según proveedor.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Action Footer */}
        <footer className="px-10 py-8 bg-apple-gray-50/50 dark:bg-black/10 border-t border-apple-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-apple-blue" />
            </div>
            <p className="text-[10px] font-black text-apple-gray-300 uppercase tracking-[0.2em] max-w-[250px] leading-relaxed">
              Verifique los importes antes de emitir definitivamente la orden.
            </p>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
             <Link href="/compras/ordenes-compra" className="flex-1 md:flex-none px-8 py-3 text-[10px] font-black text-apple-gray-300 uppercase tracking-widest hover:text-foreground transition-all">Cancelar</Link>
             <button
              type="submit"
              disabled={loading}
              className="flex-[2] md:flex-none h-18 px-12 py-5 bg-apple-blue text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-apple-blue-dark transition-all shadow-apple-float active:scale-[0.96] flex items-center justify-center gap-4 disabled:opacity-30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Emitiendo...
                </>
              ) : (
                <>
                  Emitir Orden
                  <Save className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </footer>
      </form>
    </Form>
  )
}

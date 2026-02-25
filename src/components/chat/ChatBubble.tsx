'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageCircle, X, Send, User } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Mensaje {
    id: string
    remitente_id: string
    contenido: string
    creado_en: string
    leido: boolean
    remitente?: {
        nombre: string
    }
}

export function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [currentUser, setCurrentUser] = useState<string | null>(null)
    const [hasUnread, setHasUnread] = useState(false)

    const queryClient = useQueryClient()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const initUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setCurrentUser(user.id)
        }
        initUser()
    }, [])

    const { data: mensajes = [] } = useQuery({
        queryKey: ['chat-mensajes'],
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('mensajes')
                .select(`
          id, contenido, remitente_id, creado_en, leido,
          remitente:usuarios!mensajes_remitente_id_fkey(nombre)
        `)
                .order('creado_en', { ascending: true })
                .limit(100)

            if (error) throw error

            return (data || []).map((m: any) => ({
                ...m,
                remitente: Array.isArray(m.remitente) ? m.remitente[0] : m.remitente
            })) as Mensaje[]
        },
        enabled: !!currentUser,
    })

    useEffect(() => {
        if (!currentUser) return

        const supabase = createClient()
        const channel = supabase.channel('global-chat')

        channel
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'mensajes' },
                async (payload) => {
                    const newMsg = payload.new as Mensaje

                    if (newMsg.remitente_id !== currentUser) {
                        // Get sender name for the notification
                        const { data } = await supabase
                            .from('usuarios')
                            .select('nombre')
                            .eq('id', newMsg.remitente_id)
                            .single()

                        const remitente = data?.nombre || 'Alguien'
                        const msgObj = { ...newMsg, remitente: { nombre: remitente } }

                        queryClient.setQueryData<Mensaje[]>(['chat-mensajes'], old => [...(old || []), msgObj])

                        if (!isOpen) {
                            setHasUnread(true)
                            toast(remitente, {
                                description: newMsg.contenido,
                                icon: <MessageCircle className="w-4 h-4 text-apple-blue" />,
                            })
                            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUser, isOpen, queryClient])

    // Scroll to bottom when messages update
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            setHasUnread(false)
        }
    }, [mensajes, isOpen])

    const sendMutation = useMutation({
        mutationFn: async (contenido: string) => {
            if (!currentUser) throw new Error('Usuario no autenticado')
            const supabase = createClient()

            const { data, error } = await supabase
                .from('mensajes')
                .insert({
                    remitente_id: currentUser,
                    contenido,
                })
                .select(`
          id, contenido, remitente_id, creado_en, leido,
          remitente:usuarios!mensajes_remitente_id_fkey(nombre)
        `)
                .single()

            if (error) throw error
            return {
                ...data,
                remitente: Array.isArray(data.remitente) ? data.remitente[0] : data.remitente
            } as Mensaje
        },
        onMutate: async (contenido) => {
            await queryClient.cancelQueries({ queryKey: ['chat-mensajes'] })
            const previousMessages = queryClient.getQueryData<Mensaje[]>(['chat-mensajes'])

            const optimisticMsg: Mensaje = {
                id: `temp-${Date.now()}`,
                remitente_id: currentUser!,
                contenido,
                creado_en: new Date().toISOString(),
                leido: true,
                remitente: { nombre: 'Yo (Enviando...)' }
            }

            queryClient.setQueryData<Mensaje[]>(['chat-mensajes'], old => [...(old || []), optimisticMsg])
            return { previousMessages }
        },
        onError: (err, variables, context) => {
            if (context?.previousMessages) {
                queryClient.setQueryData(['chat-mensajes'], context.previousMessages)
            }
            toast.error('Error al enviar mensaje')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-mensajes'] })
        }
    })

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || sendMutation.isPending) return

        sendMutation.mutate(newMessage.trim())
        setNewMessage('')
    }

    if (!currentUser) return null

    return (
        <>
            {/* Floating Chat Button */}
            <div className="fixed bottom-24 md:bottom-8 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                        isOpen ? "bg-red-500 hover:bg-red-600 text-white hover:scale-105" : "bg-apple-blue hover:bg-apple-blue-dark text-white hover:scale-110",
                        hasUnread && !isOpen && "animate-bounce"
                    )}
                >
                    {isOpen ? <X className="w-6 h-6" /> : (
                        <div className="relative">
                            <MessageCircle className="w-6 h-6" />
                            {hasUnread && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
                            )}
                        </div>
                    )}
                </button>
            </div>

            {/* Chat Dialog Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed bottom-40 md:bottom-24 right-6 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-160px)] z-50 bg-white dark:bg-apple-gray-50 rounded-3xl shadow-2xl border border-apple-gray-100 dark:border-white/10 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 bg-apple-gray-50/50 dark:bg-white/[0.02] border-b border-apple-gray-100 dark:border-white/5 flex items-center gap-3">
                            <div className="w-10 h-10 bg-apple-blue/10 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-apple-blue" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground tracking-tight">Chat General de Obra</h3>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">En Línea</p>
                            </div>
                        </div>

                        {/* Message List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {mensajes.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-40">
                                    <MessageCircle className="w-12 h-12 mb-2" />
                                    <p className="text-xs font-bold tracking-tight">No hay mensajes recientes</p>
                                </div>
                            ) : (
                                mensajes.map((msg: Mensaje) => {
                                    const isMine = msg.remitente_id === currentUser
                                    const isOptimistic = msg.id.startsWith('temp-')

                                    return (
                                        <div key={msg.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                                            <span className="text-[9px] text-apple-gray-400 font-bold uppercase tracking-widest mb-1 ml-1">
                                                {isMine ? 'Tú' : msg.remitente?.nombre}
                                            </span>
                                            <div
                                                className={cn(
                                                    "max-w-[85%] px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed",
                                                    isMine
                                                        ? "bg-apple-blue text-white rounded-tr-sm"
                                                        : "bg-apple-gray-50 dark:bg-white/5 text-foreground border border-apple-gray-100 dark:border-white/5 rounded-tl-sm",
                                                    isOptimistic && "opacity-60"
                                                )}
                                            >
                                                {msg.contenido}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-apple-gray-50 border-t border-apple-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-apple-gray-50 dark:bg-black/20 h-12 px-5 rounded-full text-sm font-medium focus:ring-2 focus:ring-apple-blue/20 outline-none transition-all placeholder:text-apple-gray-300"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sendMutation.isPending}
                                    className="w-12 h-12 rounded-full bg-apple-blue text-white flex items-center justify-center hover:bg-apple-blue-dark transition-all disabled:opacity-50 active:scale-95"
                                >
                                    <Send className="w-5 h-5 ml-1" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

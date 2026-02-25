'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimePresenceState } from '@supabase/supabase-js'

interface UserPresence {
    user_id: string
    online_at: string
}

interface PresenceContextType {
    onlineUsers: Set<string>
    isOnline: (userId: string) => boolean
}

const PresenceContext = createContext<PresenceContextType>({
    onlineUsers: new Set(),
    isOnline: () => false,
})

export const usePresence = () => useContext(PresenceContext)

export function PresenceProvider({ children }: { children: React.ReactNode }) {
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

    useEffect(() => {
        let mounted = true
        const supabase = createClient()
        const channel = supabase.channel('global-presence')

        const initializePresence = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || !mounted) return

            channel
                .on('presence', { event: 'sync' }, () => {
                    const newState = channel.presenceState<UserPresence>()
                    const onlineSet = new Set<string>()

                    for (const key in newState) {
                        newState[key].forEach(presence => {
                            if (presence.user_id) onlineSet.add(presence.user_id)
                        })
                    }

                    if (mounted) setOnlineUsers(onlineSet)
                })
                .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                    setOnlineUsers(prev => {
                        const next = new Set(prev)
                        newPresences.forEach(p => p.user_id && next.add(p.user_id as string))
                        return next
                    })
                })
                .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                    setOnlineUsers(prev => {
                        const next = new Set(prev)
                        leftPresences.forEach(p => p.user_id && next.delete(p.user_id as string))
                        return next
                    })
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({
                            user_id: user.id,
                            online_at: new Date().toISOString(),
                        })
                    }
                })
        }

        initializePresence()

        return () => {
            mounted = false
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <PresenceContext.Provider value={{ onlineUsers, isOnline: (id) => onlineUsers.has(id) }}>
            {children}
        </PresenceContext.Provider>
    )
}

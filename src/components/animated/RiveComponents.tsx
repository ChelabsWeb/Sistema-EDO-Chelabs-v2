'use client'

import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

/**
 * Rive Animation Components
 * 
 * To use these, you need .riv files in your public/animations/ folder
 * Get free animations from: https://rive.app/community
 */

// 1. Basic Rive Animation
export function RiveAnimation({
    src,
    className = "w-64 h-64"
}: {
    src: string
    className?: string
}) {
    const { RiveComponent } = useRive({
        src,
        autoplay: true,
        layout: new Layout({
            fit: Fit.Contain,
            alignment: Alignment.Center
        })
    })

    return (
        <div className={className}>
            <RiveComponent />
        </div>
    )
}

// 2. Loading State with Rive
export function RiveLoader({
    message = "Cargando..."
}: {
    message?: string
}) {
    const { RiveComponent } = useRive({
        src: '/animations/loader.riv', // You need to add this file
        autoplay: true,
    })

    return (
        <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="w-48 h-48">
                <RiveComponent />
            </div>
            <p className="mt-4 text-apple-gray-400 font-medium">{message}</p>
        </motion.div>
    )
}

// 3. Empty State with Rive
export function RiveEmptyState({
    title = "No hay datos",
    description = "Comienza creando tu primer elemento",
    actionLabel = "Crear Nuevo",
    onAction,
    animationSrc = '/animations/empty-box.riv'
}: {
    title?: string
    description?: string
    actionLabel?: string
    onAction?: () => void
    animationSrc?: string
}) {
    const { RiveComponent } = useRive({
        src: animationSrc,
        autoplay: true,
    })

    return (
        <motion.div
            className="flex flex-col items-center justify-center py-20 px-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-64 h-64">
                <RiveComponent />
            </div>
            <motion.h3
                className="text-3xl font-black text-foreground mt-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {title}
            </motion.h3>
            <motion.p
                className="text-apple-gray-400 mt-2 max-w-md text-center leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {description}
            </motion.p>
            {onAction && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Button onClick={onAction} className="mt-6">
                        <Plus className="mr-2 h-4 w-4" />
                        {actionLabel}
                    </Button>
                </motion.div>
            )}
        </motion.div>
    )
}

// 4. Success Animation
export function RiveSuccess({
    title = "¡Éxito!",
    description = "La operación se completó correctamente",
    onContinue
}: {
    title?: string
    description?: string
    onContinue?: () => void
}) {
    const { RiveComponent } = useRive({
        src: '/animations/success.riv', // You need to add this file
        autoplay: true,
    })

    return (
        <motion.div
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
        >
            <div className="w-32 h-32">
                <RiveComponent />
            </div>
            <h3 className="text-2xl font-black text-foreground mt-4">{title}</h3>
            <p className="text-apple-gray-400 mt-2 text-center max-w-sm">{description}</p>
            {onContinue && (
                <Button onClick={onContinue} className="mt-6">
                    Continuar
                </Button>
            )}
        </motion.div>
    )
}

// 5. Interactive Rive Button
export function RiveInteractiveButton({
    label,
    onClick,
    animationSrc = '/animations/button.riv'
}: {
    label: string
    onClick: () => void
    animationSrc?: string
}) {
    const { rive, RiveComponent } = useRive({
        src: animationSrc,
        stateMachines: 'State Machine 1',
        autoplay: true,
    })

    const onHoverInput = useStateMachineInput(
        rive,
        'State Machine 1',
        'isHover'
    )

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => onHoverInput && (onHoverInput.value = true)}
            onMouseLeave={() => onHoverInput && (onHoverInput.value = false)}
            className="relative"
        >
            <div className="w-32 h-32">
                <RiveComponent />
            </div>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-white">
                {label}
            </span>
        </button>
    )
}

// 6. Construction/Building Animation (for your app theme!)
export function ConstructionAnimation({
    className = "w-full h-64"
}: {
    className?: string
}) {
    const { RiveComponent } = useRive({
        src: '/animations/construction.riv', // You need to add this file
        autoplay: true,
    })

    return (
        <div className={className}>
            <RiveComponent />
        </div>
    )
}

// 7. Error State
export function RiveError({
    title = "Algo salió mal",
    description = "Por favor, intenta nuevamente",
    onRetry
}: {
    title?: string
    description?: string
    onRetry?: () => void
}) {
    const { RiveComponent } = useRive({
        src: '/animations/error.riv', // You need to add this file
        autoplay: true,
    })

    return (
        <motion.div
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="w-32 h-32">
                <RiveComponent />
            </div>
            <h3 className="text-2xl font-black text-foreground mt-4">{title}</h3>
            <p className="text-apple-gray-400 mt-2 text-center max-w-sm">{description}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="mt-6">
                    Reintentar
                </Button>
            )}
        </motion.div>
    )
}

/**
 * HOW TO GET RIVE FILES:
 * 
 * 1. Visit https://rive.app/community
 * 2. Search for:
 *    - "construction" or "building" (for your app theme)
 *    - "loader" or "loading"
 *    - "empty state"
 *    - "success" or "checkmark"
 *    - "error" or "warning"
 * 
 * 3. Download the .riv file
 * 4. Place it in: public/animations/
 * 5. Use the component above!
 * 
 * RECOMMENDED FREE ANIMATIONS:
 * - Construction Worker: https://rive.app/community/4526-9231-construction-worker/
 * - Loading Spinner: https://rive.app/community/1043-2088-loading-spinner/
 * - Empty Box: https://rive.app/community/1234-5678-empty-box/
 * - Success Checkmark: https://rive.app/community/2345-6789-success/
 */

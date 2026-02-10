'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
    size?: number
}

export function Logo({ className, size = 48 }: LogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("drop-shadow-xl", className)}
        >
            <defs>
                {/* Gradients matching the image precisely */}
                <linearGradient id="tileTop" x1="256" y1="40" x2="256" y2="240" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4FC3F7" />
                    <stop offset="100%" stopColor="#29B6F6" />
                </linearGradient>

                <linearGradient id="tileMid" x1="256" y1="140" x2="256" y2="340" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#039BE5" />
                    <stop offset="100%" stopColor="#0277BD" />
                </linearGradient>

                <linearGradient id="tileBottom" x1="256" y1="240" x2="256" y2="440" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#01579B" />
                    <stop offset="100%" stopColor="#0D47A1" />
                </linearGradient>

                <filter id="tileShadow" x="-20%" y="-10%" width="140%" height="130%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
                    <feOffset dx="0" dy="8" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Helper function represented as paths for the 3 stacked tiles */}

            {/* Tile 3 (Bottom) */}
            <path
                d="M96 340 L 96 360 Q 96 375 120 388 L 240 452 Q 256 460 272 452 L 392 388 Q 416 375 416 360 L 416 340 L 416 340 Q 416 325 392 312 L 272 248 Q 256 240 240 248 L 120 312 Q 96 325 96 340 Z"
                fill="#0D47A1"
            />
            <path
                d="M96 340 Q 96 325 120 312 L 240 248 Q 256 240 272 248 L 392 312 Q 416 325 416 340 Q 416 355 392 368 L 272 432 Q 256 440 240 432 L 120 368 Q 96 355 96 340 Z"
                fill="url(#tileBottom)"
            />

            {/* Tile 2 (Middle) */}
            <path
                d="M96 240 L 96 260 Q 96 275 120 288 L 240 352 Q 256 360 272 352 L 392 288 Q 416 275 416 260 L 416 240 Q 416 225 392 212 L 272 148 Q 256 140 240 148 L 120 212 Q 96 225 96 240 Z"
                fill="#0277BD"
            />
            <path
                d="M96 240 Q 96 225 120 212 L 240 148 Q 256 140 272 148 L 392 212 Q 416 225 416 240 Q 416 255 392 268 L 272 332 Q 256 340 240 332 L 120 268 Q 96 255 96 240 Z"
                fill="url(#tileMid)"
            />

            {/* Tile 1 (Top) */}
            <path
                d="M96 140 L 96 160 Q 96 175 120 188 L 240 252 Q 256 260 272 252 L 392 188 Q 416 175 416 160 L 416 140 Q 416 125 392 112 L 272 48 Q 256 40 240 48 L 120 112 Q 96 125 96 140 Z"
                fill="#0288D1"
            />
            <path
                d="M96 140 Q 96 125 120 112 L 240 48 Q 256 40 272 48 L 392 112 Q 416 125 416 140 Q 416 155 392 168 L 272 232 Q 256 240 240 232 L 120 168 Q 96 155 96 140 Z"
                fill="url(#tileTop)"
            />

            {/* Correct Checkmark Shape */}
            <path
                d="M210 145 L 245 180 L 335 90"
                stroke="white"
                strokeWidth="32"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-md"
            />
        </svg>
    )
}

import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'

const landingButtonVariants = cva(
  "inline-flex items-center justify-center gap-3 font-bold transition-all select-none border border-transparent active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      intent: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
        outline: "bg-secondary dark:bg-white/5 text-secondary-foreground border hover:bg-secondary/80 dark:hover:bg-white/10 shadow-sm",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground",
        highlight: "bg-foreground text-background hover:bg-foreground/90 shadow-md",
      },
      size: {
        sm: "px-6 py-2 h-10 rounded-[14px] text-sm",
        md: "px-10 py-4 h-14 rounded-[20px] text-base",
        full: "w-full py-4 px-6 h-14 rounded-[20px] text-base md:w-auto", 
      }
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    }
  }
)

export interface LandingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof landingButtonVariants> {
  asChild?: boolean
  href?: string
}

export const LandingButton = React.forwardRef<HTMLButtonElement, LandingButtonProps>(
  ({ className, intent, size, asChild = false, href, ...props }, ref) => {
    if (href) {
      return (
        <Link href={href} className={cn(landingButtonVariants({ intent, size, className }))} {...(props as any)}>
          {props.children}
        </Link>
      )
    }

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(landingButtonVariants({ intent, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
LandingButton.displayName = "LandingButton"

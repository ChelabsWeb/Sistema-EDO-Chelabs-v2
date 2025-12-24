import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-[--color-apple-blue]/20 bg-[--color-apple-blue]/10 text-[--color-apple-blue] [a&]:hover:bg-[--color-apple-blue]/20",
        secondary:
          "border-[--color-apple-gray-200] bg-[--color-apple-gray-100] text-[--color-apple-gray-500] [a&]:hover:bg-[--color-apple-gray-200]",
        destructive:
          "border-[--color-apple-red]/20 bg-[--color-apple-red]/10 text-[--color-apple-red] [a&]:hover:bg-[--color-apple-red]/20",
        outline:
          "border-[--color-apple-gray-200] bg-transparent text-[--color-apple-gray-600] [a&]:hover:bg-[--color-apple-gray-50]",
        success:
          "border-[--color-apple-green]/20 bg-[--color-apple-green]/10 text-[--color-apple-green] [a&]:hover:bg-[--color-apple-green]/20",
        warning:
          "border-[--color-apple-orange]/20 bg-[--color-apple-orange]/10 text-[--color-apple-orange] [a&]:hover:bg-[--color-apple-orange]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

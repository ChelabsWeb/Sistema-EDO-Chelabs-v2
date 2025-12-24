import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[--color-apple-gray-400] selection:bg-[--color-apple-blue] selection:text-white",
        "h-10 w-full min-w-0 rounded-[12px] border border-[--color-apple-gray-200]/50 bg-[--color-apple-gray-50] px-4 py-2.5",
        "text-[--color-apple-gray-600] text-base transition-all duration-200 outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus:border-[--color-apple-blue] focus:ring-2 focus:ring-[--color-apple-blue]/20 focus:bg-white",
        "aria-invalid:ring-[--color-apple-red]/20 aria-invalid:border-[--color-apple-red]",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }

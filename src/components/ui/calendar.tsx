"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={es}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center h-10",
        caption_label: "text-base font-semibold text-[--color-apple-gray-600] capitalize",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 h-8 w-8 bg-transparent p-0 hover:bg-[--color-apple-gray-100] rounded-full border-none"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 h-8 w-8 bg-transparent p-0 hover:bg-[--color-apple-gray-100] rounded-full border-none"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-[--color-apple-gray-400] w-10 font-medium text-xs uppercase",
        week: "flex w-full mt-1",
        day: cn(
          "relative p-0 text-center focus-within:relative focus-within:z-20",
          "first:[&:has([aria-selected])]:rounded-l-full",
          "last:[&:has([aria-selected])]:rounded-r-full"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal rounded-full transition-all duration-200",
          "hover:bg-[--color-apple-blue]/10 hover:text-[--color-apple-blue]",
          "focus:bg-[--color-apple-blue]/10 focus:text-[--color-apple-blue]"
        ),
        range_start: "day-range-start rounded-l-full",
        range_end: "day-range-end rounded-r-full",
        selected: cn(
          "bg-gradient-to-br from-[--color-apple-blue] to-[--color-apple-blue-dark] text-white",
          "hover:bg-gradient-to-br hover:from-[--color-apple-blue] hover:to-[--color-apple-blue-dark] hover:text-white",
          "focus:bg-gradient-to-br focus:from-[--color-apple-blue] focus:to-[--color-apple-blue-dark] focus:text-white",
          "shadow-lg shadow-[--color-apple-blue]/30"
        ),
        today: "bg-[--color-apple-gray-100] text-[--color-apple-gray-600] font-semibold",
        outside: "text-[--color-apple-gray-300] opacity-50",
        disabled: "text-[--color-apple-gray-300] opacity-50 cursor-not-allowed",
        range_middle: "aria-selected:bg-[--color-apple-blue]/10 aria-selected:text-[--color-apple-blue]",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeftIcon : ChevronRightIcon
          return <Icon className="h-4 w-4 text-[--color-apple-gray-500]" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

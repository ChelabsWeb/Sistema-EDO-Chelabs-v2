"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import { setMonth, setYear, getMonth, getYear } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Custom dropdown component
function CustomDropdown({
  value,
  options,
  onChange,
  className,
}: {
  value: number
  options: { value: number; label: string }[]
  onChange: (value: number) => void
  className?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Scroll to selected item when opening
  React.useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedElement = listRef.current.querySelector('[data-selected="true"]')
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "center" })
      }
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-sm font-semibold text-[#1d1d1f] hover:bg-[#e8e8ed] rounded-lg transition-colors"
      >
        {selectedOption?.label}
        <ChevronDownIcon className={cn("h-3 w-3 text-[#86868b] transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-lg border border-[#e8e8ed] py-1 z-50 max-h-48 overflow-y-auto min-w-[100px]"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              data-selected={option.value === value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-3 py-1.5 text-sm text-left hover:bg-[#f5f5f7] transition-colors",
                option.value === value && "bg-[#0066cc] text-white hover:bg-[#004499]"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    props.defaultMonth || (props as any).selected || new Date()
  )

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 21 }, (_, i) => ({
      value: currentYear - 10 + i,
      label: String(currentYear - 10 + i)
    }))
  }, [])

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ].map((month, index) => ({ value: index, label: month }))

  const handleMonthSelect = (newMonth: number) => {
    setCurrentMonth(setMonth(currentMonth, newMonth))
  }

  const handleYearSelect = (newYear: number) => {
    setCurrentMonth(setYear(currentMonth, newYear))
  }

  const handlePrevMonth = () => {
    const prevMonth = new Date(currentMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setCurrentMonth(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setCurrentMonth(nextMonth)
  }

  return (
    <div className={cn("p-4", className)}>
      {/* Custom Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#e8e8ed] transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4 text-[#86868b]" />
        </button>

        <div className="flex items-center gap-1">
          <CustomDropdown
            value={getMonth(currentMonth)}
            options={months}
            onChange={handleMonthSelect}
          />
          <CustomDropdown
            value={getYear(currentMonth)}
            options={years}
            onChange={handleYearSelect}
          />
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#e8e8ed] transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4 text-[#86868b]" />
        </button>
      </div>

      {/* Calendar */}
      <DayPicker
        showOutsideDays={showOutsideDays}
        locale={es}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        hideNavigation
        className=""
        classNames={{
          months: "flex flex-col sm:flex-row gap-4",
          month: "flex flex-col gap-2",
          month_caption: "hidden",
          nav: "hidden",
          month_grid: "w-full border-collapse",
          weekdays: "flex",
          weekday: "text-[#86868b] w-10 font-medium text-xs uppercase text-center",
          week: "flex w-full mt-1",
          day: cn(
            "relative p-0 text-center focus-within:relative focus-within:z-20",
            "first:[&:has([aria-selected])]:rounded-l-full",
            "last:[&:has([aria-selected])]:rounded-r-full"
          ),
          day_button: cn(
            buttonVariants({ variant: "ghost" }),
            "h-10 w-10 p-0 font-normal rounded-full transition-all duration-200",
            "hover:bg-[#0066cc]/10 hover:text-[#0066cc]",
            "focus:bg-[#0066cc]/10 focus:text-[#0066cc]",
            "aria-selected:bg-[#0066cc] aria-selected:text-white aria-selected:hover:bg-[#004499] aria-selected:hover:text-white"
          ),
          range_start: "day-range-start rounded-l-full",
          range_end: "day-range-end rounded-r-full",
          selected: "rounded-full [&>button]:bg-[#0066cc] [&>button]:text-white [&>button]:hover:bg-[#004499]",
          today: "bg-[#e8e8ed] text-[#1d1d1f] font-semibold rounded-full",
          outside: "text-[#d2d2d7] opacity-50",
          disabled: "text-[#d2d2d7] opacity-50 cursor-not-allowed",
          range_middle: "aria-selected:bg-[#0066cc]/10 aria-selected:text-[#0066cc]",
          hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

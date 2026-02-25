"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  fromDate?: Date
  toDate?: Date
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Seleccionar fecha",
  className,
  disabled = false,
  fromDate,
  toDate,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            "bg-background border-input",
            "hover:bg-accent hover:text-accent-foreground",
            "rounded-md px-4",
            "transition-all duration-200",
            "focus:ring-2 focus:ring-ring focus:border-ring",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground" />
          {date ? (
            <span className="text-foreground">
              {format(date, "PPP", { locale: es })}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={(day) => {
            if (fromDate && day < fromDate) return true
            if (toDate && day > toDate) return true
            return false
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  from: Date | undefined
  to: Date | undefined
  onSelectFrom: (date: Date | undefined) => void
  onSelectTo: (date: Date | undefined) => void
  placeholderFrom?: string
  placeholderTo?: string
  className?: string
}

export function DateRangePicker({
  from,
  to,
  onSelectFrom,
  onSelectTo,
  placeholderFrom = "Fecha desde",
  placeholderTo = "Fecha hasta",
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <DatePicker
        date={from}
        onSelect={onSelectFrom}
        placeholder={placeholderFrom}
        toDate={to}
        className="flex-1"
      />
      <DatePicker
        date={to}
        onSelect={onSelectTo}
        placeholder={placeholderTo}
        fromDate={from}
        className="flex-1"
      />
    </div>
  )
}

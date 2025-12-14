"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRangePicker } from "./DateRangePicker"

export function PeriodSelector({
  currentPeriod,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomRangeChange,
}: {
  currentPeriod: string
  onPeriodChange?: (period: string) => void
  customStartDate?: Date
  customEndDate?: Date
  onCustomRangeChange?: (startDate: Date | undefined, endDate: Date | undefined) => void
}) {
  const [showCustomRange, setShowCustomRange] = useState(currentPeriod === 'custom-range')

  const handlePeriodChange = (period: string) => {
    if (period === 'custom-range') {
      setShowCustomRange(true)
    } else {
      setShowCustomRange(false)
      if (onPeriodChange) {
        onPeriodChange(period)
      }
    }
  }

  const handleCustomRangeChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (onCustomRangeChange) {
      onCustomRangeChange(startDate, endDate)
    }
    if (onPeriodChange && (startDate || endDate)) {
      onPeriodChange('custom-range')
    }
  }

  return (
    <div className="flex gap-2">
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-time">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="last-30-days">Last 30 Days</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="custom-range">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {showCustomRange && onCustomRangeChange && (
        <DateRangePicker
          startDate={customStartDate}
          endDate={customEndDate}
          onRangeChange={handleCustomRangeChange}
        />
      )}
    </div>
  )
}


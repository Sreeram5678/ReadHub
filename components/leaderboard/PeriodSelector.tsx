"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function PeriodSelector({
  currentPeriod,
  onPeriodChange,
}: {
  currentPeriod: string
  onPeriodChange?: (period: string) => void
}) {
  const handlePeriodChange = (period: string) => {
    if (onPeriodChange) {
      onPeriodChange(period)
    }
  }

  return (
    <Select value={currentPeriod} onValueChange={handlePeriodChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all-time">All Time</SelectItem>
        <SelectItem value="today">Today</SelectItem>
        <SelectItem value="week">This Week</SelectItem>
        <SelectItem value="month">This Month</SelectItem>
      </SelectContent>
    </Select>
  )
}


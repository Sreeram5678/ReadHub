"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, X } from "lucide-react"

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onRangeChange: (startDate: Date | undefined, endDate: Date | undefined) => void
}

export function DateRangePicker({ startDate, endDate, onRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState(startDate ? startDate.toISOString().split('T')[0] : '')
  const [tempEndDate, setTempEndDate] = useState(endDate ? endDate.toISOString().split('T')[0] : '')

  const handleApply = () => {
    const start = tempStartDate ? new Date(tempStartDate) : undefined
    const end = tempEndDate ? new Date(tempEndDate) : undefined

    // Validate that start date is before end date
    if (start && end && start > end) {
      alert('Start date must be before end date')
      return
    }

    onRangeChange(start, end)
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempStartDate('')
    setTempEndDate('')
    onRangeChange(undefined, undefined)
    setIsOpen(false)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select dates'
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start">
          <Calendar className="mr-2 h-4 w-4" />
          {startDate || endDate ? (
            <span className="truncate">
              {startDate ? formatDate(startDate) : '...'} - {endDate ? formatDate(endDate) : '...'}
            </span>
          ) : (
            'Custom Range'
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
          <DialogDescription>
            Choose a custom date range for the leaderboard
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              From
            </Label>
            <Input
              id="start-date"
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              To
            </Label>
            <Input
              id="end-date"
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
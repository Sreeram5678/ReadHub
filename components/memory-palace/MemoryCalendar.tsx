"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, addMonths, subMonths } from "date-fns"

interface BookMemory {
  id: string
  location: string | null
  latitude: number | null
  longitude: number | null
  memoryNote: string | null
  lifeEvent: string | null
  memoryDate: string | null
  photoUrl: string | null
  book: {
    id: string
    title: string
    author: string
  }
  createdAt: string
}

interface MemoryCalendarProps {
  memories: BookMemory[]
}

export function MemoryCalendar({ memories }: MemoryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const memoriesByDate = useMemo(() => {
    const grouped = memories.reduce((acc, memory) => {
      if (memory.memoryDate) {
        const dateKey = format(new Date(memory.memoryDate), "yyyy-MM-dd")
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(memory)
      }
      return acc
    }, {} as Record<string, BookMemory[]>)
    return grouped
  }, [memories])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add padding days for the start of the month
  const startDayOfWeek = getDay(monthStart)
  const paddedDays = Array.from({ length: startDayOfWeek }, (_, i) => null)

  const getActivityLevel = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    const count = memoriesByDate[dateKey]?.length || 0
    if (count === 0) return 0
    if (count <= 2) return 1
    if (count <= 4) return 2
    return 3
  }

  const getActivityColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-200"
      case 2: return "bg-green-400"
      case 3: return "bg-green-600"
      default: return "bg-gray-100"
    }
  }

  const selectedDateMemories = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    return memoriesByDate[dateKey] || []
  }, [selectedDate, memoriesByDate])

  const getLifeEventLabel = (event: string | null) => {
    const labels: Record<string, string> = {
      vacation: "Vacation",
      graduation: "Graduation",
      moving: "Moving",
      "new-job": "New Job",
      travel: "Travel",
      holiday: "Holiday",
      milestone: "Life Milestone",
      other: "Other",
    }
    return event ? labels[event] || event : null
  }

  const getLifeEventColor = (event: string | null) => {
    const colors: Record<string, string> = {
      vacation: "bg-blue-500",
      graduation: "bg-green-500",
      moving: "bg-orange-500",
      "new-job": "bg-purple-500",
      travel: "bg-cyan-500",
      holiday: "bg-red-500",
      milestone: "bg-yellow-500",
      other: "bg-gray-500",
    }
    return event ? colors[event] || "bg-gray-500" : "bg-gray-500"
  }

  if (memories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No memories yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Add some reading memories to see your reading calendar.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reading Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[140px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {paddedDays.map((_, index) => (
              <div key={`padding-${index}`} className="p-2" />
            ))}

            {calendarDays.map(day => {
              const activityLevel = getActivityLevel(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    p-2 text-sm relative hover:bg-accent rounded-md transition-colors
                    ${isSelected ? "ring-2 ring-primary" : ""}
                    ${!isSameMonth(day, currentDate) ? "text-muted-foreground" : ""}
                    ${isToday ? "font-bold" : ""}
                  `}
                >
                  <span className="relative z-10">{format(day, "d")}</span>
                  {activityLevel > 0 && (
                    <div
                      className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${getActivityColor(activityLevel)}`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Activity Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-100"></div>
              <div className="w-3 h-3 rounded-full bg-green-200"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
            </div>
            <span>More activity</span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && selectedDateMemories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Memories on {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateMemories.map((memory) => (
                <div key={memory.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{memory.book.title}</h4>
                      <p className="text-sm text-muted-foreground">by {memory.book.author}</p>
                    </div>
                    {memory.lifeEvent && (
                      <Badge variant="secondary" className={`${getLifeEventColor(memory.lifeEvent)} text-white border-0`}>
                        {getLifeEventLabel(memory.lifeEvent)}
                      </Badge>
                    )}
                  </div>

                  {memory.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{memory.location}</span>
                    </div>
                  )}

                  {memory.memoryNote && (
                    <p className="text-sm text-foreground/80 mt-2">{memory.memoryNote}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedDate && selectedDateMemories.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">
              No reading memories on {format(selectedDate, "MMMM d, yyyy")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

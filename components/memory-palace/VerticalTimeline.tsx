"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, BookOpen } from "lucide-react"
import { format, isSameDay, isSameMonth, isSameYear } from "date-fns"

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

interface VerticalTimelineProps {
  memories: BookMemory[]
}

export function VerticalTimeline({ memories }: VerticalTimelineProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Reset failed images when memories change to allow new images to load
  useEffect(() => {
    setFailedImages(new Set())
  }, [memories])

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

  const formatMemoryDate = (dateString: string | null) => {
    if (!dateString) return null

    const date = new Date(dateString)
    const now = new Date()

    if (isSameDay(date, now)) {
      return "Today"
    } else if (isSameMonth(date, now) && isSameYear(date, now)) {
      return format(date, "MMM d")
    } else if (isSameYear(date, now)) {
      return format(date, "MMM d")
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  const groupedMemories = memories.reduce((groups, memory) => {
    const date = memory.memoryDate
    if (!date) {
      if (!groups["No Date"]) groups["No Date"] = []
      groups["No Date"].push(memory)
      return groups
    }

    const dateObj = new Date(date)
    const key = format(dateObj, "yyyy-MM-dd")
    if (!groups[key]) groups[key] = []
    groups[key].push(memory)
    return groups
  }, {} as Record<string, BookMemory[]>)

  const sortedDateKeys = Object.keys(groupedMemories)
    .filter(key => key !== "No Date")
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (sortedDateKeys.includes("No Date")) {
    sortedDateKeys.push("No Date")
  }

  return (
    <div className="space-y-8">
      {sortedDateKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No memories yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Start adding memories to your books to build your Reading Timeline.
              Go to any book's details and add a memory in the "Memories" tab.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {sortedDateKeys.map((dateKey, dateIndex) => (
            <div key={dateKey} className="relative mb-8">
              {/* Date marker */}
              <div className="flex items-center mb-4">
                <div className="relative z-10 w-12 h-12 rounded-full bg-background border-4 border-background shadow-sm flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">
                    {dateKey === "No Date" ? "No Date" : format(new Date(dateKey), "MMMM d, yyyy")}
                  </h3>
                  {dateKey !== "No Date" && (
                    <p className="text-sm text-muted-foreground">
                      {groupedMemories[dateKey].length} memory{groupedMemories[dateKey].length !== 1 ? 'ies' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Memories for this date */}
              <div className="ml-16 space-y-4">
                {groupedMemories[dateKey].map((memory, memoryIndex) => (
                  <Card key={memory.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {memory.photoUrl && !failedImages.has(memory.id) && (
                          <div className="shrink-0 relative w-20 h-20 rounded-lg overflow-hidden ring-2 ring-background shadow-sm">
                            <Image
                              src={memory.photoUrl}
                              alt="Memory"
                              fill
                              className="object-cover"
                              sizes="80px"
                              onError={() => {
                                setFailedImages(prev => new Set(prev).add(memory.id))
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg leading-tight mb-1">
                                {memory.book.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                by {memory.book.author}
                              </p>
                            </div>
                            {memory.lifeEvent && (
                              <Badge variant="secondary" className={`${getLifeEventColor(memory.lifeEvent)} text-white border-0`}>
                                {getLifeEventLabel(memory.lifeEvent)}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {memory.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span>{memory.location}</span>
                              </div>
                            )}
                            {memory.memoryDate && dateKey !== "No Date" && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{formatMemoryDate(memory.memoryDate)}</span>
                              </div>
                            )}
                          </div>

                          {memory.memoryNote && (
                            <div className="pt-3 border-t border-border/50">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
                                {memory.memoryNote}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

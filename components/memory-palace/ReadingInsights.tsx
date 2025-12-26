"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, BookOpen, Calendar, TrendingUp, Star, Clock } from "lucide-react"
import { format, subMonths, isWithinInterval } from "date-fns"

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

interface ReadingInsightsProps {
  memories: BookMemory[]
}

export function ReadingInsights({ memories }: ReadingInsightsProps) {
  const insights = useMemo(() => {
    // Most read locations
    const locationCount = memories.reduce((acc, memory) => {
      if (memory.location) {
        acc[memory.location] = (acc[memory.location] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const topLocations = Object.entries(locationCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Books per location
    const booksByLocation = memories.reduce((acc, memory) => {
      if (memory.location) {
        if (!acc[memory.location]) acc[memory.location] = new Set()
        acc[memory.location].add(memory.book.id)
      }
      return acc
    }, {} as Record<string, Set<string>>)

    const booksPerLocation = Object.entries(booksByLocation)
      .map(([location, bookIds]) => ({ location, count: bookIds.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Reading activity over time
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i)
      return format(date, "yyyy-MM")
    })

    const monthlyActivity = months.map(month => {
      const monthStart = new Date(month + "-01")
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

      const count = memories.filter(memory => {
        if (!memory.memoryDate) return false
        const memoryDate = new Date(memory.memoryDate)
        return isWithinInterval(memoryDate, { start: monthStart, end: monthEnd })
      }).length

      return { month: format(monthStart, "MMM yyyy"), count }
    })

    // Life event distribution
    const lifeEventCount = memories.reduce((acc, memory) => {
      if (memory.lifeEvent) {
        acc[memory.lifeEvent] = (acc[memory.lifeEvent] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const topLifeEvents = Object.entries(lifeEventCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Average memories per book
    const uniqueBooks = new Set(memories.map(m => m.book.id)).size
    const avgMemoriesPerBook = uniqueBooks > 0 ? (memories.length / uniqueBooks).toFixed(1) : "0"

    // Memories with photos
    const memoriesWithPhotos = memories.filter(m => m.photoUrl).length
    const photoPercentage = memories.length > 0 ? ((memoriesWithPhotos / memories.length) * 100).toFixed(0) : "0"

    return {
      topLocations,
      booksPerLocation,
      monthlyActivity,
      topLifeEvents,
      avgMemoriesPerBook,
      photoPercentage,
      totalMemories: memories.length,
      uniqueLocations: Object.keys(locationCount).length,
      uniqueBooks
    }
  }, [memories])

  const getLifeEventLabel = (event: string) => {
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
    return labels[event] || event
  }

  if (memories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Add some reading memories to see your reading insights and patterns.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{insights.totalMemories}</p>
                <p className="text-xs text-muted-foreground">Total Memories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{insights.uniqueLocations}</p>
                <p className="text-xs text-muted-foreground">Unique Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{insights.avgMemoriesPerBook}</p>
                <p className="text-xs text-muted-foreground">Avg per Book</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{insights.photoPercentage}%</p>
                <p className="text-xs text-muted-foreground">With Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Read Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Most Read Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.topLocations.length > 0 ? (
              <div className="space-y-3">
                {insights.topLocations.map(([location, count], index) => (
                  <div key={location} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{location}</span>
                    </div>
                    <Badge variant="secondary">{count} memories</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No location data available</p>
            )}
          </CardContent>
        </Card>

        {/* Books Per Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Books Per Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.booksPerLocation.length > 0 ? (
              <div className="space-y-3">
                {insights.booksPerLocation.map(({ location, count }, index) => (
                  <div key={location} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{location}</span>
                    </div>
                    <Badge variant="outline">{count} book{count !== 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No location data available</p>
            )}
          </CardContent>
        </Card>

        {/* Reading Activity Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Reading Activity (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {insights.monthlyActivity.map(({ month, count }) => (
                <div key={month} className="text-center space-y-2">
                  <div className="h-16 bg-muted rounded-lg flex items-end justify-center p-2">
                    <div
                      className="bg-primary rounded w-full transition-all duration-300"
                      style={{
                        height: `${Math.max((count / Math.max(...insights.monthlyActivity.map(m => m.count))) * 100, 4)}%`,
                        minHeight: count > 0 ? '8px' : '0px'
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{count}</p>
                    <p className="text-xs text-muted-foreground">{month}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Life Event Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reading by Life Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.topLifeEvents.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {insights.topLifeEvents.map(([event, count]) => (
                  <Badge key={event} variant="outline" className="px-3 py-1">
                    {getLifeEventLabel(event)} ({count})
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No life event data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

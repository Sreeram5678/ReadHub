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

    // Reading streak analysis
    const readingStreak = useMemo(() => {
      if (memories.length === 0) return { current: 0, longest: 0 }

      const sortedMemories = [...memories]
        .filter(m => m.memoryDate)
        .sort((a, b) => new Date(b.memoryDate!).getTime() - new Date(a.memoryDate!).getTime())

      if (sortedMemories.length === 0) return { current: 0, longest: 0 }

      // Calculate current streak
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let currentStreak = 0
      let checkDate = new Date(today)

      // Check if user read today or yesterday (for current streak)
      const mostRecentDate = new Date(sortedMemories[0].memoryDate!)
      mostRecentDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff <= 1) {
        currentStreak = 1
        checkDate = new Date(mostRecentDate)

        // Count consecutive days backward
        for (let i = 1; i < sortedMemories.length; i++) {
          const memoryDate = new Date(sortedMemories[i].memoryDate!)
          memoryDate.setHours(0, 0, 0, 0)

          const expectedDate = new Date(checkDate)
          expectedDate.setDate(expectedDate.getDate() - 1)

          if (memoryDate.getTime() === expectedDate.getTime()) {
            currentStreak++
            checkDate = memoryDate
          } else {
            break
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0
      let tempStreak = 1

      for (let i = 1; i < sortedMemories.length; i++) {
        const currentDate = new Date(sortedMemories[i - 1].memoryDate!)
        const prevDate = new Date(sortedMemories[i].memoryDate!)

        const diffTime = currentDate.getTime() - prevDate.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)

        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)

      return { current: currentStreak, longest: longestStreak }
    }, [memories])

    // Reading patterns
    const readingPatterns = useMemo(() => {
      const patterns = {
        weekendReader: 0,
        weekdayReader: 0,
        morningReader: 0,
        afternoonReader: 0,
        eveningReader: 0,
        nightOwl: 0
      }

      memories.forEach(memory => {
        if (memory.memoryDate) {
          const date = new Date(memory.memoryDate)
          const dayOfWeek = date.getDay()

          // Weekend vs Weekday
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            patterns.weekendReader++
          } else {
            patterns.weekdayReader++
          }

          // This is a rough approximation since we don't have time data
          // We'll distribute evenly for demo purposes
          patterns.morningReader++
          patterns.afternoonReader++
          patterns.eveningReader++
        }
      })

      return patterns
    }, [memories])

    return {
      topLocations,
      booksPerLocation,
      monthlyActivity,
      topLifeEvents,
      avgMemoriesPerBook,
      photoPercentage,
      totalMemories: memories.length,
      uniqueLocations: Object.keys(locationCount).length,
      uniqueBooks,
      readingStreak,
      readingPatterns
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
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{insights.readingStreak.current}</p>
                <p className="text-xs text-muted-foreground">Reading Streak</p>
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
      </div>

      {/* Reading Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reading Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Weekends</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${insights.readingPatterns.weekendReader > 0
                        ? (insights.readingPatterns.weekendReader / (insights.readingPatterns.weekendReader + insights.readingPatterns.weekdayReader)) * 100
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8">{insights.readingPatterns.weekendReader}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Weekdays</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${insights.readingPatterns.weekdayReader > 0
                        ? (insights.readingPatterns.weekdayReader / (insights.readingPatterns.weekendReader + insights.readingPatterns.weekdayReader)) * 100
                        : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-8">{insights.readingPatterns.weekdayReader}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Reading Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {insights.readingStreak.current}
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-semibold text-muted-foreground mb-1">
                {insights.readingStreak.longest}
              </div>
              <div className="text-xs text-muted-foreground">Longest Streak</div>
            </div>

            {insights.readingStreak.current > 0 && (
              <div className="pt-2 border-t text-center">
                <div className="text-sm text-green-600">
                  🔥 Keep it up!
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <p className="text-2xl font-bold">{insights.photoPercentage}%</p>
                <p className="text-xs text-muted-foreground">Memories with Photos</p>
              </div>
              <div className="text-4xl">📸</div>
            </div>
            {insights.photoPercentage !== "0" && (
              <div className="mt-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${insights.photoPercentage}%` }}
                  />
                </div>
              </div>
            )}
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
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-700' :
                        index === 1 ? 'bg-gray-500/20 text-gray-700' :
                        index === 2 ? 'bg-orange-500/20 text-orange-700' :
                        'bg-primary/10 text-primary'
                      }`}>
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
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === 0 ? 'bg-green-500/20 text-green-700' :
                        'bg-blue-500/20 text-blue-700'
                      }`}>
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
              Reading Activity Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Activity Chart */}
            <div className="relative">
              <div className="flex justify-between items-end h-32 gap-2">
                {insights.monthlyActivity.map(({ month, count }, index) => {
                  const maxCount = Math.max(...insights.monthlyActivity.map(m => m.count))
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0
                  const isPeak = count === maxCount && maxCount > 0
                  const isRecent = index >= insights.monthlyActivity.length - 2

                  return (
                    <div key={month} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-24 mb-2">
                        {count > 0 && (
                          <div className="text-xs font-medium text-primary mb-1">
                            {count}
                          </div>
                        )}
                        <div
                          className={`w-full rounded-t transition-all duration-500 hover:scale-105 ${
                            isPeak
                              ? 'bg-gradient-to-t from-orange-400 to-orange-500'
                              : isRecent
                              ? 'bg-gradient-to-t from-blue-400 to-blue-500'
                              : 'bg-gradient-to-t from-primary/60 to-primary'
                          }`}
                          style={{
                            height: `${Math.max(height, 2)}%`,
                            minHeight: '4px'
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium">{month.split(' ')[0]}</div>
                        <div className="text-xs text-muted-foreground">{month.split(' ')[1]}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Trend line overlay */}
              <svg
                className="absolute inset-0 w-full h-24 pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.3)"
                  strokeWidth="2"
                  points={
                    insights.monthlyActivity.map((activity, index) => {
                      const x = (index / (insights.monthlyActivity.length - 1)) * 100
                      const maxCount = Math.max(...insights.monthlyActivity.map(m => m.count))
                      const y = maxCount > 0 ? (1 - activity.count / maxCount) * 80 + 10 : 90
                      return `${x},${y}`
                    }).join(' ')
                  }
                />
              </svg>
            </div>

            {/* Activity Insights */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {insights.monthlyActivity.reduce((max, curr) => curr.count > max ? curr.count : max, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Peak Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {(insights.monthlyActivity.reduce((sum, curr) => sum + curr.count, 0) / insights.monthlyActivity.length).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Avg per Month</div>
              </div>
            </div>

            {/* Trend Analysis */}
            {insights.monthlyActivity.length >= 3 && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Trend:</span>
                  {(() => {
                    const recent = insights.monthlyActivity.slice(-2)
                    const trend = recent[1].count - recent[0].count
                    if (trend > 0) {
                      return <span className="text-green-600 flex items-center gap-1">📈 +{trend} this month</span>
                    } else if (trend < 0) {
                      return <span className="text-red-600 flex items-center gap-1">📉 {trend} this month</span>
                    } else {
                      return <span className="text-gray-600 flex items-center gap-1">➡️ Steady</span>
                    }
                  })()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on last 2 months activity
                </div>
              </div>
            )}
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
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {insights.topLifeEvents.map(([event, count]) => (
                    <Badge
                      key={event}
                      variant="outline"
                      className="px-3 py-2 text-sm font-medium hover:bg-primary/5 transition-colors"
                    >
                      {getLifeEventLabel(event)} ({count})
                    </Badge>
                  ))}
                </div>

                {/* Event insights */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-primary">
                        {insights.topLifeEvents[0]?.[1] || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getLifeEventLabel(insights.topLifeEvents[0]?.[0] || 'vacation')} memories
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {insights.topLifeEvents.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Different life events
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {insights.totalMemories > 0
                          ? Math.round((insights.topLifeEvents.reduce((sum, [, count]) => sum + count, 0) / insights.totalMemories) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Memories with events
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm mb-2">No life event data available</p>
                <p className="text-xs text-muted-foreground">
                  Add life events to your memories to see reading patterns by life moments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

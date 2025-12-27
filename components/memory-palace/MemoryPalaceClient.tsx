"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { MapPin, Calendar, BookOpen, Map, List, Filter, Search, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSwipeable } from "react-swipeable"
import { MemoryMap } from "./MemoryMap"
import { VerticalTimeline } from "./VerticalTimeline"
import { ReadingInsights } from "./ReadingInsights"
import { MemoryCalendar } from "./MemoryCalendar"

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

interface SwipeableTabsProps {
  viewMode: "timeline" | "map" | "calendar" | "stats"
  onViewModeChange: (mode: "timeline" | "map" | "calendar" | "stats") => void
  children: React.ReactNode
}

function SwipeableTabs({ viewMode, onViewModeChange, children }: SwipeableTabsProps) {
  const tabs = ["timeline", "map", "calendar", "stats"] as const
  const currentIndex = tabs.indexOf(viewMode)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextIndex = Math.min(currentIndex + 1, tabs.length - 1)
      onViewModeChange(tabs[nextIndex])
    },
    onSwipedRight: () => {
      const prevIndex = Math.max(currentIndex - 1, 0)
      onViewModeChange(tabs[prevIndex])
    },
    preventScrollOnSwipe: true,
    trackMouse: true, // Enable mouse swipe for desktop testing
  })

  return (
    <div {...handlers} className="touch-pan-y">
      {children}
    </div>
  )
}

export function MemoryPalaceClient() {
  const [memories, setMemories] = useState<BookMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"timeline" | "map" | "calendar" | "stats">("timeline")
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [dateRange, setDateRange] = useState<string>("all")

  useEffect(() => {
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/book-memories")
      if (response.ok) {
        const data = await response.json()
        setMemories(data)
      }
    } catch (error) {
      console.error("Error fetching memories:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMemories = useMemo(() => {
    let filtered = memories

    // Apply life event filter
    if (filter !== "all") {
      filtered = filtered.filter((m) => m.lifeEvent === filter)
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((m) =>
        m.book.title.toLowerCase().includes(term) ||
        m.book.author.toLowerCase().includes(term) ||
        (m.location && m.location.toLowerCase().includes(term)) ||
        (m.memoryNote && m.memoryNote.toLowerCase().includes(term))
      )
    }

    // Apply date range filter
    if (dateRange !== "all") {
      const now = new Date()
      const startDate = new Date()

      switch (dateRange) {
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
        case "3months":
          startDate.setMonth(now.getMonth() - 3)
          break
        case "6months":
          startDate.setMonth(now.getMonth() - 6)
          break
        case "year":
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter((m) => {
        if (!m.memoryDate) return false
        const memoryDate = new Date(m.memoryDate)
        return memoryDate >= startDate && memoryDate <= now
      })
    }

    return filtered
  }, [memories, filter, searchTerm, dateRange])

  const sortedMemories = useMemo(() => {
    return [...filteredMemories].sort((a, b) => {
      const dateA = a.memoryDate ? new Date(a.memoryDate).getTime() : 0
      const dateB = b.memoryDate ? new Date(b.memoryDate).getTime() : 0
      return dateB - dateA
    })
  }, [filteredMemories])

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

  const memoriesWithLocation = useMemo(() => {
    return filteredMemories.filter(
      (m) => m.latitude !== null && m.longitude !== null
    )
  }, [filteredMemories])

  const uniqueLifeEvents = useMemo(() => {
    const events = new Set(
      memories.map((m) => m.lifeEvent).filter((e): e is string => e !== null)
    )
    return Array.from(events)
  }, [memories])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Reading Timeline</h1>
          <p className="text-muted-foreground">Loading your reading memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reading Timeline</h1>
          <p className="text-muted-foreground">
            Your reading journey through places, times, and life events
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by book title, author, location, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 w-full"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px] sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {uniqueLifeEvents.map((event) => (
                  <SelectItem key={event} value={event}>
                    {getLifeEventLabel(event)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[130px] sm:w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="3months">Past 3 Months</SelectItem>
                <SelectItem value="6months">Past 6 Months</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Swipe gesture handler */}
      <SwipeableTabs viewMode={viewMode} onViewModeChange={setViewMode}>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "timeline" | "map" | "calendar" | "stats")}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline" className="text-xs sm:text-sm">
              <List className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs sm:text-sm">
              <Map className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm">
              <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs sm:text-sm">
              <BookOpen className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <VerticalTimeline memories={sortedMemories} />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            {memoriesWithLocation.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Map className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No locations yet</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Add location information to your memories to see them on the map.
                    Use the "Use My Location" button when adding memories.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Reading Locations Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] sm:h-[600px] rounded-lg border bg-muted">
                    <MemoryMap memories={memoriesWithLocation} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <MemoryCalendar memories={filteredMemories} />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <ReadingInsights memories={filteredMemories} />
          </TabsContent>
        </Tabs>
      </SwipeableTabs>
    </div>
  )
}

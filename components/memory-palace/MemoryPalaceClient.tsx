"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, BookOpen, Map, List, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MemoryMap } from "./MemoryMap"

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

export function MemoryPalaceClient() {
  const [memories, setMemories] = useState<BookMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"timeline" | "map">("timeline")
  const [filter, setFilter] = useState<string>("all")

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
    if (filter === "all") return memories
    return memories.filter((m) => m.lifeEvent === filter)
  }, [memories, filter])

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
          <h1 className="text-3xl font-bold">Reading Memory Palace</h1>
          <p className="text-muted-foreground">Loading your reading memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reading Memory Palace</h1>
          <p className="text-muted-foreground">
            Your reading journey through places, times, and life events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Memories</SelectItem>
              {uniqueLifeEvents.map((event) => (
                <SelectItem key={event} value={event}>
                  {getLifeEventLabel(event)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "timeline" | "map")}>
        <TabsList>
          <TabsTrigger value="timeline">
            <List className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          {sortedMemories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No memories yet</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Start adding memories to your books to build your Reading Memory Palace.
                  Go to any book's details and add a memory in the "Memories" tab.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sortedMemories.map((memory) => (
                <Card key={memory.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {memory.photoUrl && (
                        <div className="shrink-0">
                          <img
                            src={memory.photoUrl}
                            alt="Memory"
                            className="w-24 h-24 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {memory.book.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              by {memory.book.author}
                            </p>
                          </div>
                          {memory.lifeEvent && (
                            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                              {getLifeEventLabel(memory.lifeEvent)}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {memory.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{memory.location}</span>
                            </div>
                          )}
                          {memory.memoryDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(memory.memoryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {memory.memoryNote && (
                          <p className="text-sm whitespace-pre-wrap pt-2 border-t">
                            {memory.memoryNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
                <div className="h-[600px] rounded-lg border bg-muted">
                  <MemoryMap memories={memoriesWithLocation} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"

interface HeatmapData {
  date: string
  pages: number
}

export function ReadingStreakHeatmap() {
  const [range, setRange] = useState("365")
  const [data, setData] = useState<HeatmapData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeatmapData()
  }, [range])

  const fetchHeatmapData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reading-heatmap?range=${range}`)
      if (response.ok) {
        const heatmapData = await response.json()
        setData(heatmapData)
      }
    } catch (error) {
      console.error("Failed to fetch heatmap data:", error)
    } finally {
      setLoading(false)
    }
  }

  const { gridData, maxPages } = useMemo(() => {
    const days = range === "all" ? 365 : parseInt(range)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dataMap = new Map<string, number>()
    data.forEach((item) => {
      dataMap.set(item.date, item.pages)
    })

    const grid: Array<{ date: Date; pages: number; dateString: string }> = []
    
    // For "all time", show last 365 days but include all data points
    const displayDays = range === "all" ? 365 : days
    
    for (let i = displayDays - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]
      grid.push({
        date,
        pages: dataMap.get(dateString) || 0,
        dateString,
      })
    }

    const max = Math.max(...grid.map((item) => item.pages), 1)

    return { gridData: grid, maxPages: max }
  }, [data, range])

  const getIntensity = (pages: number): string => {
    if (pages === 0) return "bg-muted"
    const intensity = Math.min(pages / maxPages, 1)
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-900"
    if (intensity < 0.5) return "bg-green-400 dark:bg-green-700"
    if (intensity < 0.75) return "bg-green-600 dark:bg-green-600"
    return "bg-green-700 dark:bg-green-500"
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reading Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading heatmap...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reading Heatmap
            </CardTitle>
            <CardDescription>Your reading activity over time</CardDescription>
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {gridData.map((item, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-sm ${getIntensity(item.pages)} transition-colors cursor-pointer hover:ring-2 hover:ring-primary`}
                title={`${formatDate(item.date)}: ${item.pages} pages`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-600" />
              <div className="w-3 h-3 rounded-sm bg-green-700 dark:bg-green-500" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


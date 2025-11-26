"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface ReadingPaceWidgetProps {
  readingTrends: Array<{ date: Date; pagesRead: number }>
}

export function ReadingPaceWidget({ readingTrends }: ReadingPaceWidgetProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const last7Days = new Date(today)
  last7Days.setDate(today.getDate() - 7)
  
  const last30Days = new Date(today)
  last30Days.setDate(today.getDate() - 30)

  const pagesLast7Days = readingTrends
    .filter((t) => {
      const date = new Date(t.date)
      return date >= last7Days && date <= today
    })
    .reduce((sum, t) => sum + t.pagesRead, 0)

  const pagesLast30Days = readingTrends
    .filter((t) => {
      const date = new Date(t.date)
      return date >= last30Days && date <= today
    })
    .reduce((sum, t) => sum + t.pagesRead, 0)

  const avgPagesPerDay7 = pagesLast7Days / 7
  const avgPagesPerDay30 = pagesLast30Days / 30

  const trend = avgPagesPerDay7 > avgPagesPerDay30 ? "up" : avgPagesPerDay7 < avgPagesPerDay30 ? "down" : "stable"

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
          Reading Pace
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">Average pages per day</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Last 7 days</span>
            <span className="text-xl md:text-2xl font-bold">{Math.round(avgPagesPerDay7)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {pagesLast7Days} pages total
          </p>
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Last 30 days</span>
            <span className="text-xl md:text-2xl font-bold">{Math.round(avgPagesPerDay30)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {pagesLast30Days} pages total
          </p>
        </div>
        {trend === "up" && (
          <p className="text-xs text-green-600 mt-2">
            Your pace is increasing!
          </p>
        )}
        {trend === "down" && (
          <p className="text-xs text-orange-600 mt-2">
            Your pace has slowed recently
          </p>
        )}
      </CardContent>
    </Card>
  )
}


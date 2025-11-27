"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface ThisWeekWidgetProps {
  weeklyPages: number
  daysReadThisWeek: number
}

export function ThisWeekWidget({ weeklyPages, daysReadThisWeek }: ThisWeekWidgetProps) {
  return (
    <Card className="relative overflow-hidden border-chart-4/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-4/10 to-transparent rounded-full -mr-16 -mt-16" />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-chart-4/20 to-chart-4/10">
            <Calendar className="h-4 w-4 text-chart-4" />
          </div>
          <CardTitle className="text-base md:text-lg">This Week</CardTitle>
        </div>
        <CardDescription className="text-xs md:text-sm">Pages read this week</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl md:text-4xl font-bold animate-counter">{weeklyPages}</div>
        <p className="text-sm text-muted-foreground mt-2">
          {daysReadThisWeek} days active
        </p>
      </CardContent>
    </Card>
  )
}


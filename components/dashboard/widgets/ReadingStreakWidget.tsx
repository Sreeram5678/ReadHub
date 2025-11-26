"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

interface ReadingStreakWidgetProps {
  readingStreak: number
}

export function ReadingStreakWidget({ readingStreak }: ReadingStreakWidgetProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">Reading Streak</CardTitle>
        <CardDescription className="text-xs md:text-sm">Consecutive days reading</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
          <div className="text-2xl md:text-3xl font-bold">{readingStreak}</div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">days</p>
      </CardContent>
    </Card>
  )
}


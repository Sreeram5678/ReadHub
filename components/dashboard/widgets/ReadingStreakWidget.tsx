"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

interface ReadingStreakWidgetProps {
  readingStreak: number
}

export function ReadingStreakWidget({ readingStreak }: ReadingStreakWidgetProps) {
  return (
    <Card className="relative overflow-hidden border-orange-500/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16" />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10">
            <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
          </div>
          <CardTitle className="text-base md:text-lg">Reading Streak</CardTitle>
        </div>
        <CardDescription className="text-xs md:text-sm">Consecutive days reading</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-center gap-3">
          <div className="text-3xl md:text-4xl font-bold animate-counter">{readingStreak}</div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">days</p>
      </CardContent>
    </Card>
  )
}


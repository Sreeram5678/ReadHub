"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WeeklyMonthlyWidgetProps {
  weeklyPages: number
  monthlyPages: number
  daysReadThisWeek: number
  daysReadThisMonth: number
}

export function WeeklyMonthlyWidget({
  weeklyPages,
  monthlyPages,
  daysReadThisWeek,
  daysReadThisMonth,
}: WeeklyMonthlyWidgetProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">This Week</CardTitle>
          <CardDescription className="text-xs md:text-sm">Pages read this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">{weeklyPages}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {daysReadThisWeek} days active
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">This Month</CardTitle>
          <CardDescription className="text-xs md:text-sm">Pages read this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">{monthlyPages}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {daysReadThisMonth} days active
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


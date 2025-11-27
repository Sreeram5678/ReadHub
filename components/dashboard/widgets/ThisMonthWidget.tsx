"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

interface ThisMonthWidgetProps {
  monthlyPages: number
  daysReadThisMonth: number
}

export function ThisMonthWidget({ monthlyPages, daysReadThisMonth }: ThisMonthWidgetProps) {
  return (
    <Card className="relative overflow-hidden border-chart-5/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-5/10 to-transparent rounded-full -mr-16 -mt-16" />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-chart-5/20 to-chart-5/10">
            <CalendarDays className="h-4 w-4 text-chart-5" />
          </div>
          <CardTitle className="text-base md:text-lg">This Month</CardTitle>
        </div>
        <CardDescription className="text-xs md:text-sm">Pages read this month</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl md:text-4xl font-bold animate-counter">{monthlyPages}</div>
        <p className="text-sm text-muted-foreground mt-2">
          {daysReadThisMonth} days active
        </p>
      </CardContent>
    </Card>
  )
}


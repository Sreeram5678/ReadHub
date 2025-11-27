"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle2, FileText, TrendingUp } from "lucide-react"

interface StatsWidgetProps {
  totalBooks: number
  completedBooks: number
  completionPercentage: number
  totalPagesRead: number
  todayPages: number
}

export function StatsWidget({
  totalBooks,
  completedBooks,
  completionPercentage,
  totalPagesRead,
  todayPages,
}: StatsWidgetProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden border-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base md:text-lg">Total Books</CardTitle>
          </div>
          <CardDescription className="text-xs md:text-sm">Books tracked</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl md:text-4xl font-bold animate-counter">{totalBooks}</div>
          {completedBooks > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {completedBooks} completed ({completionPercentage}%)
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden border-chart-1/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-1/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-1/10">
              <CheckCircle2 className="h-4 w-4 text-chart-1" />
            </div>
            <CardTitle className="text-base md:text-lg">Completion Rate</CardTitle>
          </div>
          <CardDescription className="text-xs md:text-sm">Books finished</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl md:text-4xl font-bold animate-counter">{completionPercentage}%</div>
          <p className="text-sm text-muted-foreground mt-2">
            {completedBooks} of {totalBooks} books
          </p>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden border-chart-2/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-2/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-chart-2/20 to-chart-2/10">
              <FileText className="h-4 w-4 text-chart-2" />
            </div>
            <CardTitle className="text-base md:text-lg">Total Pages</CardTitle>
          </div>
          <CardDescription className="text-xs md:text-sm">All-time pages read</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl md:text-4xl font-bold animate-counter">{totalPagesRead.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden border-chart-3/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-3/10 to-transparent rounded-full -mr-16 -mt-16" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-chart-3/20 to-chart-3/10">
              <TrendingUp className="h-4 w-4 text-chart-3" />
            </div>
            <CardTitle className="text-base md:text-lg">Today's Reading</CardTitle>
          </div>
          <CardDescription className="text-xs md:text-sm">Pages read today</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl md:text-4xl font-bold animate-counter">{todayPages}</div>
        </CardContent>
      </Card>
    </div>
  )
}


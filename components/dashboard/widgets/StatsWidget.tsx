"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Total Books</CardTitle>
          <CardDescription className="text-xs md:text-sm">Books tracked</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">{totalBooks}</div>
          {completedBooks > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {completedBooks} completed ({completionPercentage}%)
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Completion Rate</CardTitle>
          <CardDescription className="text-xs md:text-sm">Books finished</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">{completionPercentage}%</div>
          <p className="text-sm text-muted-foreground mt-1">
            {completedBooks} of {totalBooks} books
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Total Pages</CardTitle>
          <CardDescription className="text-xs md:text-sm">All-time pages read</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">{totalPagesRead.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Today's Reading</CardTitle>
          <CardDescription className="text-xs md:text-sm">Pages read today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">{todayPages}</div>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ReadingTrend {
  date: Date
  pagesRead: number
}

interface ReadingTrendsChartProps {
  trends: ReadingTrend[]
}

export function ReadingTrendsChart({ trends }: ReadingTrendsChartProps) {
  const chartData = trends.reduce((acc, log) => {
    const date = new Date(log.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    const existing = acc.find((item) => item.date === date)
    if (existing) {
      existing.pages += log.pagesRead
    } else {
      acc.push({ date, pages: log.pagesRead })
    }
    return acc
  }, [] as { date: string; pages: number }[])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reading Trends</CardTitle>
          <CardDescription>Your reading activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No reading data yet. Start logging your reading to see trends!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Trends</CardTitle>
        <CardDescription>Your reading activity over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Line
              type="monotone"
              dataKey="pages"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface ReadingTrend {
  date: Date
  pagesRead: number
}

interface ReadingTrendsChartProps {
  trends: ReadingTrend[]
}

export function ReadingTrendsChart({ trends }: ReadingTrendsChartProps) {
  // Memoize chart data processing to avoid recalculating on every render
  const chartData = useMemo(() => {
    return trends.reduce((acc, log) => {
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
  }, [trends])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reading Trends</CardTitle>
          <CardDescription>Your reading activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No reading data yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Start logging your reading to see trends and track your progress over time!
            </p>
          </div>
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
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.15} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="hsl(var(--muted-foreground))"
              opacity={0.6}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              stroke="hsl(var(--muted-foreground))"
              opacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--muted-foreground))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                padding: "8px 12px",
              }}
              labelStyle={{
                color: "hsl(var(--card-foreground))",
                fontWeight: 600,
                marginBottom: "4px",
              }}
              itemStyle={{
                color: "hsl(var(--card-foreground))",
              }}
            />
            <Area
              type="monotone"
              dataKey="pages"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2.5}
              fill="url(#colorPages)"
              dot={{ r: 4, fill: "hsl(var(--chart-1))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
              activeDot={{ r: 6, fill: "hsl(var(--chart-1))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


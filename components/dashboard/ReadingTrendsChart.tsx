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
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Reading Trends</CardTitle>
          <CardDescription>Your reading activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Reading Trends</CardTitle>
        <CardDescription>Your reading activity over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--card-border)" 
              opacity={0.4} 
            />
            <XAxis
              dataKey="date"
              tick={{ 
                fontSize: 12, 
                fill: "var(--text)",
                opacity: 0.7,
              }}
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="var(--card-border)"
              opacity={0.5}
            />
            <YAxis 
              tick={{ 
                fontSize: 12, 
                fill: "var(--text)",
                opacity: 0.7,
              }}
              stroke="var(--card-border)"
              opacity={0.5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--card-border)",
                borderRadius: "12px",
                boxShadow: "var(--card-shadow)",
                padding: "12px 16px",
              }}
              labelStyle={{
                color: "var(--text)",
                fontWeight: 600,
                marginBottom: "6px",
                fontSize: "13px",
              }}
              itemStyle={{
                color: "var(--text)",
                fontSize: "14px",
              }}
            />
            <Area
              type="monotone"
              dataKey="pages"
              stroke="var(--accent)"
              strokeWidth={3}
              fill="url(#colorPages)"
              dot={{ 
                r: 5, 
                fill: "var(--accent)", 
                strokeWidth: 3, 
                stroke: "var(--surface)" 
              }}
              activeDot={{ 
                r: 7, 
                fill: "var(--accent)", 
                strokeWidth: 3, 
                stroke: "var(--surface)" 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  userId?: string // Optional for viewing other users' trends
}

export function ReadingTrendsChart({ userId }: ReadingTrendsChartProps) {
  const [period, setPeriod] = useState("30")
  const [data, setData] = useState<ReadingTrend[]>([])
  const [loading, setLoading] = useState(true)

  // Performance optimization: Debounce period changes
  const [debouncedPeriod, setDebouncedPeriod] = useState("30")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPeriod(period), 300)
    return () => clearTimeout(timer)
  }, [period])

  const fetchTrendsData = useCallback(async () => {
    setLoading(true)
    try {
      const url = userId
        ? `/api/reading-trends?period=${debouncedPeriod}&userId=${userId}`
        : `/api/reading-trends?period=${debouncedPeriod}`
      const response = await fetch(url)
      if (response.ok) {
        const trendsData = await response.json()
        setData(trendsData)
      }
    } catch (error) {
      console.error("Failed to fetch reading trends data:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedPeriod, userId])

  useEffect(() => {
    fetchTrendsData()
  }, [fetchTrendsData])

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
  }

  const getPeriodDescription = (selectedPeriod: string) => {
    switch (selectedPeriod) {
      case "7": return "Your reading activity over the last 7 days"
      case "30": return "Your reading activity over the last 30 days"
      case "90": return "Your reading activity over the last 90 days"
      case "365": return "Your reading activity over the last year"
      default: return "Your reading activity over the last 30 days"
    }
  }

  // Memoize chart data processing to avoid recalculating on every render
  const processedData = useMemo(() => {
    return data.reduce((acc, log) => {
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
  }, [data])

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reading Trends</CardTitle>
              <CardDescription>{getPeriodDescription(period)}</CardDescription>
            </div>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading trends...</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Fetching your reading data for the selected period.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (processedData.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reading Trends</CardTitle>
              <CardDescription>{getPeriodDescription(period)}</CardDescription>
            </div>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--card-border)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        titleColor: 'var(--text)',
        bodyColor: 'var(--text)',
        titleFont: {
          size: 13,
          weight: 600,
        },
        bodyFont: {
          size: 14,
        },
        callbacks: {
          title: (context: any) => context[0].label,
          label: (context: any) => `Pages: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'var(--card-border)',
          opacity: 0.4,
        },
        ticks: {
          color: 'var(--text)',
          opacity: 0.7,
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'var(--card-border)',
          opacity: 0.4,
        },
        ticks: {
          color: 'var(--text)',
          opacity: 0.7,
          font: {
            size: 12,
          },
        },
      },
    },
    elements: {
      point: {
        radius: 5,
        backgroundColor: 'var(--accent)',
        borderColor: 'var(--surface)',
        borderWidth: 3,
        hoverRadius: 7,
      },
      line: {
        borderColor: 'var(--accent)',
        borderWidth: 3,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, 'var(--accent)');
          gradient.addColorStop(1, 'var(--accent)');
          return gradient;
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const chartData = {
    labels: processedData.map(item => item.date),
    datasets: [
      {
        data: processedData.map(item => item.pages),
        borderColor: 'var(--accent)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, 'var(--accent)');
          gradient.addColorStop(1, 'var(--accent)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reading Trends</CardTitle>
            <CardDescription>{getPeriodDescription(period)}</CardDescription>
          </div>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={processedData}>
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


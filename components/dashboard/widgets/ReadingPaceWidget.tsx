"use client"

import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"

interface ReadingPaceWidgetProps {
  readingTrends: Array<{ date: Date; pagesRead: number }>
}

export function ReadingPaceWidget({ readingTrends }: ReadingPaceWidgetProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const last7Days = new Date(today)
  last7Days.setDate(today.getDate() - 7)

  const last30Days = new Date(today)
  last30Days.setDate(today.getDate() - 30)

  const pagesLast7Days = readingTrends
    .filter((t) => {
      const date = new Date(t.date)
      return date >= last7Days && date <= today
    })
    .reduce((sum, t) => sum + t.pagesRead, 0)

  const pagesLast30Days = readingTrends
    .filter((t) => {
      const date = new Date(t.date)
      return date >= last30Days && date <= today
    })
    .reduce((sum, t) => sum + t.pagesRead, 0)

  const avgPagesPerDay7 = pagesLast7Days / 7
  const avgPagesPerDay30 = pagesLast30Days / 30 || 0
  const trend = avgPagesPerDay7 > avgPagesPerDay30 ? "up" : avgPagesPerDay7 < avgPagesPerDay30 ? "down" : "stable"

  const trendCopy =
    trend === "up"
      ? "Your pace is accelerating."
      : trend === "down"
      ? "Softer pace this week. Consider a micro-session."
      : "Steady flow—right where it should be."

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-surface rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Reading Pace</p>
          <p className="serif-heading text-3xl">{Math.round(avgPagesPerDay7)} pages / day</p>
          <p className="text-sm text-muted">vs {Math.round(avgPagesPerDay30)} avg last 30 days</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl border border-card-border/60">
          <TrendingUp className="h-5 w-5 text-[color:var(--accent)]" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Last 7 days</p>
          <p className="text-2xl font-semibold">{pagesLast7Days} pages</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Last 30 days</p>
          <p className="text-2xl font-semibold">{pagesLast30Days} pages</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">{trendCopy}</p>
    </motion.div>
  )
}


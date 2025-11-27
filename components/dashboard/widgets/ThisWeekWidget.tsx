"use client"

import { motion } from "framer-motion"
import { Calendar } from "lucide-react"

interface ThisWeekWidgetProps {
  weeklyPages: number
  daysReadThisWeek: number
}

export function ThisWeekWidget({ weeklyPages, daysReadThisWeek }: ThisWeekWidgetProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-surface rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">This Week</p>
          <p className="serif-heading text-3xl">{weeklyPages} pages</p>
          <p className="text-sm text-muted">{daysReadThisWeek} active days</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl border border-card-border/60">
          <Calendar className="h-5 w-5 text-[color:var(--accent)]" />
        </div>
      </div>
    </motion.div>
  )
}


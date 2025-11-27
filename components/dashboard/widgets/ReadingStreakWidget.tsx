"use client"

import { motion } from "framer-motion"
import { Flame } from "lucide-react"

interface ReadingStreakWidgetProps {
  readingStreak: number
}

export function ReadingStreakWidget({ readingStreak }: ReadingStreakWidgetProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-surface rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Reading Streak</p>
          <p className="serif-heading text-3xl text-[color:var(--text)]">{readingStreak} days</p>
          <p className="text-sm text-muted">Consecutive days reading</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl border border-card-border/70">
          <Flame className="h-5 w-5 text-[color:var(--accent)]" />
        </div>
      </div>
    </motion.div>
  )
}


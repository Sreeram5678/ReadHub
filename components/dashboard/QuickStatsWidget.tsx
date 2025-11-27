"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check } from "lucide-react"

interface QuickStatsData {
  text: string
  totalBooks: number
  totalPagesRead: number
  readingStreak: number
}

export function QuickStatsWidget() {
  const [stats, setStats] = useState<QuickStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/quick-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!stats) return

    try {
      await navigator.clipboard.writeText(stats.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  if (loading) {
    return (
      <motion.div className="card-surface min-h-[220px] rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)]">
        <p className="text-sm text-muted">Loading stats...</p>
      </motion.div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-surface min-h-[240px] rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)]"
    >
      <div className="mb-4 flex items-center gap-3">
        <Share2 className="h-5 w-5 text-[color:var(--accent)]" />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Quick Stats</p>
          <p className="serif-heading text-2xl text-[color:var(--text)]">Shareable snapshot</p>
        </div>
      </div>
      <div className="rounded-[1.25rem] border border-card-border/60 bg-[color:var(--surface)]/70 p-4 text-center shadow-inner">
        <p className="text-sm text-muted">Copy & share</p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--text)]">{stats.text}</p>
      </div>
      <Button onClick={handleCopy} variant="outline" className="mt-4 w-full" disabled={copied}>
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy Stats
          </>
        )}
      </Button>
    </motion.div>
  )
}


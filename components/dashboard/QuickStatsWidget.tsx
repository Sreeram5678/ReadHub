"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[220px] flex items-center">
          <p className="text-muted-foreground">Loading stats...</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Quick Stats
        </CardTitle>
        <CardDescription>Share your reading progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[220px] flex flex-col justify-between">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-lg font-medium text-center">{stats.text}</p>
        </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="w-full"
          disabled={copied}
        >
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
      </CardContent>
    </Card>
  )
}


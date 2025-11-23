"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LeaderboardTable } from "./LeaderboardTable"
import { PeriodSelector } from "./PeriodSelector"
import { useState, useEffect } from "react"

interface LeaderboardEntry {
  id: string
  name: string
  email: string
  image?: string | null
  totalPages: number
  bookCount: number
  rank: number
}

export function LeaderboardPageClient({
  initialLeaderboard,
  currentUserId,
  initialPeriod,
}: {
  initialLeaderboard: LeaderboardEntry[]
  currentUserId: string
  initialPeriod: string
}) {
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard)
  const [period, setPeriod] = useState(initialPeriod)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/leaderboard?period=${period}`)
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [period])

  const currentUserRank =
    leaderboard.findIndex((user) => user.id === currentUserId) + 1

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank against other readers
          </p>
        </div>
        <PeriodSelector
          currentPeriod={period}
          onPeriodChange={setPeriod}
        />
      </div>

      {currentUserRank > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Rank</CardTitle>
            <CardDescription>Your position on the leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">#{currentUserRank}</div>
            <p className="text-muted-foreground mt-2">
              {leaderboard[currentUserRank - 1]?.totalPages || 0} pages read
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top Readers</CardTitle>
          <CardDescription>
            Rankings based on {period === "all-time" ? "all-time" : period}{" "}
            pages read
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading...
            </p>
          ) : (
            <LeaderboardTable
              leaderboard={leaderboard}
              currentUserId={currentUserId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}


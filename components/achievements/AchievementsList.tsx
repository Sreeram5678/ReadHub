"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Award } from "lucide-react"
import { getMilestoneLabel } from "@/lib/achievements"

interface Achievement {
  id: string
  type: string
  milestone: number
  achievedAt: Date
  book?: {
    title: string
    author: string
  } | null
}

export function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/achievements")
      if (response.ok) {
        const data = await response.json()
        setAchievements(data)
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const streakAchievements = achievements.filter((a) => a.type === "streak")

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading achievements...</p>
        </CardContent>
      </Card>
    )
  }

  if (streakAchievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Your reading milestones</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[220px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            No achievements yet. Keep reading to unlock milestones!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
        <CardDescription>Your reading milestones</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[220px] flex flex-col">
        <div className="space-y-3 flex-1">
          {streakAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <div className="p-2 bg-primary/10 rounded-full">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {achievement.milestone}-Day Streak
                </p>
                <p className="text-sm text-muted-foreground">
                  {getMilestoneLabel(achievement.milestone)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Achieved {new Date(achievement.achievedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


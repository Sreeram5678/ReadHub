"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Target } from "lucide-react"

interface ReadingGoal {
  id: string
  type: string
  target: number
  period: string
  startDate: Date
  endDate: Date
}

interface ReadingGoalsProps {
  goals: ReadingGoal[]
  currentProgress: {
    daily?: number
    weekly?: number
    monthly?: number
  }
  onGoalAdded: () => void
}

export function ReadingGoals({ goals, currentProgress, onGoalAdded }: ReadingGoalsProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "pages",
    period: "daily",
    target: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const now = new Date()
      let startDate = new Date(now)
      let endDate = new Date(now)

      if (formData.period === "daily") {
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
      } else if (formData.period === "weekly") {
        const dayOfWeek = now.getDay()
        startDate.setDate(now.getDate() - dayOfWeek)
        startDate.setHours(0, 0, 0, 0)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
      } else if (formData.period === "monthly") {
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
        endDate.setHours(23, 59, 59, 999)
      }

      const response = await fetch("/api/reading-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          target: parseInt(formData.target),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create goal")
      }

      setFormData({ type: "pages", period: "daily", target: "" })
      setOpen(false)
      onGoalAdded()
    } catch (error) {
      console.error("Error creating goal:", error)
      alert("Failed to create goal. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getProgress = (goal: ReadingGoal) => {
    if (goal.period === "daily") {
      return currentProgress.daily || 0
    } else if (goal.period === "weekly") {
      return currentProgress.weekly || 0
    } else if (goal.period === "monthly") {
      return currentProgress.monthly || 0
    }
    return 0
  }

  const getProgressPercentage = (goal: ReadingGoal) => {
    const progress = getProgress(goal)
    return Math.min((progress / goal.target) * 100, 100)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reading Goals</CardTitle>
            <CardDescription>Track your reading targets</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Target className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Reading Goal</DialogTitle>
                <DialogDescription>
                  Set a target for your reading progress
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) =>
                      setFormData({ ...formData, period: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Pages</Label>
                  <Input
                    id="target"
                    type="number"
                    value={formData.target}
                    onChange={(e) =>
                      setFormData({ ...formData, target: e.target.value })
                    }
                    required
                    min="1"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating..." : "Create Goal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No active goals. Create one to track your progress!
          </p>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = getProgress(goal)
              const percentage = getProgressPercentage(goal)
              const periodLabel =
                goal.period === "daily"
                  ? "Today"
                  : goal.period === "weekly"
                  ? "This Week"
                  : "This Month"

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">
                      {periodLabel} Goal
                    </span>
                    <span className="text-muted-foreground">
                      {progress} / {goal.target} pages
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(percentage)}% complete
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


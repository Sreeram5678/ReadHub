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
import { Target, Edit, Trash2 } from "lucide-react"

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
  const [editOpen, setEditOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "pages",
    period: "daily",
    target: "",
  })
  const [editFormData, setEditFormData] = useState<{
    id: string
    type: string
    period: string
    target: string
  } | null>(null)

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

  const handleEdit = (goal: ReadingGoal) => {
    setEditFormData({
      id: goal.id,
      type: goal.type,
      period: goal.period,
      target: goal.target.toString(),
    })
    setEditOpen(goal.id)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFormData) return

    setLoading(true)

    try {
      const now = new Date()
      let startDate = new Date(now)
      let endDate = new Date(now)

      if (editFormData.period === "daily") {
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
      } else if (editFormData.period === "weekly") {
        const dayOfWeek = now.getDay()
        startDate.setDate(now.getDate() - dayOfWeek)
        startDate.setHours(0, 0, 0, 0)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
      } else if (editFormData.period === "monthly") {
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
        endDate.setHours(23, 59, 59, 999)
      }

      const response = await fetch(`/api/reading-goals/${editFormData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editFormData.type,
          period: editFormData.period,
          target: parseInt(editFormData.target),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update goal")
      }

      setEditOpen(null)
      setEditFormData(null)
      onGoalAdded()
    } catch (error) {
      console.error("Error updating goal:", error)
      alert("Failed to update goal. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return
    }

    try {
      const response = await fetch(`/api/reading-goals/${goalId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete goal")
      }

      onGoalAdded()
    } catch (error) {
      console.error("Error deleting goal:", error)
      alert("Failed to delete goal. Please try again.")
    }
  }

  return (
    <Card className="h-full flex flex-col">
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
      <CardContent className="flex-1">
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
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">
                          {periodLabel} Goal
                        </span>
                        <span className="text-muted-foreground">
                          {progress} / {goal.target} pages
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEdit(goal)}
                        title="Edit goal"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(goal.id)}
                        title="Delete goal"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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

      {editFormData && (
        <Dialog open={editOpen === editFormData.id} onOpenChange={(open) => {
          if (!open) {
            setEditOpen(null)
            setEditFormData(null)
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Reading Goal</DialogTitle>
              <DialogDescription>
                Update your reading goal target
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-period">Period</Label>
                <Select
                  value={editFormData.period}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, period: value })
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
                <Label htmlFor="edit-target">Target Pages</Label>
                <Input
                  id="edit-target"
                  type="number"
                  value={editFormData.target}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, target: e.target.value })
                  }
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditOpen(null)
                    setEditFormData(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Updating..." : "Update Goal"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}


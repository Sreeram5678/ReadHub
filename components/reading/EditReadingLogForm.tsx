"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReadingLog {
  id: string
  pagesRead: number
  date: Date
  book: {
    title: string
  }
}

interface EditReadingLogFormProps {
  log: ReadingLog
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogUpdated: () => void
}

export function EditReadingLogForm({
  log,
  open,
  onOpenChange,
  onLogUpdated,
}: EditReadingLogFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    pagesRead: log.pagesRead.toString(),
    date: new Date(log.date).toISOString().split("T")[0],
  })

  useEffect(() => {
    if (open) {
      setFormData({
        pagesRead: log.pagesRead.toString(),
        date: new Date(log.date).toISOString().split("T")[0],
      })
    }
  }, [log, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/reading-logs/${log.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update reading log")
      }

      onOpenChange(false)
      onLogUpdated()
    } catch (error) {
      console.error("Error updating reading log:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update reading log. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reading log?")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/reading-logs/${log.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete reading log")
      }

      onOpenChange(false)
      onLogUpdated()
    } catch (error) {
      console.error("Error deleting reading log:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete reading log. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>Edit Reading Log</DialogTitle>
          <DialogDescription>
            Update your reading log for {log.book.title}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pagesRead">Pages Read</Label>
            <Input
              id="pagesRead"
              type="number"
              value={formData.pagesRead}
              onChange={(e) =>
                setFormData({ ...formData, pagesRead: e.target.value })
              }
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Log"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


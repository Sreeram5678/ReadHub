"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BookRead {
  id: string
  readNumber: number
  startedAt: string
  completedAt: string | null
  rating: number | null
  notes: string | null
}

interface ReReadTrackingProps {
  bookId: string
  bookTitle: string
}

export function ReReadTracking({ bookId, bookTitle }: ReReadTrackingProps) {
  const [reads, setReads] = useState<BookRead[]>([])
  const [open, setOpen] = useState(false)
  const [editingRead, setEditingRead] = useState<BookRead | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    startedAt: new Date().toISOString().split('T')[0],
    completedAt: "",
    rating: "",
    notes: "",
  })

  useEffect(() => {
    fetchReads()
  }, [bookId])

  const fetchReads = async () => {
    try {
      const response = await fetch(`/api/book-reads?bookId=${bookId}`)
      if (response.ok) {
        const data = await response.json()
        setReads(data)
      }
    } catch (error) {
      console.error("Error fetching book reads:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/book-reads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          startedAt: formData.startedAt,
          completedAt: formData.completedAt || null,
          rating: formData.rating || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save re-read")
      }

      setOpen(false)
      setEditingRead(null)
      setFormData({
        startedAt: new Date().toISOString().split('T')[0],
        completedAt: "",
        rating: "",
        notes: "",
      })
      fetchReads()
    } catch (error) {
      console.error("Error saving re-read:", error)
      alert("Failed to save re-read. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this re-read record?")) {
      return
    }

    try {
      const response = await fetch(`/api/book-reads/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete re-read")
      }

      fetchReads()
    } catch (error) {
      console.error("Error deleting re-read:", error)
      alert("Failed to delete re-read. Please try again.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Re-read Tracking</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingRead(null)
              setFormData({
                startedAt: new Date().toISOString().split('T')[0],
                completedAt: "",
                rating: "",
                notes: "",
              })
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Mark Re-read
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No re-reads tracked yet. Mark this book as re-read to track multiple readings.
          </p>
        ) : (
          <div className="space-y-4">
            {reads.map((read) => (
              <div key={read.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {read.readNumber === 1 ? "1st Read" : read.readNumber === 2 ? "2nd Read" : `${read.readNumber}th Read`}
                      </span>
                      {read.rating && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= read.rating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        Started: {new Date(read.startedAt).toLocaleDateString()}
                      </div>
                      {read.completedAt && (
                        <div>
                          Completed: {new Date(read.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {read.notes && (
                      <p className="text-sm mt-2 whitespace-pre-wrap">{read.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(read.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Re-read</DialogTitle>
            <DialogDescription>
              Track a re-read of "{bookTitle}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startedAt">Started Date</Label>
              <Input
                id="startedAt"
                type="date"
                value={formData.startedAt}
                onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completedAt">Completed Date (Optional)</Label>
              <Input
                id="completedAt"
                type="date"
                value={formData.completedAt}
                onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (Optional)</Label>
              <Select
                value={formData.rating || "none"}
                onValueChange={(value) => setFormData({ ...formData, rating: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No rating</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes about this re-read..."
                rows={3}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Mark Re-read"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


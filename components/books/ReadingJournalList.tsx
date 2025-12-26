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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface JournalEntry {
  id: string
  entry: string
  mood: string | null
  date: string
  createdAt: string
}

interface ReadingJournalListProps {
  bookId: string
}

export function ReadingJournalList({ bookId }: ReadingJournalListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [open, setOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    entry: "",
    mood: "",
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchEntries()
  }, [bookId])

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/reading-journal?bookId=${bookId}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingEntry
        ? `/api/reading-journal/${editingEntry.id}`
        : "/api/reading-journal"
      const method = editingEntry ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save journal entry")
      }

      setOpen(false)
      setEditingEntry(null)
      setFormData({ entry: "", mood: "", date: new Date().toISOString().split('T')[0] })
      fetchEntries()
    } catch (error) {
      console.error("Error saving journal entry:", error)
      alert("Failed to save journal entry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) {
      return
    }

    try {
      const response = await fetch(`/api/reading-journal/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete journal entry")
      }

      fetchEntries()
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      alert("Failed to delete journal entry. Please try again.")
    }
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setFormData({
      entry: entry.entry,
      mood: entry.mood || "",
      date: new Date(entry.date).toISOString().split('T')[0],
    })
    setOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reading Journal</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingEntry(null)
              setFormData({ entry: "", mood: "", date: new Date().toISOString().split('T')[0] })
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No journal entries yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    {entry.mood && (
                      <span className="text-xs text-muted-foreground">Mood: {entry.mood}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{entry.entry}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Journal Entry" : "Add Journal Entry"}
            </DialogTitle>
            <DialogDescription>
              Record your thoughts and feelings about this book
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">Mood (Optional)</Label>
              <Select
                value={formData.mood}
                onValueChange={(value) => setFormData({ ...formData, mood: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="curious">Curious</SelectItem>
                  <SelectItem value="bored">Bored</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="inspired">Inspired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry">Entry</Label>
              <Textarea
                id="entry"
                value={formData.entry}
                onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                placeholder="Write your thoughts about this book..."
                rows={5}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : editingEntry ? "Update Entry" : "Add Entry"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


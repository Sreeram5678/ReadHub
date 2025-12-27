"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Calendar, Heart, Smile, Meh, Frown } from "lucide-react"
import { format, isSameMonth, isSameYear, isToday, isYesterday } from "date-fns"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

interface JournalEntry {
  id: string
  entry: string
  mood: string | null
  date: string
  createdAt: string
  book: {
    id: string
    title: string
    author: string
  } | null
}

interface JournalClientProps {
  initialEntries: JournalEntry[]
}

export function JournalClient({ initialEntries }: JournalClientProps) {
  const [entries] = useState<JournalEntry[]>(initialEntries)
  const [open, setOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    entry: "",
    mood: "",
    date: new Date().toISOString().split('T')[0],
    bookId: "",
  })

  const handleAdd = () => {
    setEditingEntry(null)
    setFormData({
      entry: "",
      mood: "",
      date: new Date().toISOString().split('T')[0],
      bookId: "",
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!formData.entry.trim()) return

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
          bookId: formData.bookId || null,
          entry: formData.entry,
          mood: formData.mood || null,
          date: formData.date,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save journal entry")
      }

      // Refresh the page to get updated entries
      window.location.reload()
    } catch (error) {
      console.error("Error saving journal entry:", error)
      alert("Failed to save journal entry. Please try again.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const getMoodIcon = (mood: string | null) => {
    switch (mood) {
      case "happy":
        return <Smile className="h-4 w-4 text-green-500" />
      case "content":
        return <Heart className="h-4 w-4 text-blue-500" />
      case "neutral":
        return <Meh className="h-4 w-4 text-yellow-500" />
      case "sad":
        return <Frown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getMoodLabel = (mood: string | null) => {
    const labels: Record<string, string> = {
      happy: "Happy",
      content: "Content",
      neutral: "Neutral",
      sad: "Sad",
    }
    return mood ? labels[mood] || mood : null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"

    const now = new Date()
    if (isSameYear(date, now)) {
      if (isSameMonth(date, now)) {
        return format(date, "EEEE, MMM d") // e.g., "Monday, Jan 15"
      }
      return format(date, "MMM d") // e.g., "Jan 15"
    }
    return format(date, "MMM d, yyyy") // e.g., "Jan 15, 2024"
  }

  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.date)
    const dateKey = format(date, "yyyy-MM-dd")
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(entry)
    return groups
  }, {} as Record<string, JournalEntry[]>)

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reading Journal</h1>
          <p className="text-muted-foreground">
            Your personal reflections and thoughts from your reading journey
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No journal entries yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start capturing your thoughts and reflections as you read. Your future self will thank you!
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Write Your First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([dateKey, dateEntries]) => (
              <div key={dateKey} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">
                    {formatDate(dateKey)}
                  </h2>
                </div>

                <div className="space-y-4">
                  {dateEntries.map((entry) => (
                    <Card key={entry.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {entry.book && (
                              <Link
                                href={`/books/${entry.book.id}`}
                                className="flex items-center gap-2 hover:text-primary transition-colors"
                              >
                                <BookOpen className="h-4 w-4" />
                                <span className="font-medium">{entry.book.title}</span>
                                <span className="text-muted-foreground text-sm">
                                  by {entry.book.author}
                                </span>
                              </Link>
                            )}
                            {entry.mood && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                {getMoodIcon(entry.mood)}
                                {getMoodLabel(entry.mood)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {entry.entry}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
            </DialogTitle>
            <DialogDescription>
              Capture your thoughts and reflections from your reading experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="entry">Journal Entry</Label>
              <Textarea
                id="entry"
                placeholder="What did you think? How did this reading make you feel? What insights did you gain?"
                value={formData.entry}
                onChange={(e) => setFormData(prev => ({ ...prev, entry: e.target.value }))}
                rows={6}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mood">Mood (Optional)</Label>
                <Select
                  value={formData.mood}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="How did you feel?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy 😊</SelectItem>
                    <SelectItem value="content">Content 😌</SelectItem>
                    <SelectItem value="neutral">Neutral 😐</SelectItem>
                    <SelectItem value="sad">Sad 😢</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !formData.entry.trim()}>
              {loading ? "Saving..." : editingEntry ? "Update Entry" : "Save Entry"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

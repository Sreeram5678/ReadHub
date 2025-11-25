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

interface ChapterNote {
  id: string
  chapterNumber: number | null
  chapterTitle: string | null
  note: string
  pageNumber: number | null
  createdAt: string
}

interface ChapterNotesListProps {
  bookId: string
}

export function ChapterNotesList({ bookId }: ChapterNotesListProps) {
  const [notes, setNotes] = useState<ChapterNote[]>([])
  const [open, setOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<ChapterNote | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    chapterNumber: "",
    chapterTitle: "",
    note: "",
    pageNumber: "",
  })

  useEffect(() => {
    fetchNotes()
  }, [bookId])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/chapter-notes?bookId=${bookId}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingNote
        ? `/api/chapter-notes/${editingNote.id}`
        : "/api/chapter-notes"
      const method = editingNote ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save note")
      }

      setOpen(false)
      setEditingNote(null)
      setFormData({ chapterNumber: "", chapterTitle: "", note: "", pageNumber: "" })
      fetchNotes()
    } catch (error) {
      console.error("Error saving note:", error)
      alert("Failed to save note. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return
    }

    try {
      const response = await fetch(`/api/chapter-notes/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete note")
      }

      fetchNotes()
    } catch (error) {
      console.error("Error deleting note:", error)
      alert("Failed to delete note. Please try again.")
    }
  }

  const handleEdit = (note: ChapterNote) => {
    setEditingNote(note)
    setFormData({
      chapterNumber: note.chapterNumber?.toString() || "",
      chapterTitle: note.chapterTitle || "",
      note: note.note,
      pageNumber: note.pageNumber?.toString() || "",
    })
    setOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chapter Notes</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingNote(null)
              setFormData({ chapterNumber: "", chapterTitle: "", note: "", pageNumber: "" })
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chapter notes yet.</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {note.chapterNumber && (
                      <span className="text-sm font-medium text-muted-foreground">
                        Chapter {note.chapterNumber}
                        {note.chapterTitle && `: ${note.chapterTitle}`}
                      </span>
                    )}
                    {note.pageNumber && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (Page {note.pageNumber})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Edit Chapter Note" : "Add Chapter Note"}
            </DialogTitle>
            <DialogDescription>
              Add notes about specific chapters or pages
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chapterNumber">Chapter Number</Label>
                <Input
                  id="chapterNumber"
                  type="number"
                  value={formData.chapterNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, chapterNumber: e.target.value })
                  }
                  min="1"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pageNumber">Page Number</Label>
                <Input
                  id="pageNumber"
                  type="number"
                  value={formData.pageNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, pageNumber: e.target.value })
                  }
                  min="1"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapterTitle">Chapter Title (Optional)</Label>
              <Input
                id="chapterTitle"
                value={formData.chapterTitle}
                onChange={(e) =>
                  setFormData({ ...formData, chapterTitle: e.target.value })
                }
                placeholder="e.g., The Boy Who Lived"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Your thoughts about this chapter..."
                rows={5}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : editingNote ? "Update Note" : "Add Note"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
}

export function BookActions({
  book,
  onBookUpdated,
}: {
  book: Book
  onBookUpdated?: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    totalPages: book.totalPages.toString(),
  })

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update book")
      }

      setEditOpen(false)
      if (onBookUpdated) {
        onBookUpdated()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating book:", error)
      alert("Failed to update book. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete book")
      }

      if (onBookUpdated) {
        onBookUpdated()
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error("Error deleting book:", error)
      alert("Failed to delete book. Please try again.")
    }
  }

  return (
    <div className="flex gap-1">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update book information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-author">Author</Label>
              <Input
                id="edit-author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-totalPages">Total Pages</Label>
              <Input
                id="edit-totalPages"
                type="number"
                value={formData.totalPages}
                onChange={(e) =>
                  setFormData({ ...formData, totalPages: e.target.value })
                }
                required
                min="1"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating..." : "Update Book"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}


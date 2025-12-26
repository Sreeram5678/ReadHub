"use client"

import { useState, startTransition } from "react"
import { useRouter } from "next/navigation"
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
import { Trash2, Edit, CheckCircle2, BookOpen } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  initialPages?: number
  status?: string
}

export function BookActions({
  book,
  onBookUpdated,
}: {
  book: Book
  onBookUpdated?: () => void
}) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    totalPages: book.totalPages.toString(),
    initialPages: (book.initialPages || 0).toString(),
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
        // Use router.refresh() instead of window.location.reload() for better performance
        startTransition(() => {
          router.refresh()
        })
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
        // Use router.refresh() instead of window.location.reload() for better performance
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (error) {
      console.error("Error deleting book:", error)
      alert("Failed to delete book. Please try again.")
    }
  }

  const handleMarkCompleted = async () => {
    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: book.status === "completed" ? "reading" : "completed" }),
      })

      if (!response.ok) {
        throw new Error("Failed to update book status")
      }

      if (onBookUpdated) {
        onBookUpdated()
      } else {
        // Use router.refresh() instead of window.location.reload() for better performance
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (error) {
      console.error("Error updating book status:", error)
      alert("Failed to update book status. Please try again.")
    }
  }

  const handleMoveToTBR = async () => {
    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "tbr" }),
      })

      if (!response.ok) {
        throw new Error("Failed to move book to TBR")
      }

      if (onBookUpdated) {
        onBookUpdated()
      } else {
        // Use router.refresh() instead of window.location.reload() for better performance
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (error) {
      console.error("Error moving book to TBR:", error)
      alert("Failed to move book to TBR. Please try again.")
    }
  }

  const handleMoveToReading = async () => {
    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reading" }),
      })

      if (!response.ok) {
        throw new Error("Failed to move book to reading")
      }

      if (onBookUpdated) {
        onBookUpdated()
      } else {
        // Use router.refresh() instead of window.location.reload() for better performance
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (error) {
      console.error("Error moving book to reading:", error)
      alert("Failed to move book to reading. Please try again.")
    }
  }

  const handleMarkDNF = async () => {
    const reason = prompt("Why did you stop reading this book? (Optional)")
    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "dnf",
          dnfReason: reason || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark book as DNF")
      }

      if (onBookUpdated) {
        onBookUpdated()
      } else {
        // Use router.refresh() instead of window.location.reload() for better performance
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (error) {
      console.error("Error marking book as DNF:", error)
      alert("Failed to mark book as DNF. Please try again.")
    }
  }

  const isCompleted = book.status === "completed"
  const isTBR = book.status === "tbr"
  const isReading = book.status === "reading"
  const isDNF = book.status === "dnf"

  return (
    <div className="flex gap-1">
      {!isTBR && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleMarkCompleted}
          title={isCompleted ? "Mark as reading" : "Mark as completed"}
        >
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      )}
      {!isTBR && !isCompleted && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleMoveToTBR}
          title="Move to TBR"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      )}
      {isTBR && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleMoveToReading}
          title="Start reading"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      )}
      {!isDNF && !isCompleted && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleMarkDNF}
          title="Mark as Did Not Finish"
        >
          <span className="text-xs">DNF</span>
        </Button>
      )}
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
            <div className="space-y-2">
              <Label htmlFor="edit-initialPages">Initial Pages</Label>
              <Input
                id="edit-initialPages"
                type="number"
                value={formData.initialPages}
                onChange={(e) =>
                  setFormData({ ...formData, initialPages: e.target.value })
                }
                min="0"
                placeholder="Pages already read before tracking"
              />
              <p className="text-xs text-muted-foreground">
                Pages you had already read before starting to track progress.
              </p>
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


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Book {
  id: string
  title: string
  author: string
}

interface Quote {
  id: string
  quoteText: string
  bookId: string | null
  pageNumber: number | null
}

interface EditQuoteFormProps {
  quote: Quote
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuoteUpdated: () => void
}

export function EditQuoteForm({
  quote,
  open,
  onOpenChange,
  onQuoteUpdated,
}: EditQuoteFormProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    quoteText: quote.quoteText,
    bookId: quote.bookId || "none",
    pageNumber: quote.pageNumber?.toString() || "",
  })

  useEffect(() => {
    if (open) {
      setFormData({
        quoteText: quote.quoteText,
        bookId: quote.bookId || "none",
        pageNumber: quote.pageNumber?.toString() || "",
      })
      fetchBooks()
    }
  }, [quote, open])

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books")
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      }
    } catch (error) {
      console.error("Failed to fetch books:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteText: formData.quoteText,
          bookId: formData.bookId === "none" ? null : formData.bookId,
          pageNumber: formData.pageNumber || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update quote")
      }

      onOpenChange(false)
      onQuoteUpdated()
    } catch (error) {
      console.error("Error updating quote:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update quote. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quote?")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete quote")
      }

      onOpenChange(false)
      onQuoteUpdated()
    } catch (error) {
      console.error("Error deleting quote:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete quote. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Quote</DialogTitle>
          <DialogDescription>
            Update your saved quote
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quoteText">Quote</Label>
            <Textarea
              id="quoteText"
              value={formData.quoteText}
              onChange={(e) => setFormData({ ...formData, quoteText: e.target.value })}
              placeholder="Enter your favorite quote..."
              required
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book">Book (Optional)</Label>
            <Select
              value={formData.bookId}
              onValueChange={(value) => setFormData({ ...formData, bookId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a book (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} by {book.author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.bookId && (
            <div className="space-y-2">
              <Label htmlFor="pageNumber">Page Number (Optional)</Label>
              <Input
                id="pageNumber"
                type="number"
                value={formData.pageNumber}
                onChange={(e) => setFormData({ ...formData, pageNumber: e.target.value })}
                placeholder="Page number"
                min="1"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Quote"}
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


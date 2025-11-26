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
  DialogTrigger,
} from "@/components/ui/dialog"

interface Book {
  id: string
  title: string
  author: string
}

interface AddQuoteFormProps {
  onQuoteAdded: () => void
}

export function AddQuoteForm({ onQuoteAdded }: AddQuoteFormProps) {
  const [open, setOpen] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    quoteText: "",
    bookId: "",
    pageNumber: "",
  })

  useEffect(() => {
    fetchBooks()
  }, [])

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
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteText: formData.quoteText,
          bookId: formData.bookId || null,
          pageNumber: formData.pageNumber || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add quote")
      }

      setFormData({
        quoteText: "",
        bookId: "",
        pageNumber: "",
      })
      setOpen(false)
      onQuoteAdded()
    } catch (error) {
      console.error("Error adding quote:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add quote. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Add Quote
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Quote</DialogTitle>
          <DialogDescription>
            Save a favorite quote from your reading
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
                <SelectItem value="">None</SelectItem>
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Quote"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


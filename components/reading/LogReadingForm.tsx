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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookOpen } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
}

export function LogReadingForm({
  books,
  onLogAdded,
}: {
  books: Book[]
  onLogAdded: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bookId: "",
    pagesRead: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (books.length > 0) {
      setFormData(prev => ({ ...prev, bookId: books[0].id }))
    }
  }, [books])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/reading-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to log reading")
      }

      setFormData({
        bookId: books.length > 0 ? books[0].id : "",
        pagesRead: "",
        date: new Date().toISOString().split("T")[0],
      })
      setOpen(false)
      onLogAdded()
    } catch (error) {
      console.error("Error logging reading:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to log reading. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (books.length === 0) {
    return (
      <Button disabled variant="outline">
        <BookOpen className="mr-2 h-4 w-4" />
        Add a book first to log reading
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <BookOpen className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Log Reading</span>
          <span className="sm:hidden">Log</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle>Log Reading</DialogTitle>
          <DialogDescription>
            Record how many pages you read today
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book">Book</Label>
            <Select
              value={formData.bookId}
              onValueChange={(value) =>
                setFormData({ ...formData, bookId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a book" />
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} by {book.author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging..." : "Log Reading"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


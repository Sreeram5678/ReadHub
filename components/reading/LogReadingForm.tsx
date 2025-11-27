"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  totalPages: number
  currentPage?: number | null
  initialPages?: number | null
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
  const [bookPageOverrides, setBookPageOverrides] = useState<Record<string, number>>({})
  const [formData, setFormData] = useState({
    bookId: "",
    startPage: "",
    endPage: "",
    date: new Date().toISOString().split("T")[0],
  })

  const getStartPageForBook = useCallback(
    (book?: Book) => {
      if (!book) return ""
      const override = bookPageOverrides[book.id]
      const lastReadPage =
        override !== undefined
          ? override
          : (book.initialPages || 0) + (book.currentPage || 0)
      const nextPage =
        lastReadPage >= book.totalPages ? book.totalPages : lastReadPage + 1
      return nextPage.toString()
    },
    [bookPageOverrides]
  )

  useEffect(() => {
    if (books.length > 0) {
      setFormData(prev => {
        if (prev.bookId) {
          return prev
        }
        const defaultBook = books[0]
        return {
          ...prev,
          bookId: defaultBook.id,
          startPage: getStartPageForBook(defaultBook),
          endPage: "",
        }
      })
    }
  }, [books, getStartPageForBook])

  const selectedBook = useMemo(
    () => books.find((book) => book.id === formData.bookId),
    [books, formData.bookId]
  )

  const computedPagesRead = useMemo(() => {
    const start = parseInt(formData.startPage, 10)
    const end = parseInt(formData.endPage, 10)
    if (Number.isNaN(start) || Number.isNaN(end)) {
      return null
    }
    const diff = end - start + 1
    return diff > 0 ? diff : null
  }, [formData.startPage, formData.endPage])

  const handleBookChange = (bookId: string) => {
    const book = books.find((b) => b.id === bookId)
    setFormData({
      bookId,
      startPage: getStartPageForBook(book),
      endPage: "",
      date: formData.date,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.bookId) {
      alert("Please select a book")
      return
    }

    const book = selectedBook
    if (!book) {
      alert("Selected book not found")
      return
    }

    const startPage = parseInt(formData.startPage, 10)
    const endPage = parseInt(formData.endPage, 10)

    if (Number.isNaN(startPage) || Number.isNaN(endPage)) {
      alert("Please enter valid start and end pages")
      return
    }

    if (startPage < 1) {
      alert("Start page must be at least 1")
      return
    }

    if (endPage > book.totalPages) {
      alert(`End page cannot exceed ${book.totalPages}`)
      return
    }

    if (endPage < startPage) {
      alert("End page must be greater than or equal to start page")
      return
    }

    const pagesRead = endPage - startPage + 1

    if (pagesRead <= 0) {
      alert("Please enter a valid page range")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/reading-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: formData.bookId,
          pagesRead,
          date: formData.date,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to log reading")
      }

      const lastReadPage = Math.min(endPage, book.totalPages)
      setBookPageOverrides((prev) => ({
        ...prev,
        [book.id]: lastReadPage,
      }))

      setFormData({
        bookId: book.id,
        startPage: Math.min(lastReadPage + 1, book.totalPages).toString(),
        endPage: "",
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
              onValueChange={handleBookChange}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startPage">Start Page</Label>
              <Input
                id="startPage"
                type="number"
                value={formData.startPage}
                onChange={(e) =>
                  setFormData({ ...formData, startPage: e.target.value })
                }
                required
                min={1}
                max={selectedBook?.totalPages}
              />
              <p className="text-xs text-muted-foreground">
                Prefilled from your last log. Adjust if needed.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endPage">Ending Page</Label>
              <Input
                id="endPage"
                type="number"
                value={formData.endPage}
                onChange={(e) =>
                  setFormData({ ...formData, endPage: e.target.value })
                }
                required
                min={formData.startPage || "1"}
                max={selectedBook?.totalPages}
              />
              <p className="text-xs text-muted-foreground">
                Where you stopped reading this session.
              </p>
            </div>
          </div>
          {computedPagesRead !== null && (
            <p className="text-sm text-muted-foreground">
              This will log {computedPagesRead} page{computedPagesRead === 1 ? "" : "s"}.
            </p>
          )}
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


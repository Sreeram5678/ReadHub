"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Book {
  id: string
  title: string
  author: string
}

interface QuickReadingLogProps {
  books: Book[]
  onLogAdded: () => void
}

export function QuickReadingLog({ books, onLogAdded }: QuickReadingLogProps) {
  const [selectedBookId, setSelectedBookId] = useState<string>("")
  const [loading, setLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userTimezone, setUserTimezone] = useState<string>("Asia/Kolkata")

  useEffect(() => {
    // Fetch user timezone
    fetch("/api/profile/timezone")
      .then((res) => res.json())
      .then((data) => {
        if (data.timezone) {
          setUserTimezone(data.timezone)
        }
      })
      .catch(() => {
        // Use default timezone already set
      })
  }, [])

  useEffect(() => {
    // Auto-select most recently read book (first book in list)
    if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0].id)
    }
  }, [books, selectedBookId])

  const quickLog = async (pages: number) => {
    if (!selectedBookId) {
      alert("Please select a book first")
      return
    }

    setLoading(`${pages}`)
    setSuccess(false)

    try {
      const response = await fetch("/api/reading-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBookId,
          pagesRead: pages,
          date: new Date().toLocaleDateString("en-CA", { timeZone: userTimezone }),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to log reading")
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onLogAdded()
      }, 1000)
    } catch (error) {
      console.error("Error logging reading:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to log reading. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(null)
    }
  }

  if (books.length === 0) {
    return null
  }

  const selectedBook = books.find((b) => b.id === selectedBookId)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Log
        </CardTitle>
        <CardDescription>One-tap reading log</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Label htmlFor="quick-log-book">Book</Label>
          <Select
            value={selectedBookId}
            onValueChange={setSelectedBookId}
          >
            <SelectTrigger id="quick-log-book">
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
        {selectedBook && (
          <div className="text-sm">
            <p className="text-muted-foreground">Selected book:</p>
            <p className="font-medium">{selectedBook.title}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {[5, 10, 20, 50].map((pages) => (
            <Button
              key={pages}
              onClick={() => quickLog(pages)}
              disabled={!selectedBookId || loading !== null}
              variant={loading === `${pages}` ? "default" : "outline"}
              className="relative"
            >
              {loading === `${pages}` ? (
                <span className="text-sm">Logging...</span>
              ) : (
                <span className="text-sm">{pages} pages</span>
              )}
            </Button>
          ))}
        </div>
        {success && (
          <p className="text-sm text-center text-green-600">Reading logged successfully!</p>
        )}
      </CardContent>
    </Card>
  )
}


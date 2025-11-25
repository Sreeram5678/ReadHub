"use client"

import { useState } from "react"
import { AddBookForm } from "./AddBookForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookActions } from "./BookActions"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, BookOpen } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  initialPages: number
  status?: string
  priority?: number | null
  readingLogs: { pagesRead: number }[]
}

export function TBRPageClient({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState(initialBooks)

  const refreshBooks = async () => {
    const response = await fetch("/api/books?status=tbr")
    if (response.ok) {
      const data = await response.json()
      setBooks(data)
    }
  }

  const handleMovePriority = async (bookId: string, direction: "up" | "down") => {
    const book = books.find((b) => b.id === bookId)
    if (!book || book.priority === null || book.priority === undefined) return

    const currentIndex = books.findIndex((b) => b.id === bookId)
    if (currentIndex === -1) return

    let targetIndex: number
    if (direction === "up") {
      if (currentIndex === 0) return
      targetIndex = currentIndex - 1
    } else {
      if (currentIndex === books.length - 1) return
      targetIndex = currentIndex + 1
    }

    const targetBook = books[targetIndex]
    if (!targetBook || targetBook.priority === null || targetBook.priority === undefined) return

    // Calculate new priority based on direction
    let newPriority: number
    if (direction === "up") {
      // Move up: set priority to target's priority - 0.5, then we'll reorder
      newPriority = targetBook.priority - 1
    } else {
      // Move down: set priority to target's priority + 0.5, then we'll reorder
      newPriority = targetBook.priority + 1
    }

    try {
      // Update the current book's priority
      const response = await fetch(`/api/books/priority`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          newPriority: newPriority,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update priority")
      }

      // Refresh the list to get the updated order
      await refreshBooks()
    } catch (error) {
      console.error("Error updating priority:", error)
      alert("Failed to update priority. Please try again.")
    }
  }

  const handleStartReading = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reading" }),
      })

      if (!response.ok) {
        throw new Error("Failed to move book to reading")
      }

      await refreshBooks()
    } catch (error) {
      console.error("Error moving book to reading:", error)
      alert("Failed to move book to reading. Please try again.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">To Be Read (TBR)</h1>
          <p className="text-muted-foreground">
            Manage your reading queue and prioritize what to read next
          </p>
          {books.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {books.length} {books.length === 1 ? "book" : "books"} in your TBR list
            </p>
          )}
        </div>
        <AddBookForm onBookAdded={refreshBooks} />
      </div>

      {books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Your TBR shelf is empty. Add books you want to read!
            </p>
            <AddBookForm onBookAdded={refreshBooks} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {books.map((book, index) => {
            const totalPagesRead = book.initialPages + book.readingLogs.reduce(
              (sum, log) => sum + log.pagesRead,
              0
            )
            const progress = book.totalPages > 0 ? (totalPagesRead / book.totalPages) * 100 : 0

            return (
              <Card key={book.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{book.priority || index + 1}
                        </span>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMovePriority(book.id, "up")}
                            disabled={index === 0}
                            title="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMovePriority(book.id, "down")}
                            disabled={index === books.length - 1}
                            title="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                        <CardDescription className="mt-1">
                          by {book.author}
                        </CardDescription>
                        {book.totalPages > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {book.totalPages} pages
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStartReading(book.id)}
                        className="flex items-center gap-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        Start Reading
                      </Button>
                      <BookActions book={book} onBookUpdated={refreshBooks} />
                    </div>
                  </div>
                </CardHeader>
                {totalPagesRead > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {totalPagesRead} / {book.totalPages} pages ({Math.round(progress)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}


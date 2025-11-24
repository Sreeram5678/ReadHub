"use client"

import { useState } from "react"
import { AddBookForm } from "./AddBookForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookActions } from "./BookActions"

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  initialPages: number
  status?: string
  readingLogs: { pagesRead: number }[]
}

export function BooksPageClient({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState(initialBooks)

  const refreshBooks = async () => {
    const response = await fetch("/api/books")
    if (response.ok) {
      const data = await response.json()
      // Books already include readingLogs from the API, no need for N+1 queries
      setBooks(data)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Books</h1>
          <p className="text-muted-foreground">
            Manage your reading list and track progress
          </p>
        </div>
        <AddBookForm onBookAdded={refreshBooks} />
      </div>

      {books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No books yet. Add your first book to start tracking!
            </p>
            <AddBookForm onBookAdded={refreshBooks} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => {
            const totalPagesRead = book.initialPages + book.readingLogs.reduce(
              (sum, log) => sum + log.pagesRead,
              0
            )
            const progress = (totalPagesRead / book.totalPages) * 100
            const isCompleted = book.status === "completed"

            return (
              <Card key={book.id} className={isCompleted ? "opacity-75" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                      <CardDescription className="mt-1">
                        by {book.author}
                        {isCompleted && (
                          <span className="ml-2 text-green-600">Completed</span>
                        )}
                      </CardDescription>
                    </div>
                    <BookActions book={book} onBookUpdated={refreshBooks} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {totalPagesRead} / {book.totalPages} pages
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full transition-all ${
                          isCompleted ? "bg-green-600" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isCompleted ? "100% complete" : `${Math.round(progress)}% complete`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}


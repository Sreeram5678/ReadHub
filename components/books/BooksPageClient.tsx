"use client"

import { useState } from "react"
import { AddBookForm } from "./AddBookForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookActions } from "./BookActions"
import { ProgressRing } from "@/components/ui/progress-ring"
import { BookTimeEstimate } from "./BookTimeEstimate"

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

  const completedBooks = books.filter((b) => b.status === "completed").length
  const completionPercentage = books.length > 0 
    ? Math.round((completedBooks / books.length) * 100) 
    : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Books</h1>
          <p className="text-muted-foreground">
            Manage your reading list and track progress
          </p>
          {books.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              You've completed {completedBooks} out of {books.length} books ({completionPercentage}%)
            </p>
          )}
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
            const remainingPages = Math.max(0, book.totalPages - totalPagesRead)
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
                  <div className="flex items-center gap-6">
                    <ProgressRing
                      value={totalPagesRead}
                      max={book.totalPages}
                      size={100}
                      completed={isCompleted}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {totalPagesRead} / {book.totalPages} pages
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isCompleted ? "100% complete" : `${Math.round(progress)}% complete`}
                      </p>
                      {!isCompleted && remainingPages > 0 && (
                        <BookTimeEstimate remainingPages={remainingPages} />
                      )}
                    </div>
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


"use client"

import { useMemo, useState } from "react"
import { AddBookForm } from "./AddBookForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookActions } from "./BookActions"
import { ProgressRing } from "@/components/ui/progress-ring"
import { BookTimeEstimate } from "./BookTimeEstimate"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  initialPages: number
  status?: string
  readingLogs: { pagesRead: number }[]
}

type BooksFilter = "all" | "reading" | "completed"

export function BooksPageClient({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState(initialBooks)
  const [filter, setFilter] = useState<BooksFilter>("all")

  const refreshBooks = async () => {
    const response = await fetch("/api/books")
    if (response.ok) {
      const data = await response.json()
      // Books already include readingLogs from the API, no need for N+1 queries
      setBooks(data)
    }
  }

  const completedBooks = books.filter((b) => b.status === "completed").length
  const completionPercentage =
    books.length > 0 ? Math.round((completedBooks / books.length) * 100) : 0

  const filteredBooks = useMemo(() => {
    if (filter === "all") return books
    if (filter === "reading") return books.filter((b) => b.status === "reading")
    if (filter === "completed") return books.filter((b) => b.status === "completed")
    return books
  }, [books, filter])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as BooksFilter)}
          >
            <SelectTrigger size="sm" className="min-w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All books</SelectItem>
              <SelectItem value="reading">Currently reading</SelectItem>
              <SelectItem value="completed">Finished</SelectItem>
            </SelectContent>
          </Select>
        <AddBookForm onBookAdded={refreshBooks} />
        </div>
      </div>

      {books.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No books yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Add your first book to start tracking your reading progress!
            </p>
            <AddBookForm onBookAdded={refreshBooks} />
          </CardContent>
        </Card>
      ) : filteredBooks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No books match this view</h3>
            <p className="text-sm text-muted-foreground">
              Try switching to a different section from the dropdown above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => {
            const totalPagesRead = book.initialPages + book.readingLogs.reduce(
              (sum, log) => sum + log.pagesRead,
              0
            )
            const remainingPages = Math.max(0, book.totalPages - totalPagesRead)
            const progress = (totalPagesRead / book.totalPages) * 100
            const isCompleted = book.status === "completed"

            return (
              <Card
                key={book.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  isCompleted 
                    ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-transparent" 
                    : "border-primary/10"
                )}
              >
                {isCompleted && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-12 -mt-12" />
                )}
                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 text-base md:text-lg font-semibold">{book.title}</CardTitle>
                      <CardDescription className="mt-1 text-xs md:text-sm">
                        by {book.author}
                        {isCompleted && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            ✓ Completed
                          </span>
                        )}
                        {!isCompleted && book.status === "reading" && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/30">
                            Reading
                          </span>
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
                      size={90}
                      completed={isCompleted}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs md:text-sm">
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


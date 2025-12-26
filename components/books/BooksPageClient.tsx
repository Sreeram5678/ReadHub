"use client"

import { useMemo, useState } from "react"
import type { ChangeEvent, MouseEvent } from "react"
import { AddBookForm } from "./AddBookForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookActions } from "./BookActions"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { BookDetailsModal } from "./BookDetailsModal"
import { QuickLogButton } from "./QuickLogButton"
import { Search, ArrowUpDown, Calendar, BookOpen, TrendingUp } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  initialPages: number
  status?: string
  seriesName?: string | null
  createdAt: string
  readingLogs: { pagesRead: number; date: string }[]
}

type BooksFilter = "all" | "reading" | "completed"
type SortOption = "title" | "author" | "dateAdded" | "progress" | "pagesRead"

export function BooksPageClient({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState(initialBooks)
  const [filter, setFilter] = useState<BooksFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const refreshBooks = async () => {
    const response = await fetch("/api/books")
    if (response.ok) {
      const data = await response.json()
      // Books already include readingLogs from the API, no need for N+1 queries
      setBooks(data)
    }
  }

  const completedBooks = books.filter((b: Book) => b.status === "completed").length
  const completionPercentage =
    books.length > 0 ? Math.round((completedBooks / books.length) * 100) : 0

  const filteredAndSortedBooks = useMemo(() => {
    // First apply search filter
    let result = books
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (book: Book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          (book.seriesName && book.seriesName.toLowerCase().includes(query))
      )
    }

    // Then apply status filter
    if (filter === "reading") {
      result = result.filter((b: Book) => b.status === "reading")
    } else if (filter === "completed") {
      result = result.filter((b: Book) => b.status === "completed")
    }

    // Then apply sorting
    result = [...result].sort((a: Book, b: Book) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "author":
          return a.author.localeCompare(b.author)
        case "dateAdded":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "progress": {
          const aProgress =
            ((a.initialPages + a.readingLogs.reduce((sum: number, log: { pagesRead: number }) => sum + log.pagesRead, 0)) /
              a.totalPages) *
            100
          const bProgress =
            ((b.initialPages + b.readingLogs.reduce((sum: number, log: { pagesRead: number }) => sum + log.pagesRead, 0)) /
              b.totalPages) *
            100
          return bProgress - aProgress
        }
        case "pagesRead": {
          const aPages = a.initialPages + a.readingLogs.reduce((sum: number, log: { pagesRead: number }) => sum + log.pagesRead, 0)
          const bPages = b.initialPages + b.readingLogs.reduce((sum: number, log: { pagesRead: number }) => sum + log.pagesRead, 0)
          return bPages - aPages
        }
        default:
          return 0
      }
    })

    return result
  }, [books, filter, searchQuery, sortBy])

  const handleBookClick = (book: Book) => {
    setSelectedBook(book)
    setDetailsModalOpen(true)
  }

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
            onValueChange={(value: string) => setFilter(value as BooksFilter)}
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

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or series..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateAdded">Date Added</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="author">Author A-Z</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="pagesRead">Pages Read</SelectItem>
          </SelectContent>
        </Select>
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
      ) : filteredAndSortedBooks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No books match your search</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search query or filter options.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedBooks.map((book: Book) => {
              const totalPagesRead = book.initialPages + book.readingLogs.reduce(
                (sum: number, log: { pagesRead: number; date: string }) => sum + log.pagesRead,
                0
              )
              const remainingPages = Math.max(0, book.totalPages - totalPagesRead)
              const progress = (totalPagesRead / book.totalPages) * 100
              const isCompleted = book.status === "completed"
              const readingDays = new Set(book.readingLogs.map((log: { date: string }) => log.date.split('T')[0])).size
              const daysSinceFirstLog = book.readingLogs.length > 0
                ? Math.ceil((new Date().getTime() - new Date(book.readingLogs[0].date).getTime()) / (1000 * 60 * 60 * 24)) + 1
                : 0
              const avgPagesPerDay = daysSinceFirstLog > 0 ? (totalPagesRead / daysSinceFirstLog) : 0

              return (
                <Card
                  key={book.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg",
                    isCompleted 
                      ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-transparent" 
                      : "border-primary/10"
                  )}
                  onClick={() => handleBookClick(book)}
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
                      <div onClick={(e: MouseEvent) => e.stopPropagation()}>
                        <BookActions book={book} onBookUpdated={refreshBooks} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 mb-4">
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
                      </div>
                    </div>

                    {/* Reading Statistics */}
                    {!isCompleted && book.readingLogs.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{readingDays} days</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span>{avgPagesPerDay.toFixed(1)}/day</span>
                        </div>
                      </div>
                    )}

                    {/* Quick Log Button */}
                    {!isCompleted && (
                      <div className="mt-4 pt-4 border-t" onClick={(e: MouseEvent) => e.stopPropagation()}>
                        <QuickLogButton
                          bookId={book.id}
                          bookTitle={book.title}
                          onLogAdded={refreshBooks}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Book Details Modal */}
          <BookDetailsModal
            book={selectedBook}
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            onBookUpdated={refreshBooks}
          />
        </>
      )}
    </div>
  )
}


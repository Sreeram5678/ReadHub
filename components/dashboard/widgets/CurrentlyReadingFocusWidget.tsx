"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Book } from "../DashboardContext"

interface CurrentlyReadingFocusWidgetProps {
  books: Book[]
}

export function CurrentlyReadingFocusWidget({ books }: CurrentlyReadingFocusWidgetProps) {
  const router = useRouter()
  const [currentlyReading, setCurrentlyReading] = useState<Book | null>(null)

  useEffect(() => {
    if (books.length > 0) {
      const book = books[0]
      if (!book.totalPages) {
        setCurrentlyReading(null)
        return
      }
      const totalPagesRead = (book.initialPages || 0) + (book.readingLogs || []).reduce(
        (sum, log) => sum + log.pagesRead,
        0
      )
      if (totalPagesRead < book.totalPages) {
        setCurrentlyReading(book)
      } else {
        setCurrentlyReading(null)
      }
    } else {
      setCurrentlyReading(null)
    }
  }, [books])

  if (!currentlyReading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
            Currently Reading
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Your active book</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No book currently being read. Start reading a book to see it here!
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!currentlyReading.totalPages) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
            Currently Reading
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Your active book</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No book currently being read. Start reading a book to see it here!
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalPagesRead = (currentlyReading.initialPages || 0) + (currentlyReading.readingLogs || []).reduce(
    (sum, log) => sum + log.pagesRead,
    0
  )
  const progress = (totalPagesRead / currentlyReading.totalPages) * 100
  const remainingPages = Math.max(0, currentlyReading.totalPages - totalPagesRead)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
          Currently Reading
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">Your active book</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold line-clamp-1">{currentlyReading.title}</h3>
          <p className="text-sm text-muted-foreground">by {currentlyReading.author}</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {totalPagesRead} / {currentlyReading.totalPages} pages
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% complete • {remainingPages} pages remaining
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => router.push("/books")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Log Reading
        </Button>
      </CardContent>
    </Card>
  )
}


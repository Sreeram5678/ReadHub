"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  currentPage?: number
  initialPages?: number
  readingLogs: Array<{ pagesRead: number }>
}

interface CurrentlyReadingFocusWidgetProps {
  books: Book[]
}

export function CurrentlyReadingFocusWidget({ books }: CurrentlyReadingFocusWidgetProps) {
  const router = useRouter()
  const currentlyReading = useMemo(() => {
    if (books.length === 0) {
      return null
    }
    const book = books[0]
    const totalPagesRead =
      (book.initialPages || 0) + book.readingLogs.reduce((sum, log) => sum + log.pagesRead, 0)
    return totalPagesRead < book.totalPages ? book : null
  }, [books])

  const emptyState = (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-surface rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)]"
    >
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-[color:var(--accent)]" />
        <div>
          <p className="serif-heading text-xl">Currently Reading</p>
          <p className="text-sm text-muted">No active book yet.</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">Start a new book to see a focused summary here.</p>
    </motion.div>
  )

  if (!currentlyReading) {
    return emptyState
  }

  const totalPagesRead =
    (currentlyReading.initialPages || 0) +
    currentlyReading.readingLogs.reduce((sum, log) => sum + log.pagesRead, 0)
  const progress = (totalPagesRead / currentlyReading.totalPages) * 100
  const remainingPages = Math.max(0, currentlyReading.totalPages - totalPagesRead)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-surface rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)]"
    >
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-[color:var(--accent)]" />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Currently Reading</p>
          <p className="serif-heading text-2xl">{currentlyReading.title}</p>
          <p className="text-sm text-muted">by {currentlyReading.author}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Progress</span>
          <span className="font-medium">
            {totalPagesRead} / {currentlyReading.totalPages} pages
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/20">
          <div className="h-full rounded-full bg-[color:var(--accent)] transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <p className="text-xs text-muted">
          {Math.round(progress)}% complete • {remainingPages} pages remaining
        </p>
      </div>
      <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push("/books")}>
        <Plus className="mr-2 h-4 w-4" />
        Log Reading
      </Button>
    </motion.div>
  )
}


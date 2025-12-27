"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/ui/progress-ring"
import { BookRatingForm } from "./BookRatingForm"
import { ChapterNotesList } from "./ChapterNotesList"
import { ReadingJournalList } from "./ReadingJournalList"
import { VocabularyList } from "./VocabularyList"
import { ReReadTracking } from "./ReReadTracking"
import { BookMemoryList } from "./BookMemoryList"
import { BookTimeEstimate } from "./BookTimeEstimate"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookActions } from "./BookActions"
import { Star, Calendar, BookOpen, Clock, TrendingUp, FileText, BookMarked, BookOpenCheck, MapPin } from "lucide-react"
import { formatTimeEstimate } from "@/lib/reading-speed"

interface Book {
  id: string
  title: string
  author: string
  totalPages: number
  initialPages: number
  status?: string
  seriesName?: string | null
  seriesNumber?: number | null
  completedAt?: string | null
  createdAt: string
  readingLogs: { pagesRead: number; date: string }[]
}

interface BookStats {
  totalPagesRead: number
  remainingPages: number
  daysReading: number
  averagePagesPerDay: number
  readingDays: number
  estimatedTimeToFinish: number | null
  firstReadDate: string | null
  lastReadDate: string | null
  totalReadingSessions: number
  rating: {
    overallRating: number | null
    plotRating: number | null
    characterRating: number | null
    writingRating: number | null
    pacingRating: number | null
    review: string | null
  } | null
}

interface BookDetailsModalProps {
  book: Book | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookUpdated: () => void
}

export function BookDetailsModal({
  book,
  open,
  onOpenChange,
  onBookUpdated,
}: BookDetailsModalProps) {
  const [stats, setStats] = useState<BookStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("notes")

  useEffect(() => {
    if (open && book) {
      fetchStats()
    }
  }, [open, book])

  const fetchStats = async () => {
    if (!book) return
    setLoading(true)
    try {
      const response = await fetch(`/api/books/${book.id}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching book stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!book) return null

  const totalPagesRead = book.initialPages + book.readingLogs.reduce(
    (sum: number, log: { pagesRead: number; date: string }) => sum + log.pagesRead,
    0
  )
  const progress = (totalPagesRead / book.totalPages) * 100
  const isCompleted = book.status === "completed"

  const getTabLabel = (value: string) => {
    const labels: Record<string, string> = {
      notes: "Notes",
      rating: "Rate",
      logs: "Logs",
      journal: "Journal",
      vocabulary: "Words",
      rereads: "Re-reads",
      memories: "Memories",
    }
    return labels[value] || "Notes"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{book.title}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                by {book.author}
                {book.seriesName && (
                  <span className="ml-2 text-sm">
                    ({book.seriesName}
                    {book.seriesNumber && ` #${book.seriesNumber}`})
                  </span>
                )}
              </DialogDescription>
            </div>
            <BookActions book={book} onBookUpdated={() => {
              onBookUpdated()
              fetchStats()
            }} />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Reading Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ProgressRing
                  value={totalPagesRead}
                  max={book.totalPages}
                  size={120}
                  completed={isCompleted}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages Read</span>
                    <span className="font-semibold">
                      {totalPagesRead} / {book.totalPages}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {isCompleted ? "100%" : `${Math.round(progress)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold capitalize">{book.status || "reading"}</span>
                  </div>
                  {book.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-semibold">
                        {new Date(book.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reading Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Reading Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading statistics...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Days Reading</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.daysReading}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>Reading Days</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.readingDays}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Avg Pages/Day</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.averagePagesPerDay.toFixed(1)}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Time Left</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {stats.estimatedTimeToFinish
                          ? formatTimeEstimate(stats.estimatedTimeToFinish)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rating */}
          {stats?.rating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  Your Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.rating.overallRating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Overall:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= stats.rating!.overallRating!
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {stats.rating.review && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm whitespace-pre-wrap">{stats.rating.review}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for additional content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile: Dropdown Select */}
            <div className="md:hidden mb-4">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notes">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Notes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>Rate</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="logs">
                    <span>Logs</span>
                  </SelectItem>
                  <SelectItem value="journal">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Journal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="vocabulary">
                    <div className="flex items-center gap-2">
                      <BookMarked className="h-4 w-4" />
                      <span>Words</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rereads">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="h-4 w-4" />
                      <span>Re-reads</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="memories">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Memories</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop: Tabs */}
            <TabsList className="hidden md:grid w-full grid-cols-7 gap-1">
              <TabsTrigger value="notes" className="text-xs">
                <FileText className="h-4 w-4 mr-1" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="rating" className="text-xs">
                <Star className="h-4 w-4 mr-1" />
                Rate
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs">Logs</TabsTrigger>
              <TabsTrigger value="journal" className="text-xs">
                <BookOpen className="h-4 w-4 mr-1" />
                Journal
              </TabsTrigger>
              <TabsTrigger value="vocabulary" className="text-xs">
                <BookMarked className="h-4 w-4 mr-1" />
                Words
              </TabsTrigger>
              <TabsTrigger value="rereads" className="text-xs">
                <BookOpenCheck className="h-4 w-4 mr-1" />
                Re-reads
              </TabsTrigger>
              <TabsTrigger value="memories" className="text-xs">
                <MapPin className="h-4 w-4 mr-1" />
                Memories
              </TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="mt-4">
              <ChapterNotesList bookId={book.id} />
            </TabsContent>
            <TabsContent value="rating" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rate This Book</CardTitle>
                  <CardDescription>
                    Share your thoughts and rate different aspects of this book
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BookRatingForm
                    bookId={book.id}
                    onRatingSaved={() => {
                      fetchStats()
                      onBookUpdated()
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reading Logs</CardTitle>
                  <CardDescription>
                    Your reading history for this book
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {book.readingLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reading logs yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {book.readingLogs
                        .slice()
                        .reverse()
                        .map((log: { pagesRead: number; date: string }, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                          >
                            <span className="text-sm">
                              {new Date(log.date).toLocaleDateString()}
                            </span>
                            <span className="font-medium">{log.pagesRead} pages</span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="journal" className="mt-4">
              <ReadingJournalList bookId={book.id} />
            </TabsContent>
            <TabsContent value="vocabulary" className="mt-4">
              <VocabularyList bookId={book.id} />
            </TabsContent>
            <TabsContent value="rereads" className="mt-4">
              <ReReadTracking bookId={book.id} bookTitle={book.title} />
            </TabsContent>
            <TabsContent value="memories" className="mt-4">
              <BookMemoryList bookId={book.id} bookTitle={book.title} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}


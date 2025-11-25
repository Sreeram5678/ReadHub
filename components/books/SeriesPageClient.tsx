"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface SeriesBook {
  id: string
  title: string
  author: string
  seriesNumber: number | null
  status: string
}

interface Series {
  name: string
  books: SeriesBook[]
  totalBooks: number
  completedBooks: number
}

export function SeriesPageClient() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    try {
      const response = await fetch("/api/series")
      if (response.ok) {
        const data = await response.json()
        setSeries(data)
      }
    } catch (error) {
      console.error("Error fetching series:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (series.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">My Series</h1>
          <p className="text-muted-foreground">
            Track your book series and see your progress
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No series found. Add books with series information to see them here.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Series</h1>
        <p className="text-muted-foreground">
          Track your book series and see your progress
        </p>
      </div>

      <div className="space-y-6">
        {series.map((s) => {
          const progress = s.totalBooks > 0 
            ? Math.round((s.completedBooks / s.totalBooks) * 100) 
            : 0

          return (
            <Card key={s.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{s.name}</CardTitle>
                    <CardDescription>
                      {s.completedBooks} of {s.totalBooks} books completed ({progress}%)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {s.books.map((book) => {
                    const isCompleted = book.status === "completed"
                    return (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-8">
                            #{book.seriesNumber || "?"}
                          </span>
                          <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          <Link href={`/books`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}


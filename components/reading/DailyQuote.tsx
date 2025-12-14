"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quote as QuoteIcon, Pencil } from "lucide-react"
import { EditQuoteForm } from "./EditQuoteForm"

interface DailyQuoteData {
  id?: string
  quoteText: string
  bookTitle: string | null
  bookAuthor: string | null
  pageNumber: number | null
  bookId?: string | null
  isUserQuote: boolean
}

export function DailyQuote() {
  const [quote, setQuote] = useState<DailyQuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    fetchDailyQuote()
  }, [])

  const fetchDailyQuote = async () => {
    try {
      const response = await fetch("/api/quotes?daily=true")
      if (response.ok) {
        const data = await response.json()
        setQuote(data)
      }
    } catch (error) {
      console.error("Failed to fetch daily quote:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QuoteIcon className="h-5 w-5" />
            Daily Quote
          </CardTitle>
          <CardDescription>Your daily reading inspiration</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center">
          <p className="text-muted-foreground">Loading quote...</p>
        </CardContent>
      </Card>
    )
  }

  if (!quote) {
    return null
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QuoteIcon className="h-5 w-5" />
          Daily Quote
        </CardTitle>
        <CardDescription>Your daily reading inspiration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <blockquote className="text-lg italic border-l-4 border-primary pl-4 py-2 flex-1">
              "{quote.quoteText}"
            </blockquote>
            {quote.isUserQuote && quote.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="shrink-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
          {quote.isUserQuote && quote.bookTitle && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">
                {quote.bookTitle}
                {quote.bookAuthor && ` by ${quote.bookAuthor}`}
              </p>
              {quote.pageNumber && (
                <p className="text-xs">Page {quote.pageNumber}</p>
              )}
            </div>
          )}
          {!quote.isUserQuote && quote.bookAuthor && (
            <div className="text-sm text-muted-foreground">
              <p>— {quote.bookAuthor}</p>
            </div>
          )}
        </div>
      </CardContent>
      {quote.isUserQuote && quote.id && (
        <EditQuoteForm
          quote={{
            id: quote.id,
            quoteText: quote.quoteText,
            bookId: quote.bookId || null,
            pageNumber: quote.pageNumber,
          }}
          open={editOpen}
          onOpenChange={setEditOpen}
          onQuoteUpdated={() => {
            fetchDailyQuote()
          }}
        />
      )}
    </Card>
  )
}


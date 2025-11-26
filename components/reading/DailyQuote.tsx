"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote as QuoteIcon } from "lucide-react"
import { AddQuoteForm } from "./AddQuoteForm"

interface DailyQuoteData {
  quoteText: string
  bookTitle: string | null
  bookAuthor: string | null
  pageNumber: number | null
  isUserQuote: boolean
}

export function DailyQuote() {
  const [quote, setQuote] = useState<DailyQuoteData | null>(null)
  const [loading, setLoading] = useState(true)

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QuoteIcon className="h-5 w-5" />
            Daily Quote
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[220px] flex items-center">
          <p className="text-muted-foreground">Loading quote...</p>
        </CardContent>
      </Card>
    )
  }

  if (!quote) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QuoteIcon className="h-5 w-5" />
            Daily Quote
          </CardTitle>
          <AddQuoteForm
            onQuoteAdded={() => {
              fetchDailyQuote()
            }}
          />
        </div>
        <CardDescription>Your daily reading inspiration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[220px]">
        <div className="space-y-3">
          <blockquote className="text-lg italic border-l-4 border-primary pl-4 py-2">
            "{quote.quoteText}"
          </blockquote>
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
    </Card>
  )
}


"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Play, Pause, Square, Clock, Settings } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
}

interface ReadingSessionTimerProps {
  books: Book[]
}

export function ReadingSessionTimer({ books }: ReadingSessionTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>(undefined)
  const [pagesRead, setPagesRead] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set(books.map(b => b.id)))
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const tickingFromRef = useRef<number | null>(null) // when the current run started (ms)
  const accumulatedSecondsRef = useRef<number>(0) // total seconds from previous runs/segments

  const availableBooks = books.filter(book => selectedBookIds.has(book.id))

  // Ensure the select value is always a valid option or undefined
  useEffect(() => {
    if (availableBooks.length === 0) {
      setSelectedBookId(undefined)
      return
    }
    // If the current selection is missing, default to the first available book
    if (!selectedBookId || !availableBooks.some((b) => b.id === selectedBookId)) {
      setSelectedBookId(availableBooks[0].id)
    }
  }, [availableBooks, selectedBookId])

  useEffect(() => {
    if (isRunning && !isPaused) {
      const tick = () => {
        if (tickingFromRef.current !== null) {
          const elapsed = Math.floor((Date.now() - tickingFromRef.current) / 1000)
          setSeconds(accumulatedSecondsRef.current + elapsed)
        }
      }

      tick()
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = async () => {
    if (!selectedBookId) {
      alert("Please select a book")
      return
    }

    const startTime = new Date()
    startTimeRef.current = startTime
    tickingFromRef.current = Date.now()
    accumulatedSecondsRef.current = 0
    setSeconds(0)

    try {
      const response = await fetch("/api/reading-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBookId,
          startTime: startTime.toISOString(),
        }),
      })

      if (response.ok) {
        const session = await response.json()
        setSessionId(session.id)
        setIsRunning(true)
        setIsPaused(false)
      }
    } catch (error) {
      console.error("Failed to start session:", error)
    }
  }

  const handlePause = () => {
    if (!isRunning || isPaused) return

    if (tickingFromRef.current !== null) {
      const elapsed = Math.floor((Date.now() - tickingFromRef.current) / 1000)
      accumulatedSecondsRef.current += elapsed
      setSeconds(accumulatedSecondsRef.current)
    }

    tickingFromRef.current = null
    setIsPaused(true)
  }

  const handleResume = () => {
    if (!isRunning || !isPaused) return

    tickingFromRef.current = Date.now()
    setIsPaused(false)
  }

  const handleStop = async () => {
    if (!sessionId) return

    const endTime = new Date()
    const activeElapsed =
      tickingFromRef.current !== null
        ? Math.floor((Date.now() - tickingFromRef.current) / 1000)
        : 0
    const duration = accumulatedSecondsRef.current + activeElapsed

    try {
      await fetch(`/api/reading-sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endTime: endTime.toISOString(),
          pagesRead: pagesRead || 0,
          duration,
        }),
      })

      setSessionId(null)
      setIsRunning(false)
      setIsPaused(false)
      setSeconds(0)
      setPagesRead("")
      accumulatedSecondsRef.current = 0
      tickingFromRef.current = null
    } catch (error) {
      console.error("Failed to stop session:", error)
    }
  }

  const toggleBookSelection = (bookId: string) => {
    const newSelection = new Set(selectedBookIds)
    if (newSelection.has(bookId)) {
      newSelection.delete(bookId)
    } else {
      newSelection.add(bookId)
    }
    setSelectedBookIds(newSelection)
    if (selectedBookId === bookId && !newSelection.has(bookId)) {
      setSelectedBookId(undefined)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              Reading Timer
        </CardTitle>
            <CardDescription className="mt-1">Track your reading sessions</CardDescription>
          </div>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Books</DialogTitle>
                <DialogDescription>
                  Choose which books to show in the dropdown
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {books.map((book) => (
                  <div key={book.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                    <Checkbox
                      id={book.id}
                      checked={selectedBookIds.has(book.id)}
                      onCheckedChange={() => toggleBookSelection(book.id)}
                    />
                    <label
                      htmlFor={book.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                    >
                      {book.title} by {book.author}
                    </label>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="book">Select Book</Label>
          <Select
            value={selectedBookId}
            onValueChange={setSelectedBookId}
            disabled={isRunning}
          >
            <SelectTrigger id="book" className="mt-2">
              <SelectValue placeholder="Choose a book" />
            </SelectTrigger>
            <SelectContent>
              {availableBooks.length === 0 ? (
                <SelectItem value="no-books" disabled>
                  No books selected
                </SelectItem>
              ) : (
                availableBooks.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="text-center py-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary/20">
          <div className="text-5xl font-mono font-bold text-primary mb-2">{formatTime(seconds)}</div>
          <p className="text-sm font-medium text-muted-foreground">Reading time</p>
        </div>

        {isRunning && (
          <div>
            <Label htmlFor="pages">Pages Read</Label>
            <Input
              id="pages"
              type="number"
              value={pagesRead}
              onChange={(e) => setPagesRead(e.target.value)}
              placeholder="Enter pages read"
            />
          </div>
        )}

        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="flex-1" disabled={!selectedBookId}>
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button onClick={handleResume} className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button onClick={handlePause} variant="outline" className="flex-1">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button onClick={handleStop} variant="destructive" className="flex-1">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


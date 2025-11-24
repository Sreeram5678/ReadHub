"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square, Clock } from "lucide-react"

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
  const [selectedBookId, setSelectedBookId] = useState<string>("")
  const [pagesRead, setPagesRead] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
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
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleStop = async () => {
    if (!sessionId) return

    const endTime = new Date()
    const duration = seconds

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
    } catch (error) {
      console.error("Failed to stop session:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Reading Session Timer
        </CardTitle>
        <CardDescription>Track your reading time and pages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="book">Select Book</Label>
          <Select
            value={selectedBookId}
            onValueChange={setSelectedBookId}
            disabled={isRunning}
          >
            <SelectTrigger id="book">
              <SelectValue placeholder="Choose a book" />
            </SelectTrigger>
            <SelectContent>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-center py-4">
          <div className="text-4xl font-mono font-bold">{formatTime(seconds)}</div>
          <p className="text-sm text-muted-foreground mt-2">Reading time</p>
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


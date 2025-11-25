"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gauge } from "lucide-react"
import { calculateWordsPerMinute } from "@/lib/reading-speed"

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Reading is a journey that takes us to places we've never been. Books are windows to different worlds, allowing us to explore new ideas and perspectives. Every page turned is a step forward in understanding ourselves and the world around us. The power of words can inspire, educate, and transform our thinking. Through reading, we connect with authors across time and space, sharing their wisdom and experiences.`

export function ReadingSpeedTest() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [wordsRead, setWordsRead] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [result, setResult] = useState<{ wpm: number; wordsRead: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish()
            return 0
          }
          return prev - 1
        })
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
  }, [isRunning, timeLeft])

  const handleStart = () => {
    setUserInput("")
    setWordsRead(0)
    setTimeLeft(60)
    setResult(null)
    setIsRunning(true)
    startTimeRef.current = new Date()
  }

  const handleFinish = async () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const wpm = calculateWordsPerMinute(wordsRead, 60)
    setResult({ wpm, wordsRead })

    // Save to database
    setLoading(true)
    try {
      await fetch("/api/reading-speed-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordsPerMinute: wpm,
          wordsRead,
          duration: 60,
        }),
      })
    } catch (error) {
      console.error("Failed to save test result:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRunning) return

    const input = e.target.value
    setUserInput(input)

    // Count words that match the sample text
    const sampleWords = SAMPLE_TEXT.split(" ")
    const inputWords = input.split(" ")
    let correctWords = 0

    for (let i = 0; i < inputWords.length && i < sampleWords.length; i++) {
      if (inputWords[i].trim() === sampleWords[i].trim()) {
        correctWords++
      } else {
        break
      }
    }

    setWordsRead(correctWords)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(60)
    setWordsRead(0)
    setUserInput("")
    setResult(null)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Reading Speed Test
        </CardTitle>
        <CardDescription>Test your reading speed in 1 minute</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRunning && !result && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Instructions:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Read the text below as fast as you can</li>
                <li>Type what you read</li>
                <li>You have 60 seconds</li>
                <li>Click Start when ready</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm leading-relaxed">{SAMPLE_TEXT}</p>
            </div>
            <Button onClick={handleStart} className="w-full">
              Start Test
            </Button>
          </div>
        )}

        {isRunning && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{timeLeft}s</div>
              <p className="text-sm text-muted-foreground">Time remaining</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm leading-relaxed mb-2">{SAMPLE_TEXT}</p>
            </div>
            <div>
              <textarea
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type what you read here..."
                className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
                autoFocus
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Words read</p>
                <p className="text-2xl font-bold">{wordsRead}</p>
              </div>
              <Button onClick={handleFinish} variant="outline">
                Finish Early
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="text-center p-6 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Your Reading Speed</p>
              <p className="text-4xl font-bold text-primary">{result.wpm} WPM</p>
              <p className="text-sm text-muted-foreground mt-2">
                {result.wordsRead} words in 60 seconds
              </p>
            </div>
            {loading ? (
              <p className="text-sm text-center text-muted-foreground">Saving result...</p>
            ) : (
              <p className="text-sm text-center text-green-600">Result saved!</p>
            )}
            <Button onClick={handleReset} className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


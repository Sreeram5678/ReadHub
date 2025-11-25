"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gauge } from "lucide-react"
import { calculateWordsPerMinute } from "@/lib/reading-speed"

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Reading is a journey that takes us to places we've never been. Books are windows to different worlds, allowing us to explore new ideas and perspectives. Every page turned is a step forward in understanding ourselves and the world around us. The power of words can inspire, educate, and transform our thinking. Through reading, we connect with authors across time and space, sharing their wisdom and experiences. Literature has the remarkable ability to transport us to distant lands, introduce us to fascinating characters, and challenge our preconceived notions. When we immerse ourselves in a good book, time seems to stand still, and we become part of the story unfolding before our eyes. The act of reading exercises our imagination, expands our vocabulary, and enhances our understanding of complex ideas. Whether we're reading fiction or non-fiction, each book offers a unique opportunity to learn something new and see the world from a different perspective.`

export function ReadingSpeedTest() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [result, setResult] = useState<{ wpm: number; wordsRead: number; duration: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  
  const totalWords = SAMPLE_TEXT.split(/\s+/).filter(word => word.length > 0).length

  const handleFinish = useCallback(async (autoFinish: boolean = false, elapsedTime?: number) => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!startTimeRef.current) return

    const duration = autoFinish ? 60 : (elapsedTime || timeElapsed || 1)
    const wpm = calculateWordsPerMinute(totalWords, duration)
    setResult({ wpm, wordsRead: totalWords, duration })

    // Save to database
    setLoading(true)
    try {
      await fetch("/api/reading-speed-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordsPerMinute: wpm,
          wordsRead: totalWords,
          duration: duration,
        }),
      })
    } catch (error) {
      console.error("Failed to save test result:", error)
    } finally {
      setLoading(false)
    }
  }, [totalWords, timeElapsed])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000)
          setTimeElapsed(elapsed)
          
          // Auto-finish at 60 seconds
          if (elapsed >= 60) {
            handleFinish(true, 60)
          }
        }
      }, 100)
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
  }, [isRunning, handleFinish])

  const handleStart = () => {
    setTimeElapsed(0)
    setResult(null)
    setIsRunning(true)
    startTimeRef.current = new Date()
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeElapsed(0)
    setResult(null)
    startTimeRef.current = null
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
                <li>Read the text below at your normal reading pace</li>
                <li>Click "I Finished Reading" when you're done</li>
                <li>You have up to 60 seconds (test auto-completes at 60s)</li>
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
              <div className="text-3xl font-bold text-primary">
                {Math.max(0, 60 - timeElapsed)}s
              </div>
              <p className="text-sm text-muted-foreground">Time remaining</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50 max-h-[300px] overflow-y-auto">
              <p className="text-sm leading-relaxed">{SAMPLE_TEXT}</p>
            </div>
            <Button onClick={() => handleFinish(false)} className="w-full" size="lg">
              I Finished Reading
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="text-center p-6 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Your Reading Speed</p>
              <p className="text-4xl font-bold text-primary">{result.wpm} WPM</p>
              <p className="text-sm text-muted-foreground mt-2">
                {result.wordsRead} words in {result.duration} second{result.duration !== 1 ? 's' : ''}
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


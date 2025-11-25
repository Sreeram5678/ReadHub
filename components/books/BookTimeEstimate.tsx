"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { estimateTimeToFinish, formatTimeEstimate } from "@/lib/reading-speed"

interface BookTimeEstimateProps {
  remainingPages: number
}

export function BookTimeEstimate({ remainingPages }: BookTimeEstimateProps) {
  const [averagePagesPerHour, setAveragePagesPerHour] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAverageSpeed()
  }, [])

  const fetchAverageSpeed = async () => {
    try {
      const response = await fetch("/api/reading-speed/average")
      if (response.ok) {
        const data = await response.json()
        setAveragePagesPerHour(data.averagePagesPerHour)
      }
    } catch (error) {
      console.error("Failed to fetch average speed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || averagePagesPerHour === null || remainingPages <= 0) {
    return null
  }

  const hoursLeft = estimateTimeToFinish(remainingPages, averagePagesPerHour)
  const timeEstimate = formatTimeEstimate(hoursLeft)

  if (timeEstimate === "Unknown") {
    return null
  }

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
      <Clock className="h-3 w-3" />
      <span>Time left: {timeEstimate}</span>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button as QuickButton } from "@/components/ui/button"

interface QuickLogButtonProps {
  bookId: string
  bookTitle: string
  currentPage?: number
  onLogAdded: () => void
}

export function QuickLogButton({ bookId, bookTitle, currentPage = 0, onLogAdded }: QuickLogButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [startPage, setStartPage] = useState("")
  const [endPage, setEndPage] = useState("")
  const [userTimezone, setUserTimezone] = useState<string>("Asia/Kolkata")

  // Fetch user timezone on mount
  useEffect(() => {
    fetch("/api/profile/timezone")
      .then((res) => res.json())
      .then((data) => {
        if (data.timezone) {
          setUserTimezone(data.timezone)
        }
      })
      .catch(() => {})
  }, [])

  // Pre-fill start page when dialog opens
  useEffect(() => {
    if (open && currentPage > 0 && !startPage) {
      setStartPage((currentPage + 1).toString())
    }
  }, [open, currentPage, startPage])

  const calculatePagesRead = (start: number, end: number): number => {
    if (start <= 0 || end <= 0 || end < start) return 0
    return end - start + 1
  }

  const quickLog = async (presetStart?: number, presetEnd?: number) => {
    const start = presetStart || parseInt(startPage)
    const end = presetEnd || parseInt(endPage)
    
    if (!start || !end || start <= 0 || end <= 0) {
      alert("Please enter valid start and end page numbers")
      return
    }

    if (end < start) {
      alert("End page must be greater than or equal to start page")
      return
    }

    const pagesToSubmit = calculatePagesRead(start, end)

    setLoading(true)
    try {
      const response = await fetch("/api/reading-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          pagesRead: pagesToSubmit,
          startPage: start.toString(),
          endPage: end.toString(),
          date: new Date().toLocaleDateString("en-CA", { timeZone: userTimezone }),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to log reading")
      }

      setOpen(false)
      setStartPage("")
      setEndPage("")
      onLogAdded()
    } catch (error) {
      console.error("Error logging reading:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to log reading. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const pagesRead = startPage && endPage 
    ? calculatePagesRead(parseInt(startPage) || 0, parseInt(endPage) || 0)
    : 0

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Log Reading
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Reading</DialogTitle>
            <DialogDescription>
              Log pages read for "{bookTitle}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startPage">Start Page</Label>
                <Input
                  id="startPage"
                  type="number"
                  value={startPage}
                  onChange={(e) => setStartPage(e.target.value)}
                  placeholder="e.g., 10"
                  min="1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && endPage) {
                      quickLog()
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endPage">End Page</Label>
                <Input
                  id="endPage"
                  type="number"
                  value={endPage}
                  onChange={(e) => setEndPage(e.target.value)}
                  placeholder="e.g., 25"
                  min="1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && startPage) {
                      quickLog()
                    }
                  }}
                />
              </div>
            </div>
            {pagesRead > 0 && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                Pages read: <span className="font-semibold text-foreground">{pagesRead}</span> pages
              </div>
            )}
            {startPage && endPage && parseInt(endPage) < parseInt(startPage) && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                End page must be greater than or equal to start page
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <QuickButton
                variant="outline"
                onClick={() => {
                  const start = parseInt(startPage) || 1
                  quickLog(start, start + 4)
                }}
                disabled={loading || !startPage}
              >
                5 pages
              </QuickButton>
              <QuickButton
                variant="outline"
                onClick={() => {
                  const start = parseInt(startPage) || 1
                  quickLog(start, start + 9)
                }}
                disabled={loading || !startPage}
              >
                10 pages
              </QuickButton>
              <QuickButton
                variant="outline"
                onClick={() => {
                  const start = parseInt(startPage) || 1
                  quickLog(start, start + 19)
                }}
                disabled={loading || !startPage}
              >
                20 pages
              </QuickButton>
              <QuickButton
                variant="outline"
                onClick={() => {
                  const start = parseInt(startPage) || 1
                  quickLog(start, start + 49)
                }}
                disabled={loading || !startPage}
              >
                50 pages
              </QuickButton>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => quickLog()}
                disabled={loading || !startPage || !endPage || parseInt(endPage) < parseInt(startPage)}
                className="flex-1"
              >
                {loading ? "Logging..." : "Log Reading"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  setStartPage("")
                  setEndPage("")
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
            {currentPage > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Current page: {currentPage} | Suggested start: {currentPage + 1}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


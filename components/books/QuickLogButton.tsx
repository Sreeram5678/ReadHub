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
  onLogAdded: () => void
}

export function QuickLogButton({ bookId, bookTitle, onLogAdded }: QuickLogButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pages, setPages] = useState("")
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

  const quickLog = async (pagesToLog?: number) => {
    const pagesToSubmit = pagesToLog || parseInt(pages)
    if (!pagesToSubmit || pagesToSubmit <= 0) {
      alert("Please enter a valid number of pages")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/reading-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          pagesRead: pagesToSubmit,
          date: new Date().toLocaleDateString("en-CA", { timeZone: userTimezone }),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to log reading")
      }

      setOpen(false)
      setPages("")
      onLogAdded()
    } catch (error) {
      console.error("Error logging reading:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to log reading. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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
            <div className="space-y-2">
              <Label htmlFor="pages">Pages Read</Label>
              <Input
                id="pages"
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="Enter pages read"
                min="1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    quickLog()
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((pageCount) => (
                <QuickButton
                  key={pageCount}
                  variant="outline"
                  onClick={() => quickLog(pageCount)}
                  disabled={loading}
                >
                  {pageCount}
                </QuickButton>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => quickLog()}
                disabled={loading || !pages}
                className="flex-1"
              >
                {loading ? "Logging..." : "Log Reading"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


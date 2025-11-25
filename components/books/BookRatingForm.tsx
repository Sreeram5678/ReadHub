"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star } from "lucide-react"

interface Rating {
  id?: string
  overallRating?: number | null
  plotRating?: number | null
  characterRating?: number | null
  writingRating?: number | null
  pacingRating?: number | null
  review?: string | null
}

interface BookRatingFormProps {
  bookId: string
  onRatingSaved?: () => void
}

export function BookRatingForm({ bookId, onRatingSaved }: BookRatingFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState<Rating>({})
  const [existingRating, setExistingRating] = useState<Rating | null>(null)

  useEffect(() => {
    if (open && bookId) {
      fetchRating()
    }
  }, [open, bookId])

  const fetchRating = async () => {
    try {
      const response = await fetch(`/api/ratings?bookId=${bookId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setExistingRating(data[0])
          setRating(data[0])
        }
      }
    } catch (error) {
      console.error("Error fetching rating:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          ...rating,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save rating")
      }

      setOpen(false)
      if (onRatingSaved) {
        onRatingSaved()
      }
    } catch (error) {
      console.error("Error saving rating:", error)
      alert("Failed to save rating. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: number | null | undefined
    onChange: (value: number) => void
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-5 w-5 ${
                value && star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Rate Book</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate This Book</DialogTitle>
          <DialogDescription>
            Provide a detailed rating across different aspects
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <StarRating
            label="Overall Rating"
            value={rating.overallRating}
            onChange={(value) => setRating({ ...rating, overallRating: value })}
          />
          <StarRating
            label="Plot"
            value={rating.plotRating}
            onChange={(value) => setRating({ ...rating, plotRating: value })}
          />
          <StarRating
            label="Characters"
            value={rating.characterRating}
            onChange={(value) => setRating({ ...rating, characterRating: value })}
          />
          <StarRating
            label="Writing Style"
            value={rating.writingRating}
            onChange={(value) => setRating({ ...rating, writingRating: value })}
          />
          <StarRating
            label="Pacing"
            value={rating.pacingRating}
            onChange={(value) => setRating({ ...rating, pacingRating: value })}
          />
          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              value={rating.review || ""}
              onChange={(e) => setRating({ ...rating, review: e.target.value })}
              placeholder="Write your thoughts about this book..."
              rows={5}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : existingRating ? "Update Rating" : "Save Rating"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


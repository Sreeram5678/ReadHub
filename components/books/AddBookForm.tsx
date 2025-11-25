"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function AddBookForm({ onBookAdded }: { onBookAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    totalPages: "",
    initialPages: "",
    status: "reading",
    seriesName: "",
    seriesNumber: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to add book")
      }

      setFormData({ title: "", author: "", totalPages: "", initialPages: "", status: "reading", seriesName: "", seriesNumber: "" })
      setOpen(false)
      onBookAdded()
    } catch (error) {
      console.error("Error adding book:", error)
      alert("Failed to add book. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Book</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Book</DialogTitle>
          <DialogDescription>
            Add a book to track your reading progress
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalPages">Total Pages</Label>
            <Input
              id="totalPages"
              type="number"
              value={formData.totalPages}
              onChange={(e) =>
                setFormData({ ...formData, totalPages: e.target.value })
              }
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialPages">Initial Pages (Optional)</Label>
            <Input
              id="initialPages"
              type="number"
              value={formData.initialPages}
              onChange={(e) =>
                setFormData({ ...formData, initialPages: e.target.value })
              }
              min="0"
              placeholder="Pages already read before tracking"
            />
            <p className="text-xs text-muted-foreground">
              If you've already started reading this book, enter the number of pages you've completed.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reading">Currently Reading</SelectItem>
                <SelectItem value="tbr">To Be Read (TBR)</SelectItem>
                <SelectItem value="dnf">Did Not Finish (DNF)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Add to your reading list or TBR shelf
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seriesName">Series Name (Optional)</Label>
              <Input
                id="seriesName"
                value={formData.seriesName}
                onChange={(e) =>
                  setFormData({ ...formData, seriesName: e.target.value })
                }
                placeholder="e.g., Harry Potter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seriesNumber">Book Number (Optional)</Label>
              <Input
                id="seriesNumber"
                type="number"
                value={formData.seriesNumber}
                onChange={(e) =>
                  setFormData({ ...formData, seriesNumber: e.target.value })
                }
                placeholder="e.g., 1, 2, 3"
                min="1"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Book"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


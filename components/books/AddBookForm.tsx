"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

      setFormData({ title: "", author: "", totalPages: "" })
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Book"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


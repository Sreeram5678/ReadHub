"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
} from "@/components/ui/dialog"
import { MapPin, Calendar, Image as ImageIcon } from "lucide-react"

interface BookMemory {
  id?: string
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  memoryNote?: string | null
  lifeEvent?: string | null
  memoryDate?: string | null
  photoUrl?: string | null
}

interface BookMemoryFormProps {
  bookId: string
  bookTitle: string
  memory?: BookMemory | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMemorySaved: () => void
}

export function BookMemoryForm({
  bookId,
  bookTitle,
  memory,
  open,
  onOpenChange,
  onMemorySaved,
}: BookMemoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BookMemory>({
    location: "",
    latitude: null,
    longitude: null,
    memoryNote: "",
    lifeEvent: "",
    memoryDate: "",
    photoUrl: "",
  })

  useEffect(() => {
    if (memory) {
      setFormData({
        location: memory.location || "",
        latitude: memory.latitude || null,
        longitude: memory.longitude || null,
        memoryNote: memory.memoryNote || "",
        lifeEvent: memory.lifeEvent || "",
        memoryDate: memory.memoryDate
          ? new Date(memory.memoryDate).toISOString().split("T")[0]
          : "",
        photoUrl: memory.photoUrl || "",
      })
    } else {
      setFormData({
        location: "",
        latitude: null,
        longitude: null,
        memoryNote: "",
        lifeEvent: "",
        memoryDate: new Date().toISOString().split("T")[0],
        photoUrl: "",
      })
    }
  }, [memory, open])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Could not get your location. You can enter it manually.")
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = memory?.id
        ? `/api/book-memories/${memory.id}`
        : "/api/book-memories"
      const method = memory?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save memory")
      }

      onOpenChange(false)
      onMemorySaved()
    } catch (error) {
      console.error("Error saving memory:", error)
      alert("Failed to save memory. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {memory?.id ? "Edit Memory" : "Add Memory to Reading Palace"}
          </DialogTitle>
          <DialogDescription>
            Associate "{bookTitle}" with a place, time, or life event
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Coffee shop downtown, Home library, Beach"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                className="shrink-0"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use My Location
              </Button>
            </div>
            {(formData.latitude && formData.longitude) && (
              <p className="text-xs text-muted-foreground">
                Coordinates: {formData.latitude.toFixed(6)},{" "}
                {formData.longitude.toFixed(6)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="memoryDate">
              <Calendar className="h-4 w-4 inline mr-2" />
              When did you read this?
            </Label>
            <Input
              id="memoryDate"
              type="date"
              value={formData.memoryDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, memoryDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lifeEvent">Life Event (Optional)</Label>
            <Select
              value={formData.lifeEvent || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, lifeEvent: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select or leave blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="graduation">Graduation</SelectItem>
                <SelectItem value="moving">Moving</SelectItem>
                <SelectItem value="new-job">New Job</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="milestone">Life Milestone</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memoryNote">Memory Note</Label>
            <Textarea
              id="memoryNote"
              value={formData.memoryNote || ""}
              onChange={(e) =>
                setFormData({ ...formData, memoryNote: e.target.value })
              }
              placeholder="What do you remember about reading this book? What was happening in your life?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">
              <ImageIcon className="h-4 w-4 inline mr-2" />
              Photo URL (Optional)
            </Label>
            <Input
              id="photoUrl"
              type="url"
              value={formData.photoUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, photoUrl: e.target.value })
              }
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-muted-foreground">
              You can upload photos to a service like Imgur and paste the URL here
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "Saving..."
                : memory?.id
                ? "Update Memory"
                : "Add Memory"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


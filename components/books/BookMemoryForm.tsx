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
import { MapPin, Calendar, Image as ImageIcon, Search, Loader2 } from "lucide-react"
import { PhotoUpload } from "@/components/memory-palace/PhotoUpload"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<{
    display_name: string
    lat: string
    lon: string
  }>>([])
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
    // Reset search state when dialog opens/closes
    if (!open) {
      setSearchQuery("")
      setSearchResults([])
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
        alert("Could not get your location. You can search for a location instead.")
      }
    )
  }

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a location to search")
      return
    }

    setSearching(true)
    try {
      // Use OpenStreetMap Nominatim API (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            "User-Agent": "ReadHub App" // Required by Nominatim
          }
        }
      )

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setSearchResults(data)
      
      if (data.length === 0) {
        alert("No locations found. Try a different search term.")
      }
    } catch (error) {
      console.error("Error searching location:", error)
      alert("Failed to search location. Please try again.")
    } finally {
      setSearching(false)
    }
  }

  const handleSelectLocation = (result: { display_name: string; lat: string; lon: string }) => {
    setFormData({
      ...formData,
      location: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    })
    setSearchQuery("")
    setSearchResults([])
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
          lifeEvent: formData.lifeEvent || null,
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
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., Coffee shop downtown, Home library, Beach"
            />
            
            {/* Location Search */}
            <div className="space-y-2">
              <Label htmlFor="searchLocation" className="text-sm text-muted-foreground">
                Search for location (to get coordinates for map)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="searchLocation"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSearchLocation()
                    }
                  }}
                  placeholder="e.g., Mumbai, India or Central Park, New York"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearchLocation}
                  disabled={searching || !searchQuery.trim()}
                  className="shrink-0"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  className="shrink-0"
                  title="Use your current location"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Current
                </Button>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectLocation(result)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                    >
                      <p className="font-medium">{result.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Coordinate Input (Optional) */}
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Or enter coordinates manually
              </summary>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude?.toString() || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 19.0760"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude?.toString() || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 72.8777"
                  />
                </div>
              </div>
            </details>

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
              value={formData.lifeEvent || "none"}
              onValueChange={(value) =>
                setFormData({ ...formData, lifeEvent: value === "none" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select or leave blank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
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
            <Label>
              <ImageIcon className="h-4 w-4 inline mr-2" />
              Photo (Optional)
            </Label>
            <PhotoUpload
              value={formData.photoUrl || ""}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              disabled={loading}
            />
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


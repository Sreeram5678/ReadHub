"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

interface BookMemory {
  id: string
  location: string | null
  latitude: number | null
  longitude: number | null
  memoryNote: string | null
  lifeEvent: string | null
  memoryDate: string | null
  photoUrl: string | null
  book: {
    id: string
    title: string
    author: string
  }
}

interface MemoryMapProps {
  memories: BookMemory[]
}

export function MemoryMap({ memories }: MemoryMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Fix for default marker icons in Next.js
    import("leaflet").then((leaflet) => {
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })
    })
  }, [])

  if (!isClient || memories.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {memories.length === 0
              ? "No locations to display"
              : "Loading map..."}
          </p>
        </div>
      </div>
    )
  }

  // Calculate center point
  const avgLat =
    memories.reduce((sum, m) => sum + (m.latitude || 0), 0) / memories.length
  const avgLng =
    memories.reduce((sum, m) => sum + (m.longitude || 0), 0) / memories.length

  return (
    <MapContainer
      center={[avgLat, avgLng]}
      zoom={memories.length === 1 ? 13 : 10}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {memories.map((memory) => {
        if (!memory.latitude || !memory.longitude) return null
        return (
          <Marker key={memory.id} position={[memory.latitude, memory.longitude]}>
            <Popup>
              <div className="text-sm min-w-[200px]">
                <p className="font-semibold mb-1">{memory.book.title}</p>
                <p className="text-muted-foreground text-xs mb-2">
                  by {memory.book.author}
                </p>
                {memory.location && (
                  <p className="text-xs mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {memory.location}
                  </p>
                )}
                {memory.memoryDate && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(memory.memoryDate).toLocaleDateString()}
                  </p>
                )}
                {memory.memoryNote && (
                  <p className="text-xs mt-2 pt-2 border-t whitespace-pre-wrap">
                    {memory.memoryNote}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}


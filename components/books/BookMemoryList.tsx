"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, MapPin, Calendar, Image as ImageIcon } from "lucide-react"
import { BookMemoryForm } from "./BookMemoryForm"

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
  createdAt: string
}

interface BookMemoryListProps {
  bookId: string
  bookTitle: string
}

export function BookMemoryList({ bookId, bookTitle }: BookMemoryListProps) {
  const [memories, setMemories] = useState<BookMemory[]>([])
  const [open, setOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<BookMemory | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMemories()
  }, [bookId])

  const fetchMemories = async () => {
    try {
      const response = await fetch(`/api/book-memories?bookId=${bookId}`)
      if (response.ok) {
        const data = await response.json()
        setMemories(data)
      }
    } catch (error) {
      console.error("Error fetching memories:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this memory?")) {
      return
    }

    try {
      const response = await fetch(`/api/book-memories/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete memory")
      }

      fetchMemories()
    } catch (error) {
      console.error("Error deleting memory:", error)
      alert("Failed to delete memory. Please try again.")
    }
  }

  const handleEdit = (memory: BookMemory) => {
    setEditingMemory(memory)
    setOpen(true)
  }

  const handleAdd = () => {
    setEditingMemory(null)
    setOpen(true)
  }

  const getLifeEventLabel = (event: string | null) => {
    const labels: Record<string, string> = {
      vacation: "Vacation",
      graduation: "Graduation",
      moving: "Moving",
      "new-job": "New Job",
      travel: "Travel",
      holiday: "Holiday",
      milestone: "Life Milestone",
      other: "Other",
    }
    return event ? labels[event] || event : null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reading Memories</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Memory
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {memories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No memories yet. Add a memory to associate this book with a place, time, or life event.
          </p>
        ) : (
          <div className="space-y-4">
            {memories.map((memory) => (
              <div key={memory.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {memory.location && (
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{memory.location}</span>
                      </div>
                    )}
                    {memory.memoryDate && (
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(memory.memoryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {memory.lifeEvent && (
                      <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full mb-2">
                        {getLifeEventLabel(memory.lifeEvent)}
                      </span>
                    )}
                    {memory.memoryNote && (
                      <p className="text-sm mt-2 whitespace-pre-wrap">
                        {memory.memoryNote}
                      </p>
                    )}
                    {memory.photoUrl && (
                      <div className="mt-3">
                        <img
                          src={memory.photoUrl}
                          alt="Memory"
                          className="rounded-lg max-w-full h-auto max-h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(memory)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(memory.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <BookMemoryForm
        bookId={bookId}
        bookTitle={bookTitle}
        memory={editingMemory}
        open={open}
        onOpenChange={setOpen}
        onMemorySaved={fetchMemories}
      />
    </Card>
  )
}


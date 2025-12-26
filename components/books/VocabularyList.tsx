"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface VocabularyWord {
  id: string
  word: string
  definition: string | null
  pageNumber: number | null
  context: string | null
  createdAt: string
}

interface VocabularyListProps {
  bookId: string
}

export function VocabularyList({ bookId }: VocabularyListProps) {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [open, setOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    word: "",
    definition: "",
    pageNumber: "",
    context: "",
  })

  useEffect(() => {
    fetchWords()
  }, [bookId])

  const fetchWords = async () => {
    try {
      const response = await fetch(`/api/vocabulary?bookId=${bookId}`)
      if (response.ok) {
        const data = await response.json()
        setWords(data)
      }
    } catch (error) {
      console.error("Error fetching vocabulary:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingWord
        ? `/api/vocabulary/${editingWord.id}`
        : "/api/vocabulary"
      const method = editingWord ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save vocabulary word")
      }

      setOpen(false)
      setEditingWord(null)
      setFormData({ word: "", definition: "", pageNumber: "", context: "" })
      fetchWords()
    } catch (error) {
      console.error("Error saving vocabulary word:", error)
      alert("Failed to save vocabulary word. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this word?")) {
      return
    }

    try {
      const response = await fetch(`/api/vocabulary/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete vocabulary word")
      }

      fetchWords()
    } catch (error) {
      console.error("Error deleting vocabulary word:", error)
      alert("Failed to delete vocabulary word. Please try again.")
    }
  }

  const handleEdit = (word: VocabularyWord) => {
    setEditingWord(word)
    setFormData({
      word: word.word,
      definition: word.definition || "",
      pageNumber: word.pageNumber?.toString() || "",
      context: word.context || "",
    })
    setOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vocabulary</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingWord(null)
              setFormData({ word: "", definition: "", pageNumber: "", context: "" })
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Word
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {words.length === 0 ? (
          <p className="text-sm text-muted-foreground">No vocabulary words yet.</p>
        ) : (
          <div className="space-y-4">
            {words.map((vocab) => (
              <div key={vocab.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{vocab.word}</h4>
                      {vocab.pageNumber && (
                        <span className="text-xs text-muted-foreground">
                          (Page {vocab.pageNumber})
                        </span>
                      )}
                    </div>
                    {vocab.definition && (
                      <p className="text-sm text-muted-foreground mt-1">{vocab.definition}</p>
                    )}
                    {vocab.context && (
                      <p className="text-xs italic text-muted-foreground mt-1">
                        "{vocab.context}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(vocab)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(vocab.id)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWord ? "Edit Vocabulary Word" : "Add Vocabulary Word"}
            </DialogTitle>
            <DialogDescription>
              Add words you learned while reading this book
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word">Word</Label>
              <Input
                id="word"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                placeholder="Enter word"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="definition">Definition (Optional)</Label>
              <Textarea
                id="definition"
                value={formData.definition}
                onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                placeholder="Enter definition"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pageNumber">Page Number (Optional)</Label>
                <Input
                  id="pageNumber"
                  type="number"
                  value={formData.pageNumber}
                  onChange={(e) => setFormData({ ...formData, pageNumber: e.target.value })}
                  placeholder="Page number"
                  min="1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="context">Context (Optional)</Label>
              <Textarea
                id="context"
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="Sentence where you found this word"
                rows={2}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : editingWord ? "Update Word" : "Add Word"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


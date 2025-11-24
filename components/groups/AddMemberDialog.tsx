"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

type UserResult = {
  id: string
  name: string | null
  email: string
  image?: string | null
}

interface AddMemberDialogProps {
  groupId: string
  existingMemberIds: string[]
  currentUserRole: string | null
}

export function AddMemberDialog({ groupId, existingMemberIds, currentUserRole }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("member")
  const [results, setResults] = useState<UserResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [addLoadingId, setAddLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (currentUserRole !== "admin" && role !== "member") {
      setRole("member")
    }
  }, [currentUserRole, role])

  useEffect(() => {
    if (!open) {
      return
    }

    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })

        if (response.ok) {
          const data = await response.json()
          setResults(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Failed to search users:", err)
        }
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [open, query])

  const availableResults = useMemo(
    () => results.filter((user) => !existingMemberIds.includes(user.id)),
    [results, existingMemberIds]
  )

  const handleAdd = async (userId: string) => {
    try {
      setAddLoadingId(userId)
      setError(null)
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to add member")
      }

      setQuery("")
      setResults([])
      router.refresh()
    } catch (err: any) {
      console.error("Failed to add member:", err)
      setError(err.message || "Failed to add member")
    } finally {
      setAddLoadingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add members to this group</DialogTitle>
          <DialogDescription>
            Search for users and add them directly to the group. Members are added immediately without needing approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Search users</label>
            <Input
              placeholder="Type a name or email (min 2 characters)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Assign role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                {currentUserRole === "admin" && (
                  <>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {query.length < 2 ? "Start typing to search for users" : searchLoading ? "Searching..." : null}
            </p>
            <div className="max-h-64 overflow-y-auto rounded-md border">
              {query.length < 2 ? (
                <div className="p-4 text-sm text-muted-foreground">Enter at least 2 characters to search.</div>
              ) : availableResults.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  {searchLoading ? "Searching..." : "No users found or they are already members."}
                </div>
              ) : (
                <ul className="divide-y">
                  {availableResults.map((user) => (
                    <li key={user.id} className="flex items-center justify-between gap-4 p-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img src={user.image} alt={user.name || user.email} className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {(user.name || user.email)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="font-medium">{user.name || user.email}</p>
                          <p className="text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAdd(user.id)}
                        disabled={addLoadingId === user.id}
                      >
                        {addLoadingId === user.id ? "Adding..." : "Add"}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



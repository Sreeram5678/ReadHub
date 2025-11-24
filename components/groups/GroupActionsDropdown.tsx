"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { EllipsisVertical } from "lucide-react"

interface GroupActionsDropdownProps {
  groupId: string
  groupName: string
  groupDescription?: string
  isPublic: boolean
  topic?: string
  image?: string
}

export function GroupActionsDropdown({
  groupId,
  groupName,
  groupDescription,
  isPublic,
  topic,
  image,
}: GroupActionsDropdownProps) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete group")
      }

      if (typeof window !== "undefined") {
        window.alert("Group deleted")
      }
      router.push("/groups")
      router.refresh()
    } catch (error: any) {
      console.error("Failed to delete group:", error)
      if (typeof window !== "undefined") {
        window.alert(error.message || "Failed to delete group")
      }
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  const handleVisibilityToggle = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublic: !isPublic,
          name: groupName,
          description: groupDescription,
          topic: topic,
          image: image,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update group")
      }

      if (typeof window !== "undefined") {
        window.alert(`Group is now ${!isPublic ? "public" : "private"}`)
      }
      router.refresh()
    } catch (error: any) {
      console.error("Failed to update visibility:", error)
      if (typeof window !== "undefined") {
        window.alert(error.message || "Failed to update group visibility")
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <EllipsisVertical className="h-5 w-5" />
            <span className="sr-only">Group actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.refresh()}>
            Refresh group
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleVisibilityToggle}>
            Make {isPublic ? "Private" : "Public"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(event) => {
              event.preventDefault()
              setConfirmOpen(true)
            }}
          >
            Delete group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{groupName}”?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All messages and members will be removed permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



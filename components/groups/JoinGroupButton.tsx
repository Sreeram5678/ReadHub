"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface JoinGroupButtonProps {
  groupId: string
}

export function JoinGroupButton({ groupId }: JoinGroupButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleJoin = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error joining group:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleJoin} disabled={loading}>
      {loading ? "Joining..." : "Join Group"}
    </Button>
  )
}


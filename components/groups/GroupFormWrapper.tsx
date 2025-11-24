"use client"

import { useRouter } from "next/navigation"
import { GroupForm } from "@/components/groups/GroupForm"

interface GroupFormWrapperProps {
  group: {
    id: string
    name: string
    description?: string
    isPublic: boolean
    topic?: string
    image?: string
  }
  groupId: string
}

export function GroupFormWrapper({ group, groupId }: GroupFormWrapperProps) {
  const router = useRouter()

  return (
    <GroupForm
      group={group}
      onSuccess={() => {
        router.refresh()
      }}
    />
  )
}


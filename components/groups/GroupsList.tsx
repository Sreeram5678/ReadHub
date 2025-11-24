"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Lock, Globe, MessageSquare, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { GroupForm } from "./GroupForm"

interface Group {
  id: string
  name: string
  description?: string
  isPublic: boolean
  topic?: string
  image?: string
  creator: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  isMember: boolean
  userRole?: string | null
  _count: {
    messages: number
    members: number
  }
}

export function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [topic, setTopic] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchGroups()
  }, [filter, topic])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      let url = "/api/groups?"
      if (filter === "public") {
        url += "isPublic=true"
      } else if (filter === "private") {
        url += "isPublic=false"
      }
      // For "my" filter, we'll filter client-side after fetching
      if (topic) {
        url += `&topic=${encodeURIComponent(topic)}`
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setGroups(Array.isArray(data) ? data : [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Failed to fetch groups:", response.status, response.statusText, errorData)
        setGroups([])
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchGroups()
  }

  const handleJoin = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
      })
      if (response.ok) {
        fetchGroups()
      }
    } catch (error) {
      console.error("Error joining group:", error)
    }
  }

  const handleLeave = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchGroups()
      }
    } catch (error) {
      console.error("Error leaving group:", error)
    }
  }

  const filteredGroups = groups.filter((group) => {
    // Filter by "my groups" if selected
    if (filter === "my") {
      if (!group.isMember) {
        return false
      }
    }
    
    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        group.name.toLowerCase().includes(searchLower) ||
        group.description?.toLowerCase().includes(searchLower) ||
        group.topic?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground mt-1">Join groups to discuss books and connect with readers</p>
        </div>
        <GroupForm onSuccess={() => {
          setIsCreateOpen(false)
          fetchGroups()
        }} />
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            <SelectItem value="my">My Groups</SelectItem>
            <SelectItem value="public">Public Only</SelectItem>
            <SelectItem value="private">Private Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Topics</SelectItem>
            <SelectItem value="fiction">Fiction</SelectItem>
            <SelectItem value="non-fiction">Non-Fiction</SelectItem>
            <SelectItem value="mystery">Mystery</SelectItem>
            <SelectItem value="sci-fi">Sci-Fi</SelectItem>
            <SelectItem value="fantasy">Fantasy</SelectItem>
            <SelectItem value="romance">Romance</SelectItem>
            <SelectItem value="biography">Biography</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading groups...</div>
      ) : filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No groups found. Create one to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {group.isPublic ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      {group.name}
                    </CardTitle>
                    {group.topic && (
                      <span className="text-xs text-muted-foreground mt-1 inline-block px-2 py-1 bg-muted rounded">
                        {group.topic}
                      </span>
                    )}
                  </div>
                </div>
                {group.description && (
                  <CardDescription className="mt-2">{group.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group._count.members} members
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {group._count.messages} messages
                  </div>
                </div>
                <div className="flex gap-2">
                  {group.isMember ? (
                    <>
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => router.push(`/groups/${group.id}`)}
                      >
                        Open Chat
                      </Button>
                      {(group.userRole === "admin" || group.userRole === "moderator") && (
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/groups/${group.id}`)}
                        >
                          Manage
                        </Button>
                      )}
                      {group.userRole !== "admin" && (
                        <Button
                          variant="ghost"
                          onClick={() => handleLeave(group.id)}
                        >
                          Leave
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleJoin(group.id)}
                    >
                      Join Group
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


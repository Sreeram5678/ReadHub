"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserPlus, Check, X, Search, Users } from "lucide-react"

interface Friend {
  id: string
  name: string
  email: string
  image?: string | null
  friendshipId: string
  status?: string
}

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Friend[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends")
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends || [])
        setPendingRequests(data.pendingRequests || [])
      }
    } catch (error) {
      console.error("Failed to fetch friends:", error)
    }
  }

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      }
    } catch (error) {
      console.error("Failed to search users:", error)
    }
  }

  const handleFriendAction = async (friendId: string, action: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, action }),
      })

      if (response.ok) {
        await fetchFriends()
        if (action === "send") {
          setIsSearchOpen(false)
          setSearchQuery("")
        }
      }
    } catch (error) {
      console.error("Failed to process friend action:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Friends</h2>
          <p className="text-muted-foreground">Connect with other readers</p>
        </div>
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find Friends</DialogTitle>
              <DialogDescription>Search for users by name or email</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.length === 0 && searchQuery.length >= 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                )}
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {user.image && (
                        <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {user.status === "none" && (
                      <Button
                        size="sm"
                        onClick={() => handleFriendAction(user.id, "send")}
                        disabled={loading}
                      >
                        Add
                      </Button>
                    )}
                    {user.status === "pending" && user.friendshipId && (
                      <span className="text-xs text-muted-foreground">Request sent</span>
                    )}
                    {user.status === "accepted" && (
                      <span className="text-xs text-muted-foreground">Already friends</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Friend requests waiting for your response</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {request.image && (
                    <img src={request.image} alt={request.name} className="h-10 w-10 rounded-full" />
                  )}
                  <div>
                    <p className="font-medium">{request.name}</p>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleFriendAction(request.id, "accept")}
                    disabled={loading}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFriendAction(request.id, "reject")}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Friends ({friends.length})
          </CardTitle>
          <CardDescription>People you're connected with</CardDescription>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No friends yet. Start by adding some friends!
            </p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {friend.image && (
                      <img src={friend.image} alt={friend.name} className="h-10 w-10 rounded-full" />
                    )}
                    <div>
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">{friend.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFriendAction(friend.id, "remove")}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


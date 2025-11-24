"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LeaderboardTable } from "./LeaderboardTable"
import { PeriodSelector } from "./PeriodSelector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Search, UserPlus, Check, X } from "lucide-react"

interface LeaderboardEntry {
  id: string
  name: string
  email: string
  image?: string | null
  totalPages: number
  bookCount: number
  rank: number
}

export function LeaderboardPageClient({
  initialLeaderboard,
  currentUserId,
  initialPeriod,
}: {
  initialLeaderboard: LeaderboardEntry[]
  currentUserId: string
  initialPeriod: string
}) {
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard)
  const [period, setPeriod] = useState(initialPeriod)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{
    id: string
    name: string
    email: string
    image?: string | null
    status: string
    friendshipId?: string
  }>>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/leaderboard?period=${period}`)
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [period])

  const currentUserRank =
    leaderboard.findIndex((user) => user.id === currentUserId) + 1

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      }
    } catch (error) {
      console.error("Failed to search users:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleFriendAction = async (friendId: string, action: string) => {
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, action }),
      })

      if (response.ok) {
        await fetch(`/api/leaderboard?period=${period}`)
          .then((res) => res.json())
          .then((data) => {
            setLeaderboard(data)
          })
        if (action === "send") {
          setIsSearchOpen(false)
          setSearchQuery("")
        }
      }
    } catch (error) {
      console.error("Failed to process friend action:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank among your friends
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <Button variant="outline" onClick={() => setIsSearchOpen(true)}>
              <Search className="mr-2 h-4 w-4" />
              Find Friends
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Find Friends</DialogTitle>
                <DialogDescription>Search for users to add as friends</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    className="pl-8"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchLoading && (
                    <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>
                  )}
                  {!searchLoading && searchResults.length === 0 && searchQuery.length >= 2 && (
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
                        >
                          <UserPlus className="mr-1 h-3 w-3" />
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
          <PeriodSelector
            currentPeriod={period}
            onPeriodChange={setPeriod}
          />
        </div>
      </div>

      {currentUserRank > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Rank</CardTitle>
            <CardDescription>Your position on the leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">#{currentUserRank}</div>
            <p className="text-muted-foreground mt-2">
              {leaderboard[currentUserRank - 1]?.totalPages || 0} pages read
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Friends Leaderboard</CardTitle>
          <CardDescription>
            Rankings based on {period === "all-time" ? "all-time" : period}{" "}
            pages read among your friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading...
            </p>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No friends on the leaderboard yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Add friends to see how you compare!
              </p>
            </div>
          ) : (
            <LeaderboardTable
              leaderboard={leaderboard}
              currentUserId={currentUserId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}


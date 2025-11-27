"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Plus, Calendar, Target, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Challenge {
  id: string
  title: string
  description?: string
  type: string
  target: number
  startDate: string
  endDate: string
  isPublic: boolean
  creator: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  participantCount: number
  userProgress: number
  isJoined: boolean
}

interface ChallengeParticipant {
  id: string
  progress: number
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export function ChallengesList() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filter, setFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [activeChallengeTitle, setActiveChallengeTitle] = useState("")
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "yearly",
    target: "",
    startDate: "",
    endDate: "",
    isPublic: true,
  })

  useEffect(() => {
    fetchChallenges()
  }, [filter])

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`/api/challenges?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setChallenges(data)
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error)
    }
  }

  const handleViewParticipants = async (challenge: Challenge) => {
    setParticipantsLoading(true)
    setActiveChallengeTitle(challenge.title)
    try {
      const response = await fetch(`/api/challenges/${challenge.id}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(Array.isArray(data) ? data : [])
        setParticipantsOpen(true)
      }
    } catch (error) {
      console.error("Failed to fetch challenge participants:", error)
      setParticipants([])
      setParticipantsOpen(true)
    } finally {
      setParticipantsLoading(false)
    }
  }

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsCreateOpen(false)
        setFormData({
          title: "",
          description: "",
          type: "yearly",
          target: "",
          startDate: "",
          endDate: "",
          isPublic: true,
        })
        fetchChallenges()
      }
    } catch (error) {
      console.error("Failed to create challenge:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: "POST",
      })

      if (response.ok) {
        fetchChallenges()
      }
    } catch (error) {
      console.error("Failed to join challenge:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getProgressPercentage = (challenge: Challenge) => {
    return Math.min((challenge.userProgress / challenge.target) * 100, 100)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reading Challenges</h2>
          <p className="text-muted-foreground">Join or create reading challenges</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
              <DialogDescription>Set up a reading challenge for yourself or others</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Challenge Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="pages">Pages</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="genre">Genre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                Create Challenge
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "my" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("my")}
        >
          My Challenges
        </Button>
        <Button
          variant={filter === "joined" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("joined")}
        >
          Joined
        </Button>
        <Button
          variant={filter === "public" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("public")}
        >
          Public
        </Button>
      </div>

      {/* Participants dialog */}
      <Dialog open={participantsOpen} onOpenChange={setParticipantsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Participants</DialogTitle>
            <DialogDescription>
              {activeChallengeTitle || "Challenge"} – people who have joined this challenge.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[360px] overflow-y-auto">
            {participantsLoading ? (
              <p className="text-sm text-muted-foreground">Loading participants...</p>
            ) : participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No participants yet.</p>
            ) : (
              participants.map((p) => {
                const displayName = p.user.name || p.user.email
                const initial = (displayName?.[0] || "U").toUpperCase()
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-card/60 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {initial}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate">{displayName}</span>
                        <span className="text-xs text-muted-foreground">
                          Progress: {p.progress}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No challenges found</p>
            </CardContent>
          </Card>
        ) : (
          challenges.map((challenge) => (
            <Card key={challenge.id} className="flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-start justify-between gap-2 mb-1">
                  <span className="flex-1">{challenge.title}</span>
                  {challenge.isPublic && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap flex-shrink-0">Public</span>
                  )}
                </CardTitle>
                <div className="min-h-[1.25rem]">
                  {challenge.description && (
                    <CardDescription className="mt-0">{challenge.description}</CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{challenge.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-medium">{challenge.target}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Participants</span>
                    <button
                      type="button"
                      onClick={() => handleViewParticipants(challenge)}
                      className="font-medium flex items-center gap-1 hover:underline"
                    >
                      <Users className="h-3 w-3" />
                      {challenge.participantCount}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Period</span>
                    <span className="font-medium text-xs">
                      {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                    </span>
                  </div>
                </div>

                {challenge.isJoined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="font-medium">
                        {challenge.userProgress} / {challenge.target}
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(challenge)} />
                  </div>
                )}

                <div className="flex gap-2">
                  {!challenge.isJoined ? (
                    <Button
                      size="sm"
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="w-full"
                    >
                      Join Challenge
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      Joined
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


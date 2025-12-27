"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus, Check, X, Trophy, BookOpen, Flame, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PublicProfileData {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    bio: string | null
    createdAt: Date
  }
  isOwnProfile: boolean
  friendshipStatus: string | null
  stats: {
    totalBooks: number
    completedBooks: number
    totalPagesRead: number
    readingStreak: number
  }
  achievements: Array<{
    id: string
    type: string
    milestone: number
    achievedAt: Date
    book?: {
      title: string
      author: string
    } | null
  }>
  completedBooks: Array<{
    id: string
    title: string
    author: string
    completedAt: Date | null
  }>
}

interface PublicProfileClientProps {
  userId: string
}

export function PublicProfileClient({ userId }: PublicProfileClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<PublicProfileData | null>(null)
  const [friendActionLoading, setFriendActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [userId])

  // Reset image error when profile changes to allow new images to load
  useEffect(() => {
    setImageError(false)
  }, [profile?.user?.image])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/profile/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load profile")
      }
    } catch (err) {
      setError("Failed to load profile")
      console.error("Error fetching profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFriendAction = async (action: "send" | "accept" | "reject") => {
    if (!profile) return

    setFriendActionLoading(true)
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          friendId: userId,
          action,
        }),
      })

      if (response.ok) {
        // Refresh profile to update friendship status
        await fetchProfile()
      } else {
        const errorData = await response.json()
        console.error("Friend action failed:", errorData.error)
      }
    } catch (err) {
      console.error("Error performing friend action:", err)
    } finally {
      setFriendActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error || "Failed to load profile."}
          </p>
        </CardContent>
      </Card>
    )
  }

  const initials = (profile.user.name || profile.user.email)
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--accent)]/12 text-2xl font-semibold text-[color:var(--accent)] relative overflow-hidden">
            {profile.user.image && !imageError ? (
              <Image
                src={profile.user.image}
                alt={profile.user.name || "User"}
                fill
                className="object-cover"
                sizes="80px"
                onError={() => setImageError(true)}
              />
            ) : (
              initials || "U"
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {profile.user.name || profile.user.email}
            </h1>
            {profile.user.bio && (
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                {profile.user.bio}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Member since {new Date(profile.user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {profile.isOwnProfile ? (
          <Link href="/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        ) : (
          <div className="flex gap-2">
            {profile.friendshipStatus === "none" && (
              <Button
                onClick={() => handleFriendAction("send")}
                disabled={friendActionLoading}
                size="sm"
              >
                {friendActionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Add Friend
              </Button>
            )}
            {profile.friendshipStatus === "pending" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleFriendAction("accept")}
                  disabled={friendActionLoading}
                  size="sm"
                  variant="default"
                >
                  {friendActionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Accept
                </Button>
                <Button
                  onClick={() => handleFriendAction("reject")}
                  disabled={friendActionLoading}
                  size="sm"
                  variant="outline"
                >
                  <X className="mr-2 h-4 w-4" />
                  Decline
                </Button>
              </div>
            )}
            {profile.friendshipStatus === "accepted" && (
              <Button variant="outline" size="sm" disabled>
                <Check className="mr-2 h-4 w-4" />
                Friends
              </Button>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4">Reading Statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Library"
            value={`${profile.stats.totalBooks} books`}
            description={`${profile.stats.completedBooks} completed`}
            icon={<BookOpen className="h-4 w-4 text-[color:var(--accent)]" />}
          />
          <StatCard
            label="Pages Read"
            value={profile.stats.totalPagesRead.toLocaleString()}
            description="Total pages"
            icon={<TrendingUp className="h-4 w-4 text-[color:var(--accent)]" />}
          />
          <StatCard
            label="Streak"
            value={`${profile.stats.readingStreak} days`}
            description="Consecutive days"
            icon={<Flame className="h-4 w-4 text-[color:var(--accent)]" />}
          />
          <StatCard
            label="Completion"
            value={`${Math.round((profile.stats.completedBooks / Math.max(profile.stats.totalBooks, 1)) * 100)}%`}
            description="Books finished"
            icon={<Trophy className="h-4 w-4 text-[color:var(--accent)]" />}
          />
        </div>
      </div>

      {profile.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>Reading milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {achievement.milestone}-Day Streak
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Achieved {new Date(achievement.achievedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.completedBooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Books</CardTitle>
            <CardDescription>Recently finished reading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.completedBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                  {book.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(book.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


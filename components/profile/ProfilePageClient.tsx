"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TimezoneSelector } from "./TimezoneSelector"
import { User, Mail, Calendar, Save, Loader2, BookOpen, Flame, BookOpenCheck, Target, Trophy, Quote, TrendingUp, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { StatCard } from "@/components/ui/StatCard"
import { AchievementsList } from "@/components/achievements/AchievementsList"
import Link from "next/link"
import { signOutAction } from "@/app/actions/auth"

interface ProfileData {
  id: string
  name: string | null
  email: string
  image: string | null
  bio: string | null
  timezone: string
  createdAt: Date
}

interface ProfileStats {
  totalBooks: number
  completedBooks: number
  totalPagesRead: number
  todayPages: number
  readingStreak: number
  daysReadThisWeek: number
  daysReadThisMonth: number
  weeklyPages: number
  monthlyPages: number
  recentLogs: Array<{
    id: string
    pagesRead: number
    date: Date
    book: {
      id: string
      title: string
      author: string
    }
  }>
  currentlyReading: Array<{
    id: string
    title: string
    author: string
    totalPages: number
    currentPage: number | null
    initialPages: number | null
  }>
  readingGoals: Array<{
    id: string
    type: string
    target: number
    period: string
    startDate: Date
    endDate: Date
  }>
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
  quotes: Array<{
    id: string
    quoteText: string
    pageNumber: number | null
    book: {
      title: string
      author: string
    } | null
    createdAt: Date
  }>
  completedBooksList: Array<{
    id: string
    title: string
    author: string
    completedAt: Date | null
  }>
}

export function ProfilePageClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    timezone: "Asia/Kolkata",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          timezone: data.timezone || "Asia/Kolkata",
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        setError(errorData.error || "Failed to load profile")
        console.error("Profile API error:", response.status, errorData)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile"
      setError(errorMessage)
      console.error("Error fetching profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch("/api/profile/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error("Error fetching stats:", err)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name || null,
          bio: formData.bio || null,
          timezone: formData.timezone,
        }),
      })

      if (response.ok) {
        const updatedData = await response.json()
        setProfile(updatedData)
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          router.refresh()
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update profile")
      }
    } catch (err) {
      setError("Failed to update profile")
      console.error("Error updating profile:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load profile.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Profile Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your profile information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                Profile updated successfully!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timezone
              </Label>
              <TimezoneSelector
                value={formData.timezone}
                onChange={(tz) => setFormData({ ...formData, timezone: tz })}
              />
              <p className="text-xs text-muted-foreground">
                All dates and times will be displayed in your selected timezone
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: profile.name || "",
                    email: profile.email || "",
                    bio: profile.bio || "",
                    timezone: profile.timezone || "Asia/Kolkata",
                  })
                  setError(null)
                  setSuccess(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOutAction}>
            <Button type="submit" variant="destructive" className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>

      {statsLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : stats && (
        <>
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">Reading Statistics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Library"
                value={`${stats.totalBooks} books`}
                description={`${stats.completedBooks} completed`}
                icon={<BookOpen className="h-4 w-4 text-[color:var(--accent)]" />}
              />
              <StatCard
                label="Pages Read"
                value={stats.totalPagesRead.toLocaleString()}
                description="Total pages"
                icon={<TrendingUp className="h-4 w-4 text-[color:var(--accent)]" />}
              />
              <StatCard
                label="Streak"
                value={`${stats.readingStreak} days`}
                description="Consecutive days"
                icon={<Flame className="h-4 w-4 text-[color:var(--accent)]" />}
              />
              <StatCard
                label="This Week"
                value={`${stats.weeklyPages} pages`}
                description={`${stats.daysReadThisWeek} active days`}
                icon={<Calendar className="h-4 w-4 text-[color:var(--accent)]" />}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Your reading milestones</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {stats.achievements.slice(0, 5).map((achievement) => (
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
                    {stats.achievements.length > 5 && (
                      <Link href="/dashboard#achievements">
                        <Button variant="ghost" size="sm" className="w-full">
                          View All ({stats.achievements.length})
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No achievements yet. Keep reading to unlock milestones!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpenCheck className="h-5 w-5" />
                  Currently Reading
                </CardTitle>
                <CardDescription>Your active books</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.currentlyReading.length > 0 ? (
                  <div className="space-y-3">
                    {stats.currentlyReading.map((book) => {
                      const currentPage = book.currentPage || book.initialPages || 0
                      const progress = Math.min(100, Math.round((currentPage / book.totalPages) * 100))
                      return (
                        <div key={book.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{book.title}</p>
                              <p className="text-xs text-muted-foreground">{book.author}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-[color:var(--accent)] h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Page {currentPage} of {book.totalPages}
                          </p>
                        </div>
                      )
                    })}
                    <Link href="/books?status=reading">
                      <Button variant="ghost" size="sm" className="w-full">
                        View All Books
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No books currently being read.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {stats.quotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5" />
                  Favorite Quotes
                </CardTitle>
                <CardDescription>Recent quotes you've saved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.quotes.slice(0, 5).map((quote) => (
                    <div key={quote.id} className="p-4 border rounded-lg bg-muted/30">
                      <p className="text-sm italic mb-2">"{quote.quoteText}"</p>
                      {quote.book && (
                        <p className="text-xs text-muted-foreground">
                          — {quote.book.title} by {quote.book.author}
                          {quote.pageNumber && ` (p. ${quote.pageNumber})`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.recentLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest reading logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{log.book.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {log.pagesRead} {log.pagesRead === 1 ? "page" : "pages"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.completedBooksList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recently Completed</CardTitle>
                <CardDescription>Books you've finished reading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.completedBooksList.slice(0, 10).map((book) => (
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
        </>
      )}
    </div>
  )
}


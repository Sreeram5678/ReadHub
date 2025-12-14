"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserAvatar } from "./UserAvatar"
import { ReadingStreakHeatmap } from "../dashboard/ReadingStreakHeatmap"
import {
  Calendar,
  BookOpen,
  TrendingUp,
  Award,
  Target,
  Clock,
  BarChart3,
  Flame,
  Zap
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string | null
  totalPages: number
  bookCount: number
  rank: number
}

interface UserAnalytics {
  totalPages: number
  totalBooks: number
  currentStreak: number
  longestStreak: number
  averageDaily: number
  averageWeekly: number
  readingDays: number
  mostProductiveDay: string
  mostProductiveHour: number
  weeklyGoal: number
  monthlyGoal: number
  yearlyGoal: number
  weeklyProgress: number
  monthlyProgress: number
  yearlyProgress: number
  recentActivity: Array<{
    date: string
    pages: number
    books: number
  }>
}

interface UserProfileModalProps {
  user: UserProfile | null
  isOpen: boolean
  onClose: () => void
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      // Reset analytics when user changes
      setAnalytics(null)
      fetchUserAnalytics()
    } else if (!isOpen) {
      // Clear analytics when modal closes
      setAnalytics(null)
    }
  }, [user?.id, isOpen])

  const fetchUserAnalytics = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/user-analytics/${user.id}?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        console.error("Failed to fetch user analytics:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch user analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500"
    if (rank === 2) return "bg-gray-400"
    if (rank === 3) return "bg-amber-600"
    return "bg-blue-500"
  }

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${period}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <UserAvatar name={user.name} image={user.image} />
            <div>
              <div className="flex items-center gap-2">
                {user.name}
                <Badge className={`${getRankBadgeColor(user.rank)} text-white`}>
                  #{user.rank}
                </Badge>
              </div>
              <DialogDescription>{user.email}</DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.totalPages.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Books Read</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.bookCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.currentStreak || 0}</div>
                  <p className="text-xs text-muted-foreground">days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reading Days</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.readingDays || 0}</div>
                  <p className="text-xs text-muted-foreground">total</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Reading Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Daily Average</span>
                    <span className="font-medium">{analytics?.averageDaily?.toFixed(1) || 0} pages</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Weekly Average</span>
                    <span className="font-medium">{analytics?.averageWeekly?.toFixed(1) || 0} pages</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Most Productive Day</span>
                    <span className="font-medium">{analytics?.mostProductiveDay || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Peak Reading Time</span>
                    <span className="font-medium">{analytics?.mostProductiveHour ? formatTime(analytics.mostProductiveHour) : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Longest Streak</span>
                    <Badge variant="secondary">{analytics?.longestStreak || 0} days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Books Completed</span>
                    <Badge variant="secondary">{user.bookCount} books</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Reading Heatmap</CardTitle>
                <CardDescription>
                  Visual representation of reading activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReadingStreakHeatmap userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.weeklyGoal || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.weeklyProgress ? Math.round((analytics.weeklyProgress / (analytics.weeklyGoal || 1)) * 100) : 0}% complete
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.monthlyGoal || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.monthlyProgress ? Math.round((analytics.monthlyProgress / (analytics.monthlyGoal || 1)) * 100) : 0}% complete
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yearly Goal</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.yearlyGoal || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.yearlyProgress ? Math.round((analytics.yearlyProgress / (analytics.yearlyGoal || 1)) * 100) : 0}% complete
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Reading Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Reading Speed</h4>
                    <p className="text-sm text-muted-foreground">
                      {analytics?.averageDaily ? `${analytics.averageDaily.toFixed(1)} pages per day` : 'No data'}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      {analytics?.recentActivity?.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{new Date(activity.date).toLocaleDateString()}</span>
                          <span>{activity.pages} pages</span>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">No recent activity</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
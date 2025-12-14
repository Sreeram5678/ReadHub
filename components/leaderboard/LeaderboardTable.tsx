 "use client"
 
 import { Trophy, Medal, Award } from "lucide-react"
 import { UserAvatar } from "./UserAvatar"
 import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  id: string
  name: string
  email: string
  image?: string | null
  totalPages: number
  bookCount: number
  rank: number
  averageDaily?: number
  currentStreak?: number
  consistency?: number
}

export function LeaderboardTable({
  leaderboard,
  currentUserId,
  onUserClick,
  sortBy = 'pages',
}: {
  leaderboard: LeaderboardEntry[]
  currentUserId: string
  onUserClick?: (user: LeaderboardEntry) => void
  sortBy?: 'pages' | 'speed' | 'streak' | 'consistency'
}) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return null
  }

  const getRankStyle = (rank: number, isCurrentUser: boolean) => {
    if (rank === 1) {
      return "border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 shadow-lg shadow-yellow-500/10"
    }
    if (rank === 2) {
      return "border-gray-400/40 bg-gradient-to-r from-gray-400/10 to-gray-300/5"
    }
    if (rank === 3) {
      return "border-amber-600/40 bg-gradient-to-r from-amber-600/10 to-amber-500/5"
    }
    if (isCurrentUser) {
      return "border-primary/30 bg-gradient-to-r from-primary/10 to-accent/5"
    }
    return ""
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No friends on the leaderboard yet</h3>
        <p className="text-muted-foreground">
          Add friends and start logging your reading to see how you compare!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {leaderboard.map((user, index) => {
        const isCurrentUser = user.id === currentUserId
        return (
          <div
            key={user.id}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
              getRankStyle(user.rank, isCurrentUser),
              isCurrentUser && user.rank > 3 && "ring-2 ring-primary/30"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onUserClick?.(user)}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 min-w-[80px]">
                {getRankIcon(user.rank)}
                <span className={cn(
                  "font-bold text-lg",
                  user.rank <= 3 ? "text-lg" : "text-base text-muted-foreground"
                )}>
                  #{user.rank}
                </span>
              </div>
              <UserAvatar name={user.name} image={user.image} />
              <div>
                <p className="font-semibold flex items-center gap-2">
                  {user.name}
                  {isCurrentUser && (
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-2 py-0.5 text-xs font-semibold text-primary border border-primary/30">
                      You
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.bookCount} {user.bookCount === 1 ? "book" : "books"}
                </p>
              </div>
            </div>
            <div className="text-right">
              {sortBy === 'pages' && (
                <>
                  <p className="font-bold text-xl md:text-2xl">{user.totalPages.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">pages</p>
                </>
              )}
              {sortBy === 'speed' && (
                <>
                  <p className="font-bold text-xl md:text-2xl">{(user.averageDaily || 0).toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">pages/day</p>
                </>
              )}
              {sortBy === 'streak' && (
                <>
                  <p className="font-bold text-xl md:text-2xl">{user.currentStreak || 0}</p>
                  <p className="text-xs text-muted-foreground">day streak</p>
                </>
              )}
              {sortBy === 'consistency' && (
                <>
                  <p className="font-bold text-xl md:text-2xl">{(user.consistency || 0).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">consistency</p>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}


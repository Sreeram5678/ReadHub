 "use client"
 
 import { Trophy, Medal, Award } from "lucide-react"
 import { UserAvatar } from "./UserAvatar"

interface LeaderboardEntry {
  id: string
  name: string
  email: string
  image?: string | null
  totalPages: number
  bookCount: number
  rank: number
}

export function LeaderboardTable({
  leaderboard,
  currentUserId,
}: {
  leaderboard: LeaderboardEntry[]
  currentUserId: string
}) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return null
  }

  if (leaderboard.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No friends with reading data yet. Add friends and start logging your reading!
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {leaderboard.map((user) => {
        const isCurrentUser = user.id === currentUserId
        return (
          <div
            key={user.id}
            className={`flex items-center justify-between rounded-lg border p-4 ${
              isCurrentUser ? "bg-muted" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getRankIcon(user.rank)}
                <span className="font-bold text-lg w-8">#{user.rank}</span>
              </div>
              <UserAvatar name={user.name} image={user.image} />
              <div>
                <p className="font-medium">
                  {user.name}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (You)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.bookCount} {user.bookCount === 1 ? "book" : "books"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{user.totalPages}</p>
              <p className="text-sm text-muted-foreground">pages</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}


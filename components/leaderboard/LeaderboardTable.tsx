"use client"

import { Trophy, Medal, Award } from "lucide-react"
import Image from "next/image"

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
        No reading data yet. Start logging your reading to appear on the
        leaderboard!
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
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
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


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, Zap, BarChart3 } from "lucide-react"

interface Friend {
  id: string
  name: string
  email: string
  image?: string | null
}

interface AdvancedFiltersProps {
  friends: Friend[]
  selectedUsers: string[]
  onUsersChange: (userIds: string[]) => void
  sortBy: 'pages' | 'speed' | 'streak'
  onSortChange: (sortBy: 'pages' | 'speed' | 'streak') => void
}

export function AdvancedFilters({
  friends,
  selectedUsers,
  onUsersChange,
  sortBy,
  onSortChange
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempSelectedUsers, setTempSelectedUsers] = useState(selectedUsers)
  const [tempSortBy, setTempSortBy] = useState(sortBy)

  useEffect(() => {
    setTempSelectedUsers(selectedUsers)
    setTempSortBy(sortBy)
  }, [selectedUsers, sortBy])

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setTempSelectedUsers(prev => [...prev, userId])
    } else {
      setTempSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const handleSelectAll = () => {
    setTempSelectedUsers(friends.map(friend => friend.id))
  }

  const handleSelectNone = () => {
    setTempSelectedUsers([])
  }

  const handleApply = () => {
    onUsersChange(tempSelectedUsers)
    onSortChange(tempSortBy)
    setIsOpen(false)
  }

  const handleReset = () => {
    setTempSelectedUsers(friends.map(friend => friend.id))
    setTempSortBy('pages')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Advanced Filters
          {(selectedUsers.length !== friends.length || sortBy !== 'pages') && (
            <Badge variant="secondary" className="ml-2">
              {selectedUsers.length !== friends.length ? `${selectedUsers.length} users` : ''}
              {sortBy !== 'pages' ? ` • ${sortBy}` : ''}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Filters
          </DialogTitle>
          <DialogDescription>
            Customize your leaderboard view with advanced filtering and sorting options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Compare Users
              </CardTitle>
              <CardDescription>
                Select which friends to include in the comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNone}>
                  Select None
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-3 p-2 rounded-lg border">
                    <Checkbox
                      id={friend.id}
                      checked={tempSelectedUsers.includes(friend.id)}
                      onCheckedChange={(checked) =>
                        handleUserToggle(friend.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={friend.id}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <img
                        src={friend.image || '/default-avatar.png'}
                        alt={friend.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium">{friend.name}</span>
                    </Label>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                {tempSelectedUsers.length} of {friends.length} friends selected
              </div>
            </CardContent>
          </Card>

          {/* Sorting Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                Sort By
              </CardTitle>
              <CardDescription>
                Choose how to rank the leaderboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={tempSortBy} onValueChange={(value: any) => setTempSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pages">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Total Pages Read
                    </div>
                  </SelectItem>
                  <SelectItem value="speed">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Reading Speed (Pages/Day)
                    </div>
                  </SelectItem>
                  <SelectItem value="streak">
                    <div className="flex items-center gap-2">
                      🔥 Current Streak
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-3 text-sm text-muted-foreground">
                {tempSortBy === 'pages' && 'Rank by total pages read in the selected period'}
                {tempSortBy === 'speed' && 'Rank by average pages read per day'}
                {tempSortBy === 'streak' && 'Rank by current consecutive reading days'}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

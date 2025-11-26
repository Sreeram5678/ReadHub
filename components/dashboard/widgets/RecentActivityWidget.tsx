"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditReadingLogForm } from "@/components/reading/EditReadingLogForm"

interface ReadingLog {
  id: string
  pagesRead: number
  date: Date
  book: {
    title: string
  }
}

interface RecentActivityWidgetProps {
  recentLogs: ReadingLog[]
  onLogUpdated: () => void
}

export function RecentActivityWidget({ recentLogs, onLogUpdated }: RecentActivityWidgetProps) {
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const editingLog = editingLogId ? recentLogs.find(log => log.id === editingLogId) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest reading logs</CardDescription>
      </CardHeader>
      <CardContent>
        {recentLogs.length === 0 ? (
          <p className="text-muted-foreground">
            No reading logs yet. Start by adding a book and logging your
            reading!
          </p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex-1">
                  <p className="font-medium">{log.book.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{log.pagesRead} pages</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingLogId(log.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {editingLog && (
          <EditReadingLogForm
            log={editingLog}
            open={editingLogId !== null}
            onOpenChange={(open) => {
              if (!open) {
                setEditingLogId(null)
              }
            }}
            onLogUpdated={() => {
              setEditingLogId(null)
              onLogUpdated()
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}


"use client"

import { useState } from "react"
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
  const editingLog = editingLogId ? recentLogs.find((log) => log.id === editingLogId) : null

  return (
    <div className="card-surface h-full rounded-[1.5rem] border border-card-border/70 bg-[color:var(--surface)] p-6 shadow-[var(--card-shadow)] transition-transform duration-200 hover:-translate-y-1">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Recent Activity</p>
        <p className="serif-heading text-2xl text-[color:var(--text)]">Latest reading logs</p>
      </div>
      {recentLogs.length === 0 ? (
        <p className="text-sm text-muted">No reading logs yet. Start by logging your latest session.</p>
      ) : (
        <div className="space-y-3">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="group flex items-center justify-between rounded-2xl border border-card-border/60 px-4 py-3 transition-colors hover:border-[color:var(--accent)]/40"
            >
              <div>
                <p className="font-medium text-[color:var(--text)]">{log.book.title}</p>
                <p className="text-xs text-muted">{new Date(log.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold">{log.pagesRead} pages</p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditingLogId(log.id)}
                  aria-label="Edit reading log"
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
    </div>
  )
}


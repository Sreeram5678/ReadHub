"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Plus, Trash2, Edit, ToggleLeft, ToggleRight } from "lucide-react"

interface Reminder {
  id: string
  title: string
  message?: string | null
  time: string
  days: string
  isActive: boolean
}

export function RemindersList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    time: "",
    days: "daily",
    isActive: true,
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/reminders")
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error("Failed to fetch reminders:", error)
    }
  }

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsCreateOpen(false)
        setFormData({
          title: "",
          message: "",
          time: "",
          days: "daily",
          isActive: true,
        })
        fetchReminders()
      }
    } catch (error) {
      console.error("Failed to create reminder:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReminder) return

    setLoading(true)

    try {
      const response = await fetch(`/api/reminders/${editingReminder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setEditingReminder(null)
        setFormData({
          title: "",
          message: "",
          time: "",
          days: "daily",
          isActive: true,
        })
        fetchReminders()
      }
    } catch (error) {
      console.error("Failed to update reminder:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReminder = async (id: string) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error("Failed to delete reminder:", error)
    }
  }

  const handleToggleActive = async (reminder: Reminder) => {
    try {
      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reminder,
          isActive: !reminder.isActive,
        }),
      })

      if (response.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error("Failed to toggle reminder:", error)
    }
  }

  const openEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      message: reminder.message || "",
      time: reminder.time,
      days: reminder.days,
      isActive: reminder.isActive,
    })
  }

  const closeEditDialog = () => {
    setEditingReminder(null)
    setFormData({
      title: "",
      message: "",
      time: "",
      days: "daily",
      isActive: true,
    })
  }

  const formatDays = (days: string) => {
    if (days === "daily") return "Daily"
    const dayNames: { [key: string]: string } = {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    }
    return days.split(",").map((d) => dayNames[d.trim()] || d).join(", ")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reading Reminders</h2>
          <p className="text-muted-foreground">Set reminders to maintain your reading habit</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reminder</DialogTitle>
              <DialogDescription>Set up a reading reminder</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReminder} className="space-y-4">
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
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="days">Days</Label>
                <Input
                  id="days"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                  placeholder="daily or mon,tue,wed"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use "daily" or comma-separated days (mon,tue,wed,etc.)
                </p>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                Create Reminder
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingReminder} onOpenChange={() => closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
            <DialogDescription>Update your reminder settings</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateReminder} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-message">Message (Optional)</Label>
              <Textarea
                id="edit-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-days">Days</Label>
              <Input
                id="edit-days"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                placeholder="daily or mon,tue,wed"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              Update Reminder
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {reminders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reminders set</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      {reminder.title}
                    </CardTitle>
                    {reminder.message && (
                      <CardDescription className="mt-1">{reminder.message}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(reminder)}
                  >
                    {reminder.isActive ? (
                      <ToggleRight className="h-5 w-5 text-primary" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{reminder.time}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Days</span>
                  <span className="font-medium">{formatDays(reminder.days)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${reminder.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                    {reminder.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(reminder)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


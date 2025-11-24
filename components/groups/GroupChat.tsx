"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users, Send, Edit2, Trash2, Reply, Smile } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface Attachment {
  id: string
  type: string
  url: string
  filename?: string
  size?: number
}

interface Reaction {
  id: string
  emoji: string
  user: User
}

interface Message {
  id: string
  content: string
  userId: string
  createdAt: string
  editedAt?: string
  user: User
  replyTo?: Message
  attachments: Attachment[]
  reactions: Reaction[]
  _count: {
    replies: number
  }
}

interface GroupChatProps {
  groupId: string
  currentUserId: string
  userRole?: string | null
}

export function GroupChat({ groupId, currentUserId, userRole }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    fetchMessages()
    setupEventStream()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [groupId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages?limit=100`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const setupEventStream = () => {
    const eventSource = new EventSource(`/api/groups/${groupId}/messages/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "messages" && data.messages) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const newMessages = data.messages.filter((m: Message) => !existingIds.has(m.id))
            return [...prev, ...newMessages]
          })
        } else if (data.type === "updates" && data.messages) {
          setMessages((prev) =>
            prev.map((msg) => {
              const updated = data.messages.find((m: Message) => m.id === msg.id)
              return updated ? { ...msg, ...updated } : msg
            })
          )
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      setTimeout(setupEventStream, 3000)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    if (!newMessage.trim() && !replyingTo) return

    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          replyToId: replyingTo?.id || null,
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages((prev) => [...prev, message])
        setNewMessage("")
        setReplyingTo(null)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (message: Message) => {
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/messages/${message.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        const updated = await response.json()
        setMessages((prev) => prev.map((m) => (m.id === message.id ? updated : m)))
        setEditingMessage(null)
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error editing message:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      const response = await fetch(`/api/groups/${groupId}/messages/${messageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch(`/api/groups/${groupId}/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })
      fetchMessages()
    } catch (error) {
      console.error("Error adding reaction:", error)
    }
  }

  const canModify = (message: Message) => {
    return (
      message.userId === currentUserId ||
      userRole === "admin" ||
      userRole === "moderator"
    )
  }

  const commonReactions = ["👍", "❤️", "😂", "😮", "😢", "🔥"]

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3 group">
              <div className="flex-shrink-0">
                {message.user.image ? (
                  <img
                    src={message.user.image}
                    alt={message.user.name || message.user.email}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                    {(message.user.name || message.user.email)[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {message.replyTo && (
                  <div className="text-xs text-muted-foreground mb-1 pl-3 border-l-2 border-muted">
                    Replying to {message.replyTo.user.name || message.replyTo.user.email}
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">
                    {message.user.name || message.user.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                  {message.editedAt && (
                    <span className="text-xs text-muted-foreground">(edited)</span>
                  )}
                </div>
                {editingMessage?.id === message.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(message)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingMessage(null)
                          setNewMessage("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 break-words">{message.content}</p>
                    {message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {att.filename || "Attachment"}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(
                            message.reactions.reduce((acc: Record<string, User[]>, r) => {
                              if (!acc[r.emoji]) acc[r.emoji] = []
                              acc[r.emoji].push(r.user)
                              return acc
                            }, {})
                          ).map(([emoji, users]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(message.id, emoji)}
                              className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-muted/80 flex items-center gap-1"
                            >
                              <span>{emoji}</span>
                              <span>{users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => {
                            setReplyingTo(message)
                            document.getElementById("message-input")?.focus()
                          }}
                        >
                          <Reply className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-6 px-2">
                              <Smile className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {commonReactions.map((emoji) => (
                              <DropdownMenuItem
                                key={emoji}
                                onClick={() => handleReaction(message.id, emoji)}
                              >
                                {emoji}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {canModify(message) && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => {
                                setEditingMessage(message)
                                setNewMessage(message.content)
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-destructive"
                              onClick={() => handleDelete(message.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 space-y-2">
        {replyingTo && (
          <div className="flex items-center justify-between text-sm bg-muted p-2 rounded">
            <span>
              Replying to {replyingTo.user.name || replyingTo.user.email}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            id="message-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                if (editingMessage) {
                  handleEdit(editingMessage)
                } else {
                  handleSend()
                }
              }
            }}
            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
            rows={2}
            className="flex-1"
          />
          <Button onClick={editingMessage ? () => handleEdit(editingMessage) : handleSend} disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


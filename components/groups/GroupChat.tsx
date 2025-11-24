"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users, Send, Edit2, Trash2, Reply, Smile, X, Paperclip } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isMounted = true
    let shouldUsePolling = false
    
    const setupEventStream = () => {
      try {
        if (typeof EventSource === "undefined") {
          console.warn("EventSource not supported, falling back to polling")
          shouldUsePolling = true
          startPolling()
          return
        }

        const eventSource = new EventSource(`/api/groups/${groupId}/messages/stream`)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          console.log("EventSource connected")
        }

        eventSource.onmessage = (event) => {
          if (!isMounted) return
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

        eventSource.onerror = (error) => {
          console.error("EventSource error:", error)
          if (eventSource.readyState === EventSource.CLOSED) {
            eventSource.close()
            shouldUsePolling = true
            startPolling()
            if (isMounted) {
              setTimeout(setupEventStream, 5000)
            }
          }
        }
      } catch (error) {
        console.error("Error setting up EventSource:", error)
        shouldUsePolling = true
        startPolling()
      }
    }

    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      pollingIntervalRef.current = setInterval(() => {
        if (isMounted) {
          fetchMessages()
        }
      }, 3000)
    }

    fetchMessages()
    setupEventStream()

    return () => {
      isMounted = false
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
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
        setMessages(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch messages:", response.status, response.statusText)
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
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

  if (!groupId) {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)] items-center justify-center p-4">
        <p className="text-muted-foreground">Invalid group ID</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-background">
      {/* Chat Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Active</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm text-muted-foreground">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            if (!message || !message.user) return null
            
            const isOwnMessage = message.userId === currentUserId
            const showAvatar = index === 0 || messages[index - 1]?.userId !== message.userId
            const showTimestamp = index === 0 || 
              new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000

            return (
              <div key={message.id} className={cn("flex gap-3 group", isOwnMessage && "flex-row-reverse")}>
                {/* Avatar */}
                <div className={cn("flex-shrink-0", isOwnMessage && "order-2")}>
                  {showAvatar ? (
                    message.user?.image ? (
                      <img
                        src={message.user.image}
                        alt={message.user?.name || message.user?.email || "User"}
                        className="w-10 h-10 rounded-full border-2 border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium border-2 border-border">
                        {((message.user?.name || message.user?.email || "U")[0] || "U").toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className="w-10" />
                  )}
                </div>

                {/* Message Content */}
                <div className={cn("flex-1 min-w-0 max-w-[75%]", isOwnMessage && "flex flex-col items-end")}>
                  {/* Timestamp */}
                  {showTimestamp && (
                    <div className={cn("text-xs text-muted-foreground mb-2 text-center", isOwnMessage && "text-right")}>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </div>
                  )}

                  {/* Reply Context */}
                  {message.replyTo && message.replyTo.user && (
                    <div className={cn(
                      "text-xs text-muted-foreground mb-1 pl-3 border-l-2 border-primary/30 py-1 rounded-l",
                      isOwnMessage && "border-r-2 border-l-0 pl-0 pr-3 rounded-l-none rounded-r"
                    )}>
                      <span className="font-medium">{message.replyTo.user?.name || message.replyTo.user?.email || "Unknown"}</span>
                      <span className="ml-2 truncate block">{message.replyTo.content.substring(0, 50)}...</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={cn(
                    "relative rounded-2xl px-4 py-2.5 shadow-sm transition-all",
                    isOwnMessage 
                      ? "bg-primary text-primary-foreground ml-auto" 
                      : "bg-muted/50 text-foreground",
                    "hover:shadow-md"
                  )}>
                    {/* Sender Name */}
                    {showAvatar && (
                      <div className={cn(
                        "text-xs font-semibold mb-1",
                        isOwnMessage ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {message.user?.name || message.user?.email || "Unknown"}
                      </div>
                    )}

                    {/* Edit Mode */}
                    {editingMessage?.id === message.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={2}
                          className="bg-background/50 text-foreground"
                          autoFocus
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
                        {/* Message Text */}
                        <p className="break-words whitespace-pre-wrap">{message.content}</p>

                        {/* Attachments */}
                        {message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "text-sm hover:underline flex items-center gap-1",
                                  isOwnMessage ? "text-primary-foreground/80" : "text-primary"
                                )}
                              >
                                <Paperclip className="h-3 w-3" />
                                {att.filename || "Attachment"}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Edited Indicator */}
                        {message.editedAt && (
                          <div className={cn(
                            "text-xs mt-1",
                            isOwnMessage ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            (edited)
                          </div>
                        )}

                        {/* Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
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
                                className={cn(
                                  "text-xs px-2 py-1 rounded-full hover:scale-105 transition-transform flex items-center gap-1",
                                  isOwnMessage 
                                    ? "bg-primary-foreground/20 text-primary-foreground" 
                                    : "bg-background/80 text-foreground border border-border"
                                )}
                              >
                                <span>{emoji}</span>
                                <span className="font-medium">{users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className={cn(
                          "flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
                          isOwnMessage && "justify-end"
                        )}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                              "h-7 px-2 text-xs",
                              isOwnMessage && "hover:bg-primary-foreground/20 text-primary-foreground"
                            )}
                            onClick={() => {
                              setReplyingTo(message)
                              document.getElementById("message-input")?.focus()
                            }}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className={cn(
                                  "h-7 px-2 text-xs",
                                  isOwnMessage && "hover:bg-primary-foreground/20 text-primary-foreground"
                                )}
                              >
                                <Smile className="h-3 w-3 mr-1" />
                                React
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                              {commonReactions.map((emoji) => (
                                <DropdownMenuItem
                                  key={emoji}
                                  onClick={() => handleReaction(message.id, emoji)}
                                  className="text-lg cursor-pointer"
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
                                className={cn(
                                  "h-7 px-2 text-xs",
                                  isOwnMessage && "hover:bg-primary-foreground/20 text-primary-foreground"
                                )}
                                onClick={() => {
                                  setEditingMessage(message)
                                  setNewMessage(message.content)
                                }}
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  "h-7 px-2 text-xs text-destructive hover:text-destructive",
                                  isOwnMessage && "hover:bg-primary-foreground/20"
                                )}
                                onClick={() => handleDelete(message.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer Section */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        {/* Reply Banner */}
        {replyingTo && (
          <div className="px-6 pt-3 pb-2">
            <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Reply className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Replying to</span>
                <span className="font-medium truncate">
                  {replyingTo.user.name || replyingTo.user.email}
                </span>
                <span className="text-muted-foreground truncate hidden sm:inline">
                  {replyingTo.content.substring(0, 40)}...
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => setReplyingTo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 pb-4 pt-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
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
                placeholder={replyingTo ? "Type your reply..." : editingMessage ? "Edit your message..." : "Type a message..."}
                rows={1}
                className="min-h-[44px] max-h-32 resize-none pr-12 bg-background border-border focus-visible:ring-2 focus-visible:ring-primary"
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    // Placeholder for attachment functionality
                  }}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={editingMessage ? () => handleEdit(editingMessage) : handleSend} 
              disabled={loading || !newMessage.trim()}
              size="lg"
              className="h-[44px] px-6"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {editingMessage ? "Update" : "Send"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

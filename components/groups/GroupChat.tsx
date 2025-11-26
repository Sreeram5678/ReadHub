"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Users, Send, Edit2, Trash2, Reply, Smile, X, Paperclip, MoreVertical } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
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
    <div className="flex h-[calc(100vh-200px)] flex-col bg-[#e5ddd5] dark:bg-[#0b141a] relative">
      {/* WhatsApp-style background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Chat Header - WhatsApp style */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] border-b border-[#e9edef] dark:border-[#313d45] px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-[#111b21] dark:text-[#e9edef]">Group Chat</div>
            <div className="text-xs text-[#667781] dark:text-[#8696a0]">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - WhatsApp style */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 relative z-0">
        <div className="max-w-4xl mx-auto space-y-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-[#25d366]/20 flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-[#25d366]" />
              </div>
              <p className="text-lg font-medium mb-1 text-[#111b21] dark:text-[#e9edef]">No messages yet</p>
              <p className="text-sm text-[#667781] dark:text-[#8696a0]">Be the first to say something and start the discussion.</p>
            </div>
          ) : (
          messages.map((message, index) => {
            if (!message || !message.user) return null
            
            const isOwnMessage = message.userId === currentUserId
            const prevMessage = index > 0 ? messages[index - 1] : null
            const nextMessage = index < messages.length - 1 ? messages[index + 1] : null
            const isSameSender = prevMessage?.userId === message.userId
            const isLastInGroup = nextMessage?.userId !== message.userId
            const showDateSeparator = index === 0 || 
              new Date(message.createdAt).getDate() !== new Date(prevMessage!.createdAt).getDate()

            return (
              <div key={message.id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-[#ffffff] dark:bg-[#182229] px-3 py-1 rounded-full text-xs text-[#667781] dark:text-[#8696a0] shadow-sm">
                      {format(new Date(message.createdAt), "MMMM d, yyyy")}
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "flex gap-2 group mb-0.5",
                    isOwnMessage ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Avatar - Only for received messages, only when sender changes */}
                  {!isOwnMessage && !isSameSender && (
                    <div className="flex-shrink-0 w-8 h-8 mt-auto">
                      {message.user?.image ? (
                        <img
                          src={message.user.image}
                          alt={message.user?.name || message.user?.email || "User"}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#25d366] flex items-center justify-center text-xs font-medium text-white">
                          {((message.user?.name || message.user?.email || "U")[0] || "U").toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  {!isOwnMessage && isSameSender && <div className="w-8" />}

                  {/* Message Content */}
                  <div className={cn("flex flex-col max-w-[65%] md:max-w-[50%]", isOwnMessage && "items-end")}>
                    {/* Sender Name - Only for received messages, only when sender changes */}
                    {!isOwnMessage && !isSameSender && (
                      <div className="text-xs text-[#667781] dark:text-[#8696a0] px-1 mb-0.5">
                        {message.user?.name || message.user?.email || "Unknown"}
                      </div>
                    )}

                    {/* Reply Context */}
                    {message.replyTo && message.replyTo.user && (
                      <div className={cn(
                        "text-xs mb-1 px-3 py-1.5 rounded-tl-lg rounded-tr-lg border-l-4",
                        isOwnMessage 
                          ? "bg-[#d9fdd3] dark:bg-[#005c4b] border-[#25d366] text-[#111b21] dark:text-[#e9edef]" 
                          : "bg-white dark:bg-[#202c33] border-[#667781] text-[#111b21] dark:text-[#e9edef]"
                      )}>
                        <div className="font-medium text-[#25d366] dark:text-[#53bdeb]">
                          {message.replyTo.user?.name || message.replyTo.user?.email || "Unknown"}
                        </div>
                        <div className="truncate mt-0.5">{message.replyTo.content.substring(0, 50)}</div>
                      </div>
                    )}

                    {/* Message Bubble - WhatsApp style */}
                    <div className={cn(
                      "relative px-2 py-1.5 rounded-lg shadow-sm",
                      isOwnMessage 
                        ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-br-sm" 
                        : "bg-white dark:bg-[#202c33] rounded-bl-sm",
                      isLastInGroup && (isOwnMessage ? "rounded-br-sm" : "rounded-bl-sm")
                    )}>
                      {/* Edit Mode */}
                      {editingMessage?.id === message.id ? (
                        <div className="space-y-2 min-w-[200px]">
                          <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            rows={2}
                            className="bg-white dark:bg-[#111b21] text-[#111b21] dark:text-[#e9edef] text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEdit(message)} className="h-7 text-xs">
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingMessage(null)
                                setNewMessage("")
                              }}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Message Text */}
                          <p className={cn(
                            "break-words whitespace-pre-wrap text-sm leading-relaxed",
                            isOwnMessage 
                              ? "text-[#111b21] dark:text-[#e9edef]" 
                              : "text-[#111b21] dark:text-[#e9edef]"
                          )}>
                            {message.content}
                          </p>

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
                                    "text-xs hover:underline flex items-center gap-1",
                                    isOwnMessage 
                                      ? "text-[#25d366] dark:text-[#53bdeb]" 
                                      : "text-[#25d366] dark:text-[#53bdeb]"
                                  )}
                                >
                                  <Paperclip className="h-3 w-3" />
                                  {att.filename || "Attachment"}
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Timestamp and Status - Bottom right/left */}
                          <div className={cn(
                            "flex items-center gap-1 mt-0.5 justify-end",
                            !isOwnMessage && "justify-start"
                          )}>
                            <span className={cn(
                              "text-[0.65rem] leading-none",
                              isOwnMessage 
                                ? "text-[#667781] dark:text-[#8696a0]" 
                                : "text-[#667781] dark:text-[#8696a0]"
                            )}>
                              {format(new Date(message.createdAt), "h:mm a")}
                            </span>
                            {message.editedAt && (
                              <span className={cn(
                                "text-[0.65rem] leading-none italic",
                                isOwnMessage 
                                  ? "text-[#667781] dark:text-[#8696a0]" 
                                  : "text-[#667781] dark:text-[#8696a0]"
                              )}>
                                (edited)
                              </span>
                            )}
                          </div>

                          {/* Reactions */}
                          {message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 -mb-1">
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
                                  className="text-xs px-1.5 py-0.5 rounded-full bg-white dark:bg-[#111b21] border border-[#e9edef] dark:border-[#313d45] hover:scale-105 transition-transform flex items-center gap-1"
                                >
                                  <span className="text-sm">{emoji}</span>
                                  <span className="font-medium text-[0.65rem]">{users.length}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Action Menu - Long press equivalent (hover on desktop) */}
                          <div className={cn(
                            "absolute opacity-0 group-hover:opacity-100 transition-opacity",
                            isOwnMessage ? "left-0 -translate-x-full mr-2" : "right-0 translate-x-full ml-2",
                            "top-0"
                          )}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 w-6 p-0 bg-white dark:bg-[#202c33] shadow-md border border-[#e9edef] dark:border-[#313d45]"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setReplyingTo(message)
                                    document.getElementById("message-input")?.focus()
                                  }}
                                >
                                  <Reply className="h-4 w-4 mr-2" />
                                  Reply
                                </DropdownMenuItem>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Smile className="h-4 w-4 mr-2" />
                                      React
                                    </DropdownMenuItem>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
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
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingMessage(message)
                                        setNewMessage(message.content)
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(message.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer Section - WhatsApp style */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] border-t border-[#e9edef] dark:border-[#313d45] z-10">
        {/* Reply Banner */}
        {replyingTo && (
          <div className="px-4 pt-2 pb-1">
            <div className="flex items-center justify-between bg-white dark:bg-[#111b21] rounded-lg px-3 py-2 text-sm border border-[#e9edef] dark:border-[#313d45]">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Reply className="h-4 w-4 text-[#667781] dark:text-[#8696a0] flex-shrink-0" />
                <span className="text-[#667781] dark:text-[#8696a0]">Replying to</span>
                <span className="font-medium truncate text-[#111b21] dark:text-[#e9edef]">
                  {replyingTo.user.name || replyingTo.user.email}
                </span>
                <span className="text-[#667781] dark:text-[#8696a0] truncate hidden sm:inline">
                  {replyingTo.content.substring(0, 40)}...
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 flex-shrink-0 hover:bg-[#e9edef] dark:hover:bg-[#313d45]"
                onClick={() => setReplyingTo(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area - WhatsApp style */}
        <div className="px-3 md:px-4 pb-3 pt-2">
          <div className="flex gap-2 items-end bg-white dark:bg-[#111b21] rounded-2xl px-2 py-1.5 border border-[#e9edef] dark:border-[#313d45]">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-[#667781] dark:text-[#8696a0] hover:text-[#111b21] dark:hover:text-[#e9edef] hover:bg-transparent"
              onClick={() => {
                // Placeholder for attachment functionality
              }}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
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
                className="min-h-[36px] max-h-32 resize-none bg-transparent border-0 focus-visible:ring-0 text-sm text-[#111b21] dark:text-[#e9edef] placeholder:text-[#667781] dark:placeholder:text-[#8696a0]"
              />
            </div>
            {newMessage.trim() && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-[#667781] dark:text-[#8696a0] hover:text-[#111b21] dark:hover:text-[#e9edef] hover:bg-transparent"
                onClick={() => {
                  // Placeholder for emoji picker
                }}
              >
                <Smile className="h-5 w-5" />
              </Button>
            )}
            <Button 
              onClick={editingMessage ? () => handleEdit(editingMessage) : handleSend} 
              disabled={loading || !newMessage.trim()}
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                newMessage.trim() 
                  ? "bg-[#25d366] hover:bg-[#20ba5a] text-white" 
                  : "bg-transparent text-[#667781] dark:text-[#8696a0] cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import Image from "next/image"
import { useState } from "react"

interface UserAvatarProps {
  name: string
  image?: string | null
}

function getInitials(name: string) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const second = parts[1]?.[0] ?? ""
  const initials = (first + second).toUpperCase()
  return initials || "?"
}

const colorClasses = [
  "bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/40",
  "bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/40",
  "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/40",
  "bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40",
  "bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/40",
]

function getColorClasses(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % colorClasses.length
  return colorClasses[index]
}

export function UserAvatar({ name, image }: UserAvatarProps) {
  const [showImage, setShowImage] = useState(Boolean(image))
  const initials = getInitials(name)
  const color = getColorClasses(name || initials)

  return (
    <div
      className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold ${color}`}
    >
      {showImage && image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes="40px"
          className="rounded-full object-cover"
          onError={() => setShowImage(false)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}



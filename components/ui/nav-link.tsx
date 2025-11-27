"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-all duration-200 relative px-3 py-2 rounded-md",
        isActive
          ? "text-primary font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        className
      )}
      prefetch={true}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
      )}
    </Link>
  )
}


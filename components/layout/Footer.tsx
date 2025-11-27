"use client"

import Link from "next/link"
import { motion } from "framer-motion"

const FOOTER_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Community", href: "/#community" },
  { label: "Privacy", href: "/privacy" },
  { label: "Support", href: "/support" },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <motion.footer
      id="footer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="border-t border-card-border/60 bg-[color:var(--surface)]/80 py-10 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="serif-heading text-xl text-[color:var(--text)]">ReadHub</p>
          <p className="text-xs text-muted">Crafted for readers everywhere.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-muted transition-colors hover:text-[color:var(--text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted">&copy; {year} ReadHub. All rights reserved.</p>
      </div>
    </motion.footer>
  )
}


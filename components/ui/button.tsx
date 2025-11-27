import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-tight transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--accent)] text-white shadow-[0px_15px_35px_rgba(10,132,255,0.25)] hover:bg-[color:var(--accent-600)] hover:shadow-[0px_20px_45px_rgba(10,132,255,0.3)]",
        gradient:
          "bg-gradient-to-br from-[color:var(--accent)] via-[#3db9ff] to-[#8ad1ff] text-white shadow-[0px_20px_45px_rgba(58,143,255,0.35)] hover:brightness-110",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90 focus-visible:ring-red-500/30 shadow-[0_15px_35px_rgba(244,63,94,0.35)]",
        outline:
          "border border-card-border/80 bg-transparent text-[color:var(--text)] shadow-none hover:border-[color:var(--accent)]/80 hover:bg-[color:var(--accent)]/5",
        secondary:
          "bg-[color:var(--surface)] text-[color:var(--text)] border border-card-border/80 shadow-[var(--card-shadow)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]/60",
        ghost:
          "text-[color:var(--text)] hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--text)]",
        link: "text-[color:var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5 has-[>svg]:px-5",
        sm: "h-9 px-4 py-2 text-xs has-[>svg]:px-3",
        lg: "h-12 px-7 py-3 text-base has-[>svg]:px-6",
        icon: "size-11 rounded-full",
        "icon-sm": "size-9 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

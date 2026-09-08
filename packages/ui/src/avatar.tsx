"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full ring-1 ring-outline-variant shadow-xs",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        md: "h-9 w-9 text-xs",
        lg: "h-12 w-12 text-sm",
      },
      variant: {
        primary: "bg-primary text-on-primary",
        secondary: "bg-secondary text-on-secondary",
        tertiary: "bg-tertiary text-on-tertiary",
        surface: "bg-surface-container-high text-on-surface",
        surfaceContainer: "bg-surface-dim text-on-surface",
        primaryContainer: "bg-primary-container text-on-primary",
        secondaryFixedDim: "bg-secondary-fixed-dim text-on-secondary-fixed",
        outline: "bg-outline text-surface-container-lowest",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
)

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  initials?: string
}

function Avatar({ className, variant, size, initials, ...props }: AvatarProps) {
  return (
    <div
      className={cn(avatarVariants({ variant, size, className }))}
      {...props}
    >
      {initials && (
        <div className="flex h-full w-full items-center justify-center font-bold">
          {initials}
        </div>
      )}
    </div>
  )
}

export { Avatar, avatarVariants }

import type React from "react"
import { cn } from "@/lib/utils"

interface UserStatusBadgeProps {
  status: "active" | "inactive"
  children: React.ReactNode
  className?: string
}

const statusStyles = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
}

export function UserStatusBadge({ status, children, className }: UserStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className,
      )}
    >
      {children}
    </span>
  )
}

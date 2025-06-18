import type React from "react"
import { cn } from "@/lib/utils"

interface BorrowingStatusBadgeProps {
  status: "pending" | "approved" | "rejected" | "returned"
  children: React.ReactNode
  className?: string
}

const statusStyles = {
  pending: "bg-orange-100 text-orange-800 border-orange-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  returned: "bg-green-100 text-green-800 border-green-200",
}

export function BorrowingStatusBadge({ status, children, className }: BorrowingStatusBadgeProps) {
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

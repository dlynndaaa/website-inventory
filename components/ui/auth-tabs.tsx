"use client"

import { cn } from "@/lib/utils"

interface AuthTabsProps {
  activeTab: "login" | "register"
  onTabChange: (tab: "login" | "register") => void
  className?: string
}

export function AuthTabs({ activeTab, onTabChange, className }: AuthTabsProps) {
  return (
    <div className={cn("flex bg-gray-100 rounded-lg p-1 mb-6", className)}>
      <button
        onClick={() => onTabChange("login")}
        className={cn(
          "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
          activeTab === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
        )}
      >
        Log In
      </button>
      <button
        onClick={() => onTabChange("register")}
        className={cn(
          "flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors",
          activeTab === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
        )}
      >
        Register
      </button>
    </div>
  )
}

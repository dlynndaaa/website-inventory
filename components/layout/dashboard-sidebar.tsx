"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, FileText, Users, Settings, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Daftar Barang",
    href: "/dashboard/items",
    icon: Package,
  },
  {
    title: "Daftar Peminjaman",
    href: "/dashboard/borrowing",
    icon: FileText,
  },
  {
    title: "Daftar Pengguna",
    href: "/dashboard/users",
    icon: Users,
    adminOnly: true, // Only show for admin
  },
  {
    title: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

interface DashboardSidebarProps {
  className?: string
  userType?: "admin" | "user"
}

export function DashboardSidebar({ className, userType = "admin" }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  // Filter items based on user type
  const filteredItems = sidebarItems.filter((item) => !item.adminOnly || userType === "admin")

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 pb-4">
          <ul className="space-y-2">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3 truncate">{item.title}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}

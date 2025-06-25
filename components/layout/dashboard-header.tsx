"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface User {
  name: string
  role: string
  email: string
  avatar?: string
}

interface DashboardHeaderProps {
  user: User
  onLogout: () => void
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const router = useRouter()

  const handleProfileClick = () => {
    router.push("/dashboard/settings")
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Greeting */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src="/removebg_logo_prodi.png" alt="Logo TI" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl text-gray-900">SIMPEL - TI</span>
          </div>
          <div className="hidden md:block">
            <span className="text-gray-600">Hello {user.name} 👋</span>
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
            <span className="text-sm font-medium text-gray-700">
              {user.role === "admin" ? "Administrator" : "User"}
            </span>
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-blue-500 text-white text-sm">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleProfileClick}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

"use client"

import { Button } from "@/components/ui/button"

interface HeaderProps {
  onLoginClick?: () => void
}

export function Header({ onLoginClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">TI</span>
            </div>
            <span className="font-bold text-xl text-gray-900">SIMPEL - TI</span>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6" onClick={onLoginClick}>
            Login
          </Button>
        </div>
      </div>
    </header>
  )
}

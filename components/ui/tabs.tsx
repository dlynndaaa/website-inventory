"use client"

import type React from "react"

interface TabsProps {
  children: React.ReactNode
  defaultValue: string
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  children: React.ReactNode
  value: string
  isActive?: boolean
  onClick?: () => void
  className?: string
}

interface TabsContentProps {
  children: React.ReactNode
  value: string
  activeValue: string
  className?: string
}

export function Tabs({ children, className = "" }: TabsProps) {
  return <div className={className}>{children}</div>
}

export function TabsList({ children, className = "" }: TabsListProps) {
  return <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>{children}</div>
}

export function TabsTrigger({ children, isActive, onClick, className = "" }: TabsTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
        isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ children, value, activeValue, className = "" }: TabsContentProps) {
  if (value !== activeValue) return null

  return <div className={className}>{children}</div>
}

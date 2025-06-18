"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FaqItemProps {
  question: string
  answer: string
  isOpen?: boolean
  onToggle?: () => void
  className?: string
}

export function FaqItem({ question, answer, isOpen = false, onToggle, className = "" }: FaqItemProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = onToggle !== undefined
  const open = isControlled ? isOpen : internalOpen

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.()
    } else {
      setInternalOpen(!internalOpen)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-4">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

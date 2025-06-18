"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SocialLoginButtonProps {
  provider: "google" | "facebook" | "github"
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const providerConfig = {
  google: {
    text: "Login with Google",
    icon: "🔍", // Using emoji for now, can be replaced with proper Google icon
    bgColor: "bg-white",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
  },
  facebook: {
    text: "Login with Facebook",
    icon: "📘",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    borderColor: "border-blue-600",
  },
  github: {
    text: "Login with GitHub",
    icon: "🐙",
    bgColor: "bg-gray-900",
    textColor: "text-white",
    borderColor: "border-gray-900",
  },
}

export function SocialLoginButton({ provider, onClick, disabled, className }: SocialLoginButtonProps) {
  const config = providerConfig[provider]

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-center gap-3 py-2.5",
        config.bgColor,
        config.textColor,
        config.borderColor,
        "hover:opacity-90",
        className,
      )}
    >
      <span className="text-lg">{config.icon}</span>
      {config.text}
    </Button>
  )
}

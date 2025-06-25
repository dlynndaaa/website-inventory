"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FcGoogle } from "react-icons/fc"

interface SocialLoginButtonProps {
  provider: "google" // hanya google saja
  onClick?: () => void
  disabled?: boolean
  className?: string
  text?: string // ✅ tambahkan ini
}

export function SocialLoginButton({ provider, onClick, disabled, className, text }: SocialLoginButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-center gap-3 py-2.5",
        "bg-white text-gray-700 border border-gray-300",
        "hover:opacity-90",
        className,
      )}
    >
      <FcGoogle className="w-5 h-5" />
      {text ?? "Login with Google"}
    </Button>
  )
}

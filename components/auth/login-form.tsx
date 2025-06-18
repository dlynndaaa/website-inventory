"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { SocialLoginButton } from "@/components/ui/social-login-button"
import { AuthDivider } from "@/components/ui/auth-divider"

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => void
  onForgotPassword?: () => void
  onGoogleLogin?: () => void
  isLoading?: boolean
}

export function LoginForm({ onSubmit, onForgotPassword, onGoogleLogin, isLoading }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSubmit?.(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Email address"
        type="email"
        placeholder="Your email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        error={errors.email}
        disabled={isLoading}
      />

      <div className="space-y-2">
        <FormField
          label="Password"
          type="password"
          placeholder="Your password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          error={errors.password}
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white py-2.5" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Log In"}
      </Button>

      <AuthDivider />

      <SocialLoginButton provider="google" onClick={onGoogleLogin} disabled={isLoading} />
    </form>
  )
}

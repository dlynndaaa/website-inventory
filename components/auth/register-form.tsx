"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { SocialLoginButton } from "@/components/ui/social-login-button"
import { AuthDivider } from "@/components/ui/auth-divider"

interface RegisterFormProps {
  onSubmit?: (data: { name: string; email: string; password: string; confirmPassword: string }) => void
  onGoogleLogin?: () => void
  isLoading?: boolean
}

export function RegisterForm({ onSubmit, onGoogleLogin, isLoading }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

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
        label="Full Name"
        type="text"
        placeholder="Your full name"
        value={formData.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
        error={errors.name}
        disabled={isLoading}
      />

      <FormField
        label="Email address"
        type="email"
        placeholder="Your email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        error={errors.email}
        disabled={isLoading}
      />

      <FormField
        label="Password"
        type="password"
        placeholder="Your password"
        value={formData.password}
        onChange={(e) => handleInputChange("password", e.target.value)}
        error={errors.password}
        disabled={isLoading}
      />

      <FormField
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
        disabled={isLoading}
      />

      <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white py-2.5" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Register"}
      </Button>

      <AuthDivider />

      <SocialLoginButton
        provider="google"
        onClick={onGoogleLogin}
        disabled={isLoading}
        text="Register with Google"
      />
    </form>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthContainer } from "@/components/auth/auth-container"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        console.log("✅ Login successful:", result.user.name)
        router.push("/dashboard/items")
        router.refresh()
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Register data:", data)
      // Handle successful registration
    } catch (error) {
      console.error("Register error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    console.log("Forgot password clicked")
  }

  const handleGoogleLogin = () => {
    console.log("Google login clicked")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <AuthContainer
          onLogin={handleLogin}
          onRegister={handleRegister}
          onForgotPassword={handleForgotPassword}
          onGoogleLogin={handleGoogleLogin}
          isLoading={isLoading}
        />
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm font-medium">Demo Credentials:</p>
          <p className="text-blue-700 text-sm">Admin: admin@simpel-ti.com / admin123</p>
          <p className="text-blue-700 text-sm">User: user@simpel-ti.com / user123</p>
        </div>
      </div>
    </div>
  )
}

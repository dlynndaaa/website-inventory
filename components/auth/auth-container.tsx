"use client"

import { useState } from "react"
import { AuthTabs } from "@/components/ui/auth-tabs"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

interface AuthContainerProps {
  defaultTab?: "login" | "register"
  onLogin?: (data: { email: string; password: string }) => void
  onRegister?: (data: { name: string; email: string; password: string; confirmPassword: string }) => void
  onForgotPassword?: () => void
  onGoogleLogin?: () => void
  isLoading?: boolean
}

export function AuthContainer({
  defaultTab = "login",
  onLogin,
  onRegister,
  onForgotPassword,
  onGoogleLogin,
  isLoading,
}: AuthContainerProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SIMPEL - TI</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "login" ? (
          <LoginForm
            onSubmit={onLogin}
            onForgotPassword={onForgotPassword}
            onGoogleLogin={onGoogleLogin}
            isLoading={isLoading}
          />
        ) : (
          <RegisterForm onSubmit={onRegister} onGoogleLogin={onGoogleLogin} isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}

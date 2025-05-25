"use client"

import { useState } from "react"
import Header from "@/components/layout/header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Header />

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" isActive={activeTab === "login"} onClick={() => setActiveTab("login")}>
                Log In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                isActive={activeTab === "register"}
                onClick={() => setActiveTab("register")}
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" activeValue={activeTab}>
              <LoginForm />
            </TabsContent>

            <TabsContent value="register" activeValue={activeTab}>
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

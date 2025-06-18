import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    await deleteSession()

    const response = NextResponse.json({ success: true })

    // Clear session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db/connection"
import { verifyPassword } from "@/lib/auth/password"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  console.log("🔐 Login attempt started")

  try {
    const { email, password } = await request.json()
    console.log("📧 Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const userQuery = `
      SELECT id, name, email, password_hash, role, employee_id, work_unit, phone,
             student_id, study_program, faculty, whatsapp, avatar, status
      FROM users 
      WHERE email = $1 AND is_active = true AND is_deleted = false
    `

    const userResult = await pool.query(userQuery, [email])

    if (userResult.rows.length === 0) {
      console.log("❌ User not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = userResult.rows[0]
    console.log("✅ User found:", user.name)

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      console.log("❌ Invalid password")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== "active") {
      console.log("❌ User account inactive")
      return NextResponse.json({ error: "Account is inactive" }, { status: 401 })
    }

    // Create session
    const sessionId = await createSession(user.id)

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log("✅ Login successful for:", user.email)
    return response
  } catch (error) {
    console.error("💥 Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

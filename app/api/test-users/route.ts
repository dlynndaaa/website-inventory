import { NextResponse } from "next/server"
import pool from "@/lib/db/connection"

export async function GET() {
  try {
    console.log("🔍 Testing users table...")

    const result = await pool.query(`
      SELECT id, name, email, role, status, is_active, is_deleted 
      FROM users 
      WHERE is_active = true AND is_deleted = false
    `)

    console.log("✅ Users found:", result.rows.length)

    return NextResponse.json({
      success: true,
      message: "Users table accessible",
      users: result.rows,
    })
  } catch (error) {
    console.error("❌ Users table error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

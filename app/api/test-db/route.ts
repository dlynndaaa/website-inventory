import { NextResponse } from "next/server"
import pool from "@/lib/db/connection"

export async function GET() {
  try {
    console.log("🔍 Testing database connection...")
    console.log("DATABASE_URL:", process.env.DATABASE_URL)

    const result = await pool.query("SELECT NOW() as current_time, version() as pg_version")

    console.log("✅ Database connected successfully")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: result.rows[0],
    })
  } catch (error) {
    console.error("❌ Database connection failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

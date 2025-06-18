import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";

// GET /api/users/borrowers - Get all users with role "user" for borrowing
async function getBorrowersHandler(request: NextRequest & { user: any }) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let whereClause =
      "WHERE role = 'user' AND status = 'active' AND is_active = true AND is_deleted = false";
    const queryParams: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR student_id ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    const usersQuery = `
      SELECT id, name, email, student_id, study_program, faculty, whatsapp
      FROM users 
      ${whereClause}
      ORDER BY name ASC
    `;

    const usersResult = await pool.query(usersQuery, queryParams);

    return NextResponse.json({
      borrowers: usersResult.rows,
    });
  } catch (error) {
    console.error("Get borrowers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getBorrowersHandler);

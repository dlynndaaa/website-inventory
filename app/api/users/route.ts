import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";
import { hashPassword } from "@/lib/auth/password";
import { da } from "date-fns/locale";

// GET /api/users - Get all users (admin only)
async function getUsersHandler(request: NextRequest & { user: any }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const offset = (page - 1) * limit;

    let whereClause = "WHERE is_active = true AND is_deleted = false";
    const queryParams: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR student_id ILIKE $${paramCount} OR employee_id ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      queryParams.push(role);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = Number.parseInt(countResult.rows[0].count);

    // Get users with pagination - ensure all fields are selected
    const usersQuery = `
      SELECT id, name, email, role, employee_id, work_unit, phone,
             student_id, study_program, faculty, whatsapp, avatar, status,
             created_date, updated_date
      FROM users 
      ${whereClause}
      ORDER BY created_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const usersResult = await pool.query(usersQuery, queryParams);

    return NextResponse.json({
      users: usersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only)
async function createUserHandler(request: NextRequest & { user: any }) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      employee_id,
      work_unit,
      phone,
      student_id,
      study_program,
      faculty,
      whatsapp,
      avatar,
      status,
    } = body;

    console.log("Creating user with data:", body);

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingQuery = `
      SELECT id FROM users 
      WHERE email = $1 AND is_active = true AND is_deleted = false
    `;
    const existingResult = await pool.query(existingQuery, [email]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user with all fields - use proper null handling for role-specific fields
    const insertQuery = `
      INSERT INTO users (
        name, email, password_hash, role, employee_id, work_unit, phone,
        student_id, study_program, faculty, whatsapp, avatar, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, name, email, role, employee_id, work_unit, phone,
                student_id, study_program, faculty, whatsapp, avatar, status,
                created_date, updated_date
    `;

    const result = await pool.query(insertQuery, [
      name,
      email,
      passwordHash,
      role,
      employee_id || null,
      work_unit || null,
      phone || null,
      student_id || null,
      study_program || null,
      faculty || null,
      whatsapp || null,
      avatar || null,
      status || "active",
      request.user.userId,
    ]);

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUsersHandler, "admin");
export const POST = withAuth(createUserHandler, "admin");

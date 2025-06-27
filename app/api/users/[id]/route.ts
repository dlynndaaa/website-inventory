import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";
import { hashPassword } from "@/lib/auth/password";

// PUT /api/users/[id] - Update user
async function updateUserHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
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

    // Check if user exists
    const existingQuery = `
      SELECT id, role FROM users 
      WHERE id = $1 AND is_active = true AND is_deleted = false
    `;
    const existingResult = await pool.query(existingQuery, [params.id]);

    if (existingResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check permissions - users can only update themselves, admins can update anyone
    if (request.user.role === "user" && params.id !== request.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if email is being changed and if new email already exists
    if (email) {
      const emailCheckQuery = `
        SELECT id FROM users 
        WHERE email = $1 AND id != $2 AND is_active = true AND is_deleted = false
      `;
      const emailCheckResult = await pool.query(emailCheckQuery, [
        email,
        params.id,
      ]);

      if (emailCheckResult.rows.length > 0) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
    }

    const updateFields = [];
    const queryParams = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      queryParams.push(name);
    }

    if (email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      queryParams.push(email);
    }

    if (password !== undefined) {
      const passwordHash = await hashPassword(password);
      paramCount++;
      updateFields.push(`password_hash = $${paramCount}`);
      queryParams.push(passwordHash);
    }

    // Only admins can change role and status
    if (request.user.role === "admin") {
      if (role !== undefined) {
        paramCount++;
        updateFields.push(`role = $${paramCount}`);
        queryParams.push(role);
      }

      if (status !== undefined) {
        paramCount++;
        updateFields.push(`status = $${paramCount}`);
        queryParams.push(status);
      }
    }

    // Handle all role-specific fields - always update them regardless of role
    if (employee_id !== undefined) {
      paramCount++;
      updateFields.push(`employee_id = $${paramCount}`);
      queryParams.push(employee_id || null);
    }

    if (work_unit !== undefined) {
      paramCount++;
      updateFields.push(`work_unit = $${paramCount}`);
      queryParams.push(work_unit || null);
    }

    if (phone !== undefined) {
      paramCount++;
      updateFields.push(`phone = $${paramCount}`);
      queryParams.push(phone || null);
    }

    if (student_id !== undefined) {
      paramCount++;
      updateFields.push(`student_id = $${paramCount}`);
      queryParams.push(student_id || null);
    }

    if (study_program !== undefined) {
      paramCount++;
      updateFields.push(`study_program = $${paramCount}`);
      queryParams.push(study_program || null);
    }

    if (faculty !== undefined) {
      paramCount++;
      updateFields.push(`faculty = $${paramCount}`);
      queryParams.push(faculty || null);
    }

    if (whatsapp !== undefined) {
      paramCount++;
      updateFields.push(`whatsapp = $${paramCount}`);
      queryParams.push(whatsapp || null);
    }

    if (avatar !== undefined) {
      paramCount++;
      updateFields.push(`avatar = $${paramCount}`);
      queryParams.push(avatar || null);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    paramCount++;
    updateFields.push(`updated_by = $${paramCount}`);
    queryParams.push(request.user.userId);

    paramCount++;
    queryParams.push(params.id);

    const updateQuery = `
      UPDATE users SET
        ${updateFields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, employee_id, work_unit, phone,
                student_id, study_program, faculty, whatsapp, avatar, status,
                created_date, updated_date
    `;

    const result = await pool.query(updateQuery, queryParams);

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (soft delete, admin only)
async function deleteUserHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    // Check if user exists
    const existingQuery = `
      SELECT id FROM users 
      WHERE id = $1 AND is_active = true AND is_deleted = false
    `;
    const existingResult = await pool.query(existingQuery, [params.id]);

    if (existingResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cannot delete yourself
    if (params.id === request.user.userId) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 409 }
      );
    }

    // Check if user has active borrowings
    const borrowingsQuery = `
      SELECT COUNT(*) FROM borrowings 
      WHERE borrower_id = $1 AND status IN ('pending', 'approved') 
        AND is_active = true AND is_deleted = false
    `;
    const borrowingsResult = await pool.query(borrowingsQuery, [params.id]);

    if (Number.parseInt(borrowingsResult.rows[0].count) > 0) {
      return NextResponse.json(
        { error: "Cannot delete user with active borrowings" },
        { status: 409 }
      );
    }

    const deleteQuery = `
      UPDATE users SET
        is_deleted = true,
        updated_by = $1
      WHERE id = $2
    `;

    await pool.query(deleteQuery, [request.user.userId, params.id]);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(updateUserHandler);
export const DELETE = withAuth(deleteUserHandler, "admin");

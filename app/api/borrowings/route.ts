import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";

async function getBorrowingsHandler(request: NextRequest & { user: any }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    let whereClause = "WHERE b.is_active = true AND b.is_deleted = false";
    const queryParams: any[] = [];
    let paramCount = 0;

    if (request.user.role === "user") {
      paramCount++;
      whereClause += ` AND b.borrower_id = $${paramCount}`;
      queryParams.push(request.user.userId); // pastikan userId dari middleware
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (u.name ILIKE $${paramCount} OR i.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND b.status = $${paramCount}`;
      queryParams.push(status);
    }

    const countQuery = `
    SELECT COUNT(*) 
    FROM borrowings b
    JOIN users u ON b.borrower_id = u.id
    JOIN items i ON b.item_id = i.id
    ${whereClause}
  `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = Number.parseInt(countResult.rows[0].count);

    const borrowingsQuery = `
    SELECT 
      b.id, b.quantity, b.borrow_date, b.return_date, b.actual_return_date,
      b.purpose, b.status, b.borrowing_letter_file_ids, b.notes, b.approved_date,
      b.created_date, b.updated_date,
      u.id as borrower_id, u.name as borrower_name, u.email as borrower_email,
      u.phone as borrower_phone, u.whatsapp as borrower_whatsapp, u.student_id as borrower_student_id,
      i.id as item_id, i.name as item_name, i.code as item_code,
      approver.name as approved_by_name
    FROM borrowings b
    JOIN users u ON b.borrower_id = u.id
    JOIN items i ON b.item_id = i.id
    LEFT JOIN users approver ON b.approved_by = approver.id
    ${whereClause}
    ORDER BY b.created_date DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

    queryParams.push(limit, offset);
    const borrowingsResult = await pool.query(borrowingsQuery, queryParams);

    return NextResponse.json({
      borrowings: borrowingsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get borrowings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function createBorrowingHandler(request: NextRequest & { user: any }) {
  try {
    const body = await request.json();
    const {
      borrower_id,
      item_id,
      quantity,
      borrow_date,
      return_date,
      purpose,
      borrowing_letter_file_ids, // Changed from borrowing_letter_url to file_ids
    } = body;

    if (!item_id || !quantity || !borrow_date || !return_date || !purpose) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const actualBorrowerId =
      request.user.role === "user" ? request.user.userId : borrower_id;

    if (!actualBorrowerId) {
      return NextResponse.json(
        { error: "Borrower ID is required" },
        { status: 400 }
      );
    }

    const itemQuery = `
    SELECT id, name, available FROM items 
    WHERE id = $1 AND is_active = true AND is_deleted = false
  `;
    const itemResult = await pool.query(itemQuery, [item_id]);

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = itemResult.rows[0];
    if (item.available < quantity) {
      return NextResponse.json(
        { error: "Not enough items available" },
        { status: 409 }
      );
    }

    const borrowerQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND is_active = true AND is_deleted = false
  `;
    const borrowerResult = await pool.query(borrowerQuery, [actualBorrowerId]);

    if (borrowerResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      );
    }

    // Convert file IDs array to comma-separated string (same as items)
    const fileIdsString = Array.isArray(borrowing_letter_file_ids)
      ? borrowing_letter_file_ids.join(",")
      : borrowing_letter_file_ids || "";

    let borrowingStatus = "pending";
    let approvedBy = null;
    let approvedDate = null;

    if (request.user.role === "admin") {
      borrowingStatus = "approved";
      approvedBy = request.user.userId;
      approvedDate = new Date();

      await pool.query(
        `UPDATE items SET
        available = available - $1,
        borrowed = borrowed + $1,
        updated_by = $2
      WHERE id = $3`,
        [quantity, request.user.userId, item_id]
      );
    }

    const insertQuery = `
    INSERT INTO borrowings (
      borrower_id, item_id, quantity, borrow_date, return_date,
      purpose, borrowing_letter_file_ids, status, approved_by, approved_date, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

    const result = await pool.query(insertQuery, [
      actualBorrowerId,
      item_id,
      quantity,
      borrow_date,
      return_date,
      purpose,
      fileIdsString,
      borrowingStatus,
      approvedBy,
      approvedDate,
      request.user.userId,
    ]);

    // Update file references (same as items)
    if (
      borrowing_letter_file_ids &&
      Array.isArray(borrowing_letter_file_ids) &&
      borrowing_letter_file_ids.length > 0
    ) {
      const updateFileQuery = `
      UPDATE files SET 
        reference_table = 'borrowings',
        reference_id = $1,
        updated_by = $2,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = ANY($3) AND is_active = true AND is_deleted = false
    `;
      await pool.query(updateFileQuery, [
        result.rows[0].id,
        request.user.userId,
        borrowing_letter_file_ids,
      ]);
    }

    return NextResponse.json({ borrowing: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create borrowing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getBorrowingsHandler);
export const POST = withAuth(createBorrowingHandler);

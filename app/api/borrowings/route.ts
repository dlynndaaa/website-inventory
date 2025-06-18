import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";

// GET /api/borrowings - Get all borrowings
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

    // For regular users, only show their own borrowings
    if (request.user.role === "user") {
      paramCount++;
      whereClause += ` AND b.borrower_id = $${paramCount}`;
      queryParams.push(request.user.userId);
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

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM borrowings b
      JOIN users u ON b.borrower_id = u.id
      JOIN items i ON b.item_id = i.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = Number.parseInt(countResult.rows[0].count);

    // Get borrowings with pagination
    const borrowingsQuery = `
      SELECT 
        b.id, b.quantity, b.borrow_date, b.return_date, b.actual_return_date,
        b.purpose, b.status, b.borrowing_letter_url, b.notes, b.approved_date,
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

// POST /api/borrowings - Create new borrowing
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
      borrowing_letter_url,
    } = body;

    if (!item_id || !quantity || !borrow_date || !return_date || !purpose) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For regular users, they can only create borrowings for themselves
    const actualBorrowerId =
      request.user.role === "user" ? request.user.userId : borrower_id;

    if (!actualBorrowerId) {
      return NextResponse.json(
        { error: "Borrower ID is required" },
        { status: 400 }
      );
    }

    // Check if item exists and has enough available quantity
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

    // Check if borrower exists
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

    // Setelah validasi item dan borrower, tambahkan logik untuk auto-approve jika admin yang membuat
    let borrowingStatus = "pending";
    let approvedBy = null;
    let approvedDate = null;

    // Jika admin yang membuat peminjaman, langsung approve dan kurangi stok
    if (request.user.role === "admin") {
      borrowingStatus = "approved";
      approvedBy = request.user.userId;
      approvedDate = new Date();

      // Kurangi stok available dan tambah borrowed
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
        purpose, borrowing_letter_url, status, approved_by, approved_date, created_by
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
      borrowing_letter_url,
      borrowingStatus,
      approvedBy,
      approvedDate,
      request.user.userId,
    ]);

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

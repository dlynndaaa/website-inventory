import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";

// GET /api/borrowings/[id] - Get single borrowing
async function getBorrowingHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    const query = `
      SELECT 
        b.id, b.borrower_name, b.borrower_email, b.borrower_phone,
        b.item_id, i.name as item_name, i.code as item_code,
        b.quantity, b.borrow_date, b.return_date, b.actual_return_date,
        b.purpose, b.status, b.notes, b.borrowing_letter_file_ids,
        b.created_date, b.updated_date, b.created_by, b.updated_by
      FROM borrowings b
      LEFT JOIN items i ON b.item_id = i.id
      WHERE b.id = $1 AND b.is_active = true AND b.is_deleted = false
    `;

    const result = await pool.query(query, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Borrowing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ borrowing: result.rows[0] });
  } catch (error) {
    console.error("Get borrowing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/borrowings/[id] - Update borrowing
async function updateBorrowingHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes, actual_return_date, borrowing_letter_file_ids } =
      body;

    // Check if borrowing exists
    const existingQuery = `
      SELECT b.*, i.available, i.borrowed
      FROM borrowings b
      JOIN items i ON b.item_id = i.id
      WHERE b.id = $1 AND b.is_active = true AND b.is_deleted = false
    `;
    const existingResult = await pool.query(existingQuery, [params.id]);

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Borrowing not found" },
        { status: 404 }
      );
    }

    const borrowing = existingResult.rows[0];

    // Check permissions
    if (
      request.user.role === "user" &&
      borrowing.borrower_id !== request.user.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateFields = [];
    const queryParams = [];
    let paramCount = 0;

    if (status !== undefined) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      queryParams.push(status);

      // Jika status berubah dari pending ke approved, kurangi stok
      if (
        status === "approved" &&
        borrowing.status === "pending" &&
        request.user.role === "admin"
      ) {
        paramCount++;
        updateFields.push(`approved_by = $${paramCount}`);
        queryParams.push(request.user.userId);

        paramCount++;
        updateFields.push(`approved_date = $${paramCount}`);
        queryParams.push(new Date());

        // Update item quantities - kurangi available, tambah borrowed
        await pool.query(
          `UPDATE items SET
            available = available - $1,
            borrowed = borrowed + $1,
            updated_by = $2
          WHERE id = $3`,
          [borrowing.quantity, request.user.userId, borrowing.item_id]
        );
      }

      // Jika status berubah ke returned, kembalikan stok
      if (status === "returned" && borrowing.status === "approved") {
        await pool.query(
          `UPDATE items SET
            available = available + $1,
            borrowed = borrowed - $1,
            updated_by = $2
          WHERE id = $3`,
          [borrowing.quantity, request.user.userId, borrowing.item_id]
        );
      }

      // Jika status berubah dari approved ke rejected, kembalikan stok
      if (status === "rejected" && borrowing.status === "approved") {
        await pool.query(
          `UPDATE items SET
            available = available + $1,
            borrowed = borrowed - $1,
            updated_by = $2
          WHERE id = $3`,
          [borrowing.quantity, request.user.userId, borrowing.item_id]
        );
      }
    }

    if (notes !== undefined) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      queryParams.push(notes);
    }

    if (actual_return_date !== undefined) {
      paramCount++;
      updateFields.push(`actual_return_date = $${paramCount}`);
      queryParams.push(actual_return_date);
    }

    // Handle file IDs update (same as items)
    if (borrowing_letter_file_ids !== undefined) {
      paramCount++;
      updateFields.push(`borrowing_letter_file_ids = $${paramCount}`);
      const fileIdsString = Array.isArray(borrowing_letter_file_ids)
        ? borrowing_letter_file_ids.join(",")
        : borrowing_letter_file_ids || "";
      queryParams.push(fileIdsString);
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
      UPDATE borrowings SET
        ${updateFields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, queryParams);

    // Update file references (same as items)
    if (borrowing_letter_file_ids !== undefined) {
      // First, clear existing references for this borrowing
      await pool.query(
        `UPDATE files SET reference_table = NULL, reference_id = NULL 
         WHERE reference_table = 'borrowings' AND reference_id = $1`,
        [params.id]
      );

      // Then set new references if fileIds provided
      if (
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
          params.id,
          request.user.userId,
          borrowing_letter_file_ids,
        ]);
      }
    }

    return NextResponse.json({ borrowing: result.rows[0] });
  } catch (error) {
    console.error("Update borrowing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/borrowings/[id] - Delete borrowing (soft delete)
async function deleteBorrowingHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    // Check if borrowing exists
    const existingQuery = `
      SELECT b.*, i.name as item_name, u.name as borrower_name
      FROM borrowings b
      JOIN items i ON b.item_id = i.id
      JOIN users u ON b.borrower_id = u.id
      WHERE b.id = $1 AND b.is_active = true AND b.is_deleted = false
    `;
    const existingResult = await pool.query(existingQuery, [params.id]);

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Borrowing not found" },
        { status: 404 }
      );
    }

    const borrowing = existingResult.rows[0];

    // Check permissions - admin can delete any, user can only delete their own
    if (
      request.user.role === "user" &&
      borrowing.borrower_id !== request.user.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Admin can delete any status, but if approved status is deleted, need to return stock
    // User can only delete pending borrowings
    if (request.user.role === "user" && borrowing.status !== "pending") {
      return NextResponse.json(
        {
          error: "Users can only delete pending borrowings",
          currentStatus: borrowing.status,
        },
        { status: 409 }
      );
    }

    // If deleting an approved borrowing, return the stock
    if (borrowing.status === "approved") {
      await pool.query(
        `UPDATE items SET
          available = available + $1,
          borrowed = borrowed - $1,
          updated_by = $2
        WHERE id = $3`,
        [borrowing.quantity, request.user.userId, borrowing.item_id]
      );
    }

    const deleteQuery = `
      UPDATE borrowings SET
        is_deleted = true,
        updated_by = $1,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await pool.query(deleteQuery, [request.user.userId, params.id]);

    // Clear file references (same as items)
    await pool.query(
      `UPDATE files SET reference_table = NULL, reference_id = NULL 
       WHERE reference_table = 'borrowings' AND reference_id = $1`,
      [params.id]
    );

    return NextResponse.json({
      message: "Borrowing deleted successfully",
      deletedBorrowing: {
        id: borrowing.id,
        borrower: borrowing.borrower_name,
        item: borrowing.item_name,
        status: borrowing.status,
      },
    });
  } catch (error) {
    console.error("Delete borrowing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getBorrowingHandler);
export const PUT = withAuth(updateBorrowingHandler);
export const DELETE = withAuth(deleteBorrowingHandler);

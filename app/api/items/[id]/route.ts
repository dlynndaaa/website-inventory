import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";

// GET /api/items/[id] - Get single item
async function getItemHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const query = `
      SELECT id, code, name, quantity, available, borrowed, unit, category, 
             condition, description, file_ids, created_date, updated_date
      FROM items 
      WHERE id = $1 AND is_active = true AND is_deleted = false
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item: result.rows[0] });
  } catch (error) {
    console.error("Get item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/items/[id] - Update item
async function updateItemHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      code,
      name,
      quantity,
      unit,
      category,
      condition,
      description,
      fileIds,
    } = body;

    if (!code || !name || !quantity || !unit || !category || !condition) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if code already exists for other items
    const existingQuery = `
      SELECT id FROM items 
      WHERE code = $1 AND id != $2 AND is_active = true AND is_deleted = false
    `;
    const existingResult = await pool.query(existingQuery, [code, id]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Item code already exists" },
        { status: 409 }
      );
    }

    // Convert fileIds array to comma-separated string
    const fileIdsString = Array.isArray(fileIds)
      ? fileIds.join(",")
      : fileIds || "";

    const updateQuery = `
      UPDATE items SET 
        code = $1, name = $2, quantity = $3, unit = $4, category = $5, 
        condition = $6, description = $7, file_ids = $8, updated_by = $9,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $10 AND is_active = true AND is_deleted = false
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      code,
      name,
      quantity,
      unit,
      category,
      condition,
      description,
      fileIdsString,
      request.user.userId,
      id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update file references if fileIds provided
    if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
      // First, clear existing references for this item
      await pool.query(
        `UPDATE files SET reference_table = NULL, reference_id = NULL 
         WHERE reference_table = 'items' AND reference_id = $1`,
        [id]
      );

      // Then set new references
      const updateFileQuery = `
        UPDATE files SET 
          reference_table = 'items',
          reference_id = $1,
          updated_by = $2,
          updated_date = CURRENT_TIMESTAMP
        WHERE id = ANY($3) AND is_active = true AND is_deleted = false
      `;
      await pool.query(updateFileQuery, [id, request.user.userId, fileIds]);
    } else {
      // Clear all file references if no fileIds provided
      await pool.query(
        `UPDATE files SET reference_table = NULL, reference_id = NULL 
         WHERE reference_table = 'items' AND reference_id = $1`,
        [id]
      );
    }

    return NextResponse.json({ item: result.rows[0] });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete item
async function deleteItemHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if item is currently borrowed
    const borrowedQuery = `
      SELECT COUNT(*) FROM borrowings 
      WHERE item_id = $1 AND status IN ('pending', 'approved') AND is_active = true
    `;
    const borrowedResult = await pool.query(borrowedQuery, [id]);
    const borrowedCount = Number.parseInt(borrowedResult.rows[0].count);

    if (borrowedCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete item that is currently borrowed" },
        { status: 400 }
      );
    }

    // Soft delete the item
    const deleteQuery = `
      UPDATE items SET 
        is_deleted = true, 
        updated_by = $2,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = true AND is_deleted = false
      RETURNING *
    `;

    const result = await pool.query(deleteQuery, [id, request.user.userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Clear file references
    await pool.query(
      `UPDATE files SET reference_table = NULL, reference_id = NULL 
       WHERE reference_table = 'items' AND reference_id = $1`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getItemHandler);
export const PUT = withAuth(updateItemHandler);
export const DELETE = withAuth(deleteItemHandler);

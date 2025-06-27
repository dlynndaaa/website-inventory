import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";

// GET /api/items - Get all items
async function getItemsHandler(request: NextRequest & { user: any }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const offset = (page - 1) * limit;

    let whereClause = "WHERE is_active = true AND is_deleted = false";
    const queryParams: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR code ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      whereClause += ` AND category = $${paramCount}`;
      queryParams.push(category);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM items ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = Number.parseInt(countResult.rows[0].count);

    // Get items with pagination
    const itemsQuery = `
      SELECT id, code, name, quantity, available, borrowed, unit, category, 
             condition, description, file_ids, created_date, updated_date
      FROM items 
      ${whereClause}
      ORDER BY created_date DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const itemsResult = await pool.query(itemsQuery, queryParams);

    return NextResponse.json({
      items: itemsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/items - Create new item
async function createItemHandler(request: NextRequest & { user: any }) {
  try {
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

    // Check if code already exists
    const existingQuery = `
      SELECT id FROM items 
      WHERE code = $1 AND is_active = true AND is_deleted = false
    `;
    const existingResult = await pool.query(existingQuery, [code]);

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

    const insertQuery = `
      INSERT INTO items (
        code, name, quantity, available, borrowed, unit, category, condition,
        description, file_ids, created_by
      ) VALUES ($1, $2, $3, $3, 0, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      code,
      name,
      quantity,
      unit,
      category,
      condition,
      description,
      fileIdsString,
      request.user.userId,
    ]);

    // Update file references if fileIds provided
    if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
      const updateFileQuery = `
        UPDATE files SET 
          reference_table = 'items',
          reference_id = $1,
          updated_by = $2,
          updated_date = CURRENT_TIMESTAMP
        WHERE id = ANY($3) AND is_active = true AND is_deleted = false
      `;
      await pool.query(updateFileQuery, [
        result.rows[0].id,
        request.user.userId,
        fileIds,
      ]);
    }

    return NextResponse.json({ item: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getItemsHandler);
export const POST = withAuth(createItemHandler);

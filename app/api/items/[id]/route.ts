import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db/connection"
import { withAuth } from "@/lib/auth/middleware"

// GET /api/items/[id] - Get single item
async function getItemHandler(request: NextRequest & { user: any }, { params }: { params: { id: string } }) {
  try {
    const itemQuery = `
      SELECT id, code, name, quantity, available, borrowed, unit, category,
             condition, description, image_url, created_date, updated_date
      FROM items 
      WHERE id = $1 AND is_active = true AND is_deleted = false
    `

    const result = await pool.query(itemQuery, [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ item: result.rows[0] })
  } catch (error) {
    console.error("Get item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/items/[id] - Update item
async function updateItemHandler(request: NextRequest & { user: any }, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { code, name, quantity, unit, category, condition, description, image_url } = body

    // Check if item exists
    const existingQuery = `
      SELECT id, available, borrowed FROM items 
      WHERE id = $1 AND is_active = true AND is_deleted = false
    `
    const existingResult = await pool.query(existingQuery, [params.id])

    if (existingResult.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const currentItem = existingResult.rows[0]

    // Check if code is being changed and if new code already exists
    if (code) {
      const codeCheckQuery = `
        SELECT id FROM items 
        WHERE code = $1 AND id != $2 AND is_active = true AND is_deleted = false
      `
      const codeCheckResult = await pool.query(codeCheckQuery, [code, params.id])

      if (codeCheckResult.rows.length > 0) {
        return NextResponse.json({ error: "Item code already exists" }, { status: 409 })
      }
    }

    // Calculate new available quantity if total quantity changed
    const newAvailable = quantity ? quantity - currentItem.borrowed : currentItem.available

    const updateQuery = `
      UPDATE items SET
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        quantity = COALESCE($3, quantity),
        available = COALESCE($4, available),
        unit = COALESCE($5, unit),
        category = COALESCE($6, category),
        condition = COALESCE($7, condition),
        description = COALESCE($8, description),
        image_url = COALESCE($9, image_url),
        updated_by = $10
      WHERE id = $11
      RETURNING *
    `

    const result = await pool.query(updateQuery, [
      code,
      name,
      quantity,
      newAvailable,
      unit,
      category,
      condition,
      description,
      image_url,
      request.user.userId,
      params.id,
    ])

    return NextResponse.json({ item: result.rows[0] })
  } catch (error) {
    console.error("Update item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/items/[id] - Delete item (soft delete)
async function deleteItemHandler(request: NextRequest & { user: any }, { params }: { params: { id: string } }) {
  try {
    // Check if item exists and has no active borrowings
    const checkQuery = `
      SELECT i.id, COUNT(b.id) as active_borrowings
      FROM items i
      LEFT JOIN borrowings b ON i.id = b.item_id 
        AND b.status IN ('approved', 'pending') 
        AND b.is_active = true 
        AND b.is_deleted = false
      WHERE i.id = $1 AND i.is_active = true AND i.is_deleted = false
      GROUP BY i.id
    `

    const checkResult = await pool.query(checkQuery, [params.id])

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (Number.parseInt(checkResult.rows[0].active_borrowings) > 0) {
      return NextResponse.json({ error: "Cannot delete item with active borrowings" }, { status: 409 })
    }

    const deleteQuery = `
      UPDATE items SET
        is_deleted = true,
        updated_by = $1
      WHERE id = $2
    `

    await pool.query(deleteQuery, [request.user.userId, params.id])

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Delete item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getItemHandler)
export const PUT = withAuth(updateItemHandler)
export const DELETE = withAuth(deleteItemHandler)

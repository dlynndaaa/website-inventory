import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET /api/files/[id] - Get single file metadata
async function getFileHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const query = `
      SELECT id, original_name, file_name, file_path, file_size, mime_type,
             folder, file_type, reference_table, reference_id, created_date
      FROM files 
      WHERE id = $1 AND is_active = true AND is_deleted = false AND status = 'active'
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ file: result.rows[0] });
  } catch (error) {
    console.error("Get file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/files/[id] - Delete file
async function deleteFileHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get file info first
    const getQuery = `
      SELECT file_path, file_name FROM files 
      WHERE id = $1 AND is_active = true AND is_deleted = false
    `;
    const fileResult = await pool.query(getQuery, [id]);

    if (fileResult.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = fileResult.rows[0];

    // Mark file as deleted in database
    const deleteQuery = `
      UPDATE files SET 
        is_deleted = true, 
        status = 'deleted',
        updated_by = $2,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await pool.query(deleteQuery, [id, request.user.userId]);

    // Try to delete physical file
    try {
      const filePath = join(process.cwd(), file.file_path);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (fileError) {
      console.error("Error deleting physical file:", fileError);
      // Don't fail the request if physical file deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getFileHandler);
export const DELETE = withAuth(deleteFileHandler);

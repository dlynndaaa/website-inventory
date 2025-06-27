import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// GET /api/files/download/[id] - Download file
async function downloadFileHandler(
  request: NextRequest & { user: any },
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get file info from database
    const query = `
      SELECT original_name, file_name, file_path, mime_type, file_size
      FROM files 
      WHERE id = $1 AND is_active = true AND is_deleted = false AND status = 'active'
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = result.rows[0];
    const filePath = join(process.cwd(), file.file_path);

    // Check if physical file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "Physical file not found" },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": file.mime_type,
        "Content-Length": file.file_size.toString(),
        "Content-Disposition": `inline; filename="${file.original_name}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Download file error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(downloadFileHandler);

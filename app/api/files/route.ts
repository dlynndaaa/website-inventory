import { type NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/connection";
import { withAuth } from "@/lib/auth/middleware";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// POST /api/files - Upload files and store metadata
async function uploadFilesHandler(request: NextRequest & { user: any }) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    const folder = (formData.get("folder") as string) || "general";
    const referenceTable = (formData.get("referenceTable") as string) || null;
    const referenceId = (formData.get("referenceId") as string) || null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadResults = [];

    for (const file of files) {
      try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split(".").pop();
        const fileName = `${timestamp}-${randomString}.${fileExtension}`;

        // Determine file type
        const mimeType = file.type;
        let fileType = "other";
        if (mimeType.startsWith("image/")) {
          fileType = "image";
        } else if (
          mimeType === "application/pdf" ||
          mimeType.startsWith("text/")
        ) {
          fileType = "document";
        }

        // Create upload directory
        const uploadDir = join(process.cwd(), "uploads", folder);
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        // Save file to disk
        const filePath = join(uploadDir, fileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Store file metadata in database
        const insertQuery = `
          INSERT INTO files (
            original_name, file_name, file_path, file_size, mime_type, 
            folder, file_type, reference_table, reference_id, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `;

        const result = await pool.query(insertQuery, [
          file.name,
          fileName,
          `uploads/${folder}/${fileName}`,
          file.size,
          mimeType,
          folder,
          fileType,
          referenceTable,
          referenceId,
          request.user.userId,
        ]);

        uploadResults.push({
          success: true,
          file: result.rows[0],
        });
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        uploadResults.push({
          success: false,
          fileName: file.name,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }

    return NextResponse.json({ results: uploadResults });
  } catch (error) {
    console.error("Upload files error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/files - Get files by reference or query
async function getFilesHandler(request: NextRequest & { user: any }) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceTable = searchParams.get("referenceTable");
    const referenceId = searchParams.get("referenceId");
    const fileIds = searchParams.get("fileIds");

    let query = `
      SELECT id, original_name, file_name, file_path, file_size, mime_type,
             folder, file_type, reference_table, reference_id, created_date
      FROM files 
      WHERE is_active = true AND is_deleted = false AND status = 'active'
    `;
    const queryParams: any[] = [];

    if (fileIds) {
      const ids = fileIds.split(",").filter((id) => id.trim());
      if (ids.length > 0) {
        query += ` AND id = ANY($1)`;
        queryParams.push(ids);
      }
    } else if (referenceTable && referenceId) {
      query += ` AND reference_table = $1 AND reference_id = $2`;
      queryParams.push(referenceTable, referenceId);
    }

    query += ` ORDER BY created_date DESC`;

    const result = await pool.query(query, queryParams);

    return NextResponse.json({ files: result.rows });
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(uploadFilesHandler);
export const GET = withAuth(getFilesHandler);

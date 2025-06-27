import { type NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { withAuth } from "@/lib/auth/middleware";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

async function deleteFileHandler(
  request: NextRequest & { user: any },
  { params }: { params: { filename: string } }
) {
  try {
    const fileName = decodeURIComponent(params.filename);
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check if file path is within upload directory (security check)
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);

    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export const DELETE = withAuth(deleteFileHandler);

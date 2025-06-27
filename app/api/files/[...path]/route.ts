import { type NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join("/");
    const fullPath = path.join(UPLOAD_DIR, filePath);

    console.log("📁 Requested file path:", filePath);
    console.log("📍 Full file path:", fullPath);
    console.log("📂 Upload directory:", UPLOAD_DIR);

    // Security check - ensure file is within upload directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);

    console.log("🔒 Resolved path:", resolvedPath);
    console.log("🔒 Resolved upload dir:", resolvedUploadDir);

    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      console.log("❌ Invalid file path - security check failed");
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    if (!existsSync(fullPath)) {
      console.log("❌ File not found:", fullPath);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    console.log("✅ File exists, reading...");

    const fileStats = await stat(fullPath);
    const fileBuffer = await readFile(fullPath);

    console.log("📊 File stats:", {
      size: fileStats.size,
      modified: fileStats.mtime,
    });

    // Get MIME type based on extension
    const extension = path.extname(fullPath).toLowerCase();
    let mimeType = "application/octet-stream";

    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
    };

    if (mimeTypes[extension]) {
      mimeType = mimeTypes[extension];
    }

    console.log("🎭 MIME type:", mimeType);

    // Check if download is requested
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";

    console.log("⬇️ Is download:", isDownload);

    // Get original filename from path
    const fileName = path.basename(fullPath);

    const headers = new Headers({
      "Content-Type": mimeType,
      "Content-Length": fileStats.size.toString(),
      "Cache-Control": "public, max-age=31536000", // Cache for 1 year
    });

    if (isDownload) {
      headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
    } else {
      // For images and PDFs, allow inline viewing
      if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
        headers.set("Content-Disposition", `inline; filename="${fileName}"`);
      } else {
        headers.set(
          "Content-Disposition",
          `attachment; filename="${fileName}"`
        );
      }
    }

    console.log("✅ Serving file successfully");

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("💥 File serve error:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}

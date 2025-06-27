import { type NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { withAuth } from "@/lib/auth/middleware";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg", // Images
  ".pdf",
  ".doc",
  ".docx",
  ".txt", // Documents
  ".zip",
  ".rar", // Archives
];

async function uploadHandler(request: NextRequest & { user: any }) {
  try {
    console.log("📤 Upload request received");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    console.log("📁 Upload folder:", folder);
    console.log("📄 File name:", file?.name);
    console.log("📏 File size:", file?.size);

    if (!file) {
      console.log("❌ No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log("❌ File too large:", file.size);
      return NextResponse.json(
        { error: "File size exceeds 25MB limit" },
        { status: 400 }
      );
    }

    // Validate file extension
    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      console.log("❌ Invalid file type:", extension);
      return NextResponse.json(
        {
          error: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadPath = path.join(UPLOAD_DIR, folder);
    console.log("📍 Upload path:", uploadPath);

    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
      console.log("✅ Created upload directory:", uploadPath);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}${extension}`;
    const filePath = path.join(uploadPath, fileName);

    console.log("💾 Saving file to:", filePath);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log("✅ File saved successfully");

    // Return file info
    const fileUrl = `/api/files/${folder}/${fileName}`;
    const fullFileName = `${folder}/${fileName}`;

    const response = {
      success: true,
      fileName: fullFileName,
      fileUrl,
      originalName: file.name,
      size: file.size,
      type: file.type,
    };

    console.log("📤 Upload response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("💥 Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export const POST = withAuth(uploadHandler);

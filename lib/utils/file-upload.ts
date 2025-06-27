export interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  originalName?: string;
  size?: number;
  type?: string;
  error?: string;
}

export class FileUploadService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  static async uploadFile(
    file: File,
    folder = "general"
  ): Promise<UploadResponse> {
    try {
      console.log("🚀 Starting file upload:", file.name);
      console.log("📁 Upload folder:", folder);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      console.log("📤 Sending upload request...");

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      console.log("📥 Upload response status:", response.status);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Upload failed" }));
        console.log("❌ Upload failed:", error);
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      console.log("✅ Upload successful:", result);

      return result;
    } catch (error) {
      console.error("💥 Upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  static async uploadMultipleFiles(
    files: File[],
    folder = "general"
  ): Promise<UploadResponse[]> {
    console.log("📤 Uploading multiple files:", files.length);
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  static async deleteFile(
    fileName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Deleting file:", fileName);

      const response = await fetch(
        `${this.baseUrl}/upload/${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Delete failed" }));
        throw new Error(error.error || "Delete failed");
      }

      console.log("✅ File deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("💥 Delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      };
    }
  }

  static getFileUrl(fileName: string): string {
    const url = `${this.baseUrl}/files/${fileName}`;
    console.log("🔗 Generated file URL:", url);
    return url;
  }

  static getDownloadUrl(fileName: string): string {
    const url = `${this.baseUrl}/files/${fileName}?download=true`;
    console.log("⬇️ Generated download URL:", url);
    return url;
  }

  static isImageFile(fileName: string): boolean {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const extension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf("."));
    return imageExtensions.includes(extension);
  }

  static isPdfFile(fileName: string): boolean {
    return fileName.toLowerCase().endsWith(".pdf");
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }
}

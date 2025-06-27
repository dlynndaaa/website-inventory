export interface UploadResponse {
  success: boolean;
  file?: {
    id: string;
    original_name: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    folder: string;
    file_type: string;
  };
  fileName?: string;
  error?: string;
}

export interface FileData {
  id: string;
  original_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  folder: string;
  file_type: string;
  created_date: string;
}

export class FileUploadService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  static async uploadFile(
    file: File,
    folder = "general",
    referenceTable?: string,
    referenceId?: string
  ): Promise<UploadResponse> {
    try {
      console.log("🚀 Starting file upload:", file.name);
      console.log("📁 Upload folder:", folder);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      if (referenceTable) formData.append("referenceTable", referenceTable);
      if (referenceId) formData.append("referenceId", referenceId);

      console.log("📤 Sending upload request...");

      const response = await fetch(`${this.baseUrl}/files`, {
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

      // Return the first successful upload
      const successfulUpload = result.results?.find((r: any) => r.success);
      if (successfulUpload) {
        return {
          success: true,
          file: successfulUpload.file,
        };
      } else {
        throw new Error("Upload failed");
      }
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
    folder = "general",
    referenceTable?: string,
    referenceId?: string
  ): Promise<UploadResponse[]> {
    console.log("📤 Uploading multiple files:", files.length);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("file", file));
      formData.append("folder", folder);
      if (referenceTable) formData.append("referenceTable", referenceTable);
      if (referenceId) formData.append("referenceId", referenceId);

      const response = await fetch(`${this.baseUrl}/files`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      return result.results.map((r: any) => ({
        success: r.success,
        file: r.file,
        error: r.error,
      }));
    } catch (error) {
      console.error("💥 Multiple upload error:", error);
      return files.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }));
    }
  }

  static async getFiles(fileIds: string[]): Promise<FileData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/files?fileIds=${fileIds.join(",")}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get files");
      }

      const result = await response.json();
      return result.files || [];
    } catch (error) {
      console.error("💥 Get files error:", error);
      return [];
    }
  }

  static async getFile(fileId: string): Promise<FileData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.file;
    } catch (error) {
      console.error("💥 Get file error:", error);
      return null;
    }
  }

  static async deleteFile(
    fileId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Deleting file:", fileId);

      const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });

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

  static getFileUrl(fileId: string): string {
    return `${this.baseUrl}/files/download/${fileId}`;
  }

  static getDownloadUrl(fileId: string): string {
    return `${this.baseUrl}/files/download/${fileId}`;
  }

  static getPreviewUrl(fileId: string): string {
    return `${this.baseUrl}/files/download/${fileId}`;
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

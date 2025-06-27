"use client";

import type React from "react";

import { useState, useCallback } from "react";
import {
  Upload,
  File,
  ImageIcon,
  FileText,
  Download,
  Eye,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileUploadService,
  type UploadResponse,
} from "@/lib/utils/file-upload";

interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  fileName: string;
}

interface EnhancedFileUploadProps {
  onFileUpload?: (files: UploadedFile[]) => void;
  onFileRemove?: (fileId: string) => void;
  maxSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  folder?: string;
  initialFiles?: UploadedFile[];
  className?: string;
  showPreview?: boolean;
}

export function EnhancedFileUpload({
  onFileUpload,
  onFileRemove,
  maxSize = 25,
  accept = "*/*",
  multiple = false,
  disabled = false,
  folder = "general",
  initialFiles = [],
  className,
  showPreview = true,
}: EnhancedFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    initialFiles || []
  );
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || uploading) return;

      console.log("📁 Processing files:", files.length);

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        if (file.size > maxSize * 1024 * 1024) {
          alert(
            `File ${file.name} is too large. Maximum size is ${maxSize}MB.`
          );
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      console.log("✅ Valid files:", validFiles.length);

      setUploading(true);
      try {
        const uploadResults = await FileUploadService.uploadMultipleFiles(
          validFiles,
          folder
        );

        console.log("📤 Upload results:", uploadResults);

        const successfulUploads: UploadedFile[] = uploadResults
          .filter(
            (result): result is UploadResponse & { success: true } =>
              result?.success === true
          )
          .map((result, index) => ({
            id: crypto.randomUUID(),
            name: result.fileName ?? "unknown",
            originalName:
              result.originalName ?? validFiles[index]?.name ?? "unknown",
            size: result.size ?? validFiles[index]?.size ?? 0,
            type: result.type ?? validFiles[index]?.type ?? "unknown",
            url: result.fileUrl ?? "#",
            fileName: result.fileName ?? "unknown",
          }));

        console.log("✅ Successful uploads:", successfulUploads);

        const newFiles = multiple
          ? [...uploadedFiles, ...successfulUploads]
          : successfulUploads;
        setUploadedFiles(newFiles);
        onFileUpload?.(newFiles);

        // Show errors for failed uploads
        uploadResults.forEach((result, index) => {
          if (!result?.success) {
            console.error("❌ Upload failed:", result?.error);
            alert(
              `Failed to upload ${validFiles[index]?.name ?? "file"}: ${
                result?.error ?? "Unknown error"
              }`
            );
          }
        });
      } catch (error) {
        console.error("💥 Upload error:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [maxSize, multiple, uploadedFiles, onFileUpload, folder, uploading]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled || uploading) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, uploading, handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (disabled || uploading) return;
      handleFiles(e.target.files);
    },
    [disabled, uploading, handleFiles]
  );

  const removeFile = async (fileId: string) => {
    const fileToRemove = uploadedFiles.find((f) => f.id === fileId);
    if (!fileToRemove) return;

    console.log("🗑️ Removing file:", fileToRemove.fileName);

    try {
      await FileUploadService.deleteFile(fileToRemove.fileName);
      const newFiles = uploadedFiles.filter((f) => f.id !== fileId);
      setUploadedFiles(newFiles);
      onFileRemove?.(fileId);
      onFileUpload?.(newFiles);
    } catch (error) {
      console.error("💥 Delete error:", error);
      alert("Failed to delete file");
    }
  };

  const getFileIcon = (fileName: string, type: string) => {
    if (FileUploadService.isImageFile(fileName)) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    } else if (FileUploadService.isPdfFile(fileName)) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const previewFile = (file: UploadedFile) => {
    console.log("👁️ Previewing file:", file.url);
    const link = document.createElement("a");
    link.href = file.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFile = (file: UploadedFile) => {
    console.log("⬇️ Downloading file:", file.fileName);
    const downloadUrl =
      FileUploadService.getDownloadUrl?.(file.fileName) ?? "#";
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300",
          disabled || uploading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-gray-400"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() =>
          !disabled &&
          !uploading &&
          document.getElementById("file-upload")?.click()
        }
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          disabled={disabled || uploading}
        />
        <div className="text-center">
          <Upload
            className={cn(
              "mx-auto h-12 w-12",
              uploading ? "animate-pulse text-blue-500" : "text-gray-400"
            )}
          />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {uploading ? (
                "Uploading..."
              ) : (
                <>
                  <span className="font-medium text-blue-600">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (Max. file size {maxSize} MB)
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getFileIcon(file.name, file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {file.originalName ?? "unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {FileUploadService.formatFileSize(file.size ?? 0)}
                  </p>
                  <p className="text-xs text-blue-500">{file.url ?? "#"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {showPreview &&
                  (FileUploadService.isImageFile(file.name) ||
                    FileUploadService.isPdfFile(file.name)) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => previewFile(file)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(file)}
                  className="text-green-600 hover:text-green-800"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

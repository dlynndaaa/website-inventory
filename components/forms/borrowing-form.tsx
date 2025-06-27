"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedFileUpload } from "@/components/ui/enhanced-file-upload";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X, Search } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Input } from "@/components/ui/input";

interface BorrowingFormData {
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  borrowerStudentId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  borrowDate: Date;
  returnDate: Date;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "returned";
  borrowingLetterFileIds: string[]; // Changed from borrowingLetterFiles to fileIds
}

interface Borrower {
  id: string;
  name: string;
  email: string;
  student_id: string;
  study_program: string;
  faculty: string;
  whatsapp: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  student_id?: string;
  whatsapp?: string;
}

interface BorrowingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit" | "view";
  initialData?: Partial<BorrowingFormData>;
  onSubmit?: (data: BorrowingFormData) => void;
  title?: string;
  availableItems?: Array<{ id: string; name: string; available: number }>;
  borrowers?: Borrower[];
  currentUser?: CurrentUser;
}

const statusOptions = [
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "returned", label: "Dikembalikan" },
];

export function BorrowingForm({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  title,
  availableItems = [],
  borrowers = [],
  currentUser,
}: BorrowingFormProps) {
  const [formData, setFormData] = useState<BorrowingFormData>({
    borrowerId: "",
    borrowerName: "",
    borrowerEmail: "",
    borrowerPhone: "",
    borrowerStudentId: "",
    itemId: "",
    itemName: "",
    quantity: 1,
    borrowDate: new Date(),
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    purpose: "",
    status: "pending",
    borrowingLetterFileIds: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [borrowerSearch, setBorrowerSearch] = useState("");

  const isReadOnly = mode === "view";
  const isUserRole = currentUser?.role === "user";
  const formTitle =
    title ||
    (mode === "add"
      ? "Tambah Peminjaman"
      : mode === "edit"
      ? "Edit Peminjaman"
      : "Detail Peminjaman");

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        borrowDate: initialData.borrowDate || new Date(),
        returnDate:
          initialData.returnDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        borrowingLetterFileIds: initialData.borrowingLetterFileIds || [],
      }));
    } else {
      // Auto-fill current user data for user role
      const defaultData: BorrowingFormData = {
        borrowerId: "",
        borrowerName: "",
        borrowerEmail: "",
        borrowerPhone: "",
        borrowerStudentId: "",
        itemId: "",
        itemName: "",
        quantity: 1,
        borrowDate: new Date(),
        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        purpose: "",
        status: "pending",
        borrowingLetterFileIds: [],
      };

      if (isUserRole && currentUser) {
        defaultData.borrowerId = currentUser.id;
        defaultData.borrowerName = currentUser.name;
        defaultData.borrowerEmail = currentUser.email;
        defaultData.borrowerPhone = currentUser.whatsapp || "";
        defaultData.borrowerStudentId = currentUser.student_id || "";
      }

      setFormData(defaultData);
    }
    setErrors({});
  }, [initialData, open, currentUser, isUserRole]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.borrowerId) newErrors.borrowerId = "Peminjam harus dipilih";
    if (!formData.itemId) newErrors.itemId = "Barang harus dipilih";
    if (!formData.purpose.trim())
      newErrors.purpose = "Tujuan peminjaman harus diisi";
    if (formData.returnDate <= formData.borrowDate) {
      newErrors.returnDate = "Tanggal kembali harus setelah tanggal pinjam";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSave = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      onSubmit?.(formData);
      setShowConfirmation(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving borrowing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BorrowingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBorrowerChange = (borrowerId: string) => {
    const selectedBorrower = borrowers.find(
      (borrower) => borrower.id === borrowerId
    );
    if (selectedBorrower) {
      setFormData((prev) => ({
        ...prev,
        borrowerId,
        borrowerName: selectedBorrower.name,
        borrowerEmail: selectedBorrower.email,
        borrowerPhone: selectedBorrower.whatsapp,
        borrowerStudentId: selectedBorrower.student_id,
      }));
    }
  };

  const handleItemChange = (itemId: string) => {
    const selectedItem = availableItems.find((item) => item.id === itemId);
    setFormData((prev) => ({
      ...prev,
      itemId,
      itemName: selectedItem?.name || "",
      quantity: Math.min(prev.quantity, selectedItem?.available || 1),
    }));
  };

  // Handle file upload - same pattern as items
  const handleFileUpload = useCallback((uploadedFiles: any[]) => {
    console.log("📄 Files uploaded:", uploadedFiles);
    const fileIds = uploadedFiles.map((file) => file.id);
    setFormData((prev) => ({
      ...prev,
      borrowingLetterFileIds: fileIds,
    }));
  }, []);

  // Handle file removal - same pattern as items
  const handleFileRemove = useCallback((fileId: string) => {
    console.log("🗑️ Removing file:", fileId);
    setFormData((prev) => ({
      ...prev,
      borrowingLetterFileIds: prev.borrowingLetterFileIds.filter(
        (id) => id !== fileId
      ),
    }));
  }, []);

  const selectedItem = availableItems.find(
    (item) => item.id === formData.itemId
  );
  const maxQuantity = selectedItem?.available || 1;

  // Filter borrowers based on search
  const filteredBorrowers = borrowers.filter(
    (borrower) =>
      borrower.name.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
      borrower.email.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
      borrower.student_id.toLowerCase().includes(borrowerSearch.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {formTitle}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Borrower Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Peminjam
              </h3>

              {mode === "add" && !isUserRole ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Pilih Peminjam <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        value={formData.borrowerId}
                        onValueChange={handleBorrowerChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih peminjam" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Cari peminjam..."
                                value={borrowerSearch}
                                onChange={(e) =>
                                  setBorrowerSearch(e.target.value)
                                }
                                className="pl-8"
                              />
                            </div>
                          </div>
                          {filteredBorrowers.map((borrower) => (
                            <SelectItem key={borrower.id} value={borrower.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {borrower.name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {borrower.student_id} - {borrower.email}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          {filteredBorrowers.length === 0 && (
                            <div className="p-2 text-sm text-gray-500">
                              Tidak ada peminjam ditemukan
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.borrowerId && (
                        <p className="text-sm text-red-600">
                          {errors.borrowerId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Display selected borrower info */}
                  {formData.borrowerId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nama Lengkap
                        </label>
                        <p className="text-sm text-gray-900">
                          {formData.borrowerName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          NIM
                        </label>
                        <p className="text-sm text-gray-900">
                          {formData.borrowerStudentId}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <p className="text-sm text-gray-900">
                          {formData.borrowerEmail}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          WhatsApp
                        </label>
                        <p className="text-sm text-gray-900">
                          {formData.borrowerPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Nama Peminjam"
                    value={formData.borrowerName}
                    disabled={true}
                  />
                  <FormField
                    label="Email"
                    value={formData.borrowerEmail}
                    disabled={true}
                  />
                  <FormField
                    label="NIM"
                    value={formData.borrowerStudentId}
                    disabled={true}
                  />
                  <FormField
                    label="WhatsApp"
                    value={formData.borrowerPhone}
                    disabled={true}
                  />
                </div>
              )}
            </div>

            {/* Item Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Barang
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pilih Barang <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.itemId}
                    onValueChange={handleItemChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Tersedia: {item.available})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.itemId && (
                    <p className="text-sm text-red-600">{errors.itemId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.quantity.toString()}
                    onValueChange={(value) =>
                      handleInputChange("quantity", Number.parseInt(value))
                    }
                    disabled={isReadOnly || !formData.itemId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(
                        (qty) => (
                          <SelectItem key={qty} value={qty.toString()}>
                            {qty}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Tanggal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Pinjam <span className="text-red-500">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                        disabled={isReadOnly}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.borrowDate
                          ? format(formData.borrowDate, "dd/MM/yyyy", {
                              locale: id,
                            })
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.borrowDate}
                        onSelect={(date) =>
                          date && handleInputChange("borrowDate", date)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Kembali <span className="text-red-500">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                        disabled={isReadOnly}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.returnDate
                          ? format(formData.returnDate, "dd/MM/yyyy", {
                              locale: id,
                            })
                          : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.returnDate}
                        onSelect={(date) =>
                          date && handleInputChange("returnDate", date)
                        }
                        initialFocus
                        disabled={(date) => date <= formData.borrowDate}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.returnDate && (
                    <p className="text-sm text-red-600">{errors.returnDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Tambahan
              </h3>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tujuan Peminjaman <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Jelaskan tujuan peminjaman"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  disabled={isReadOnly}
                />
                {errors.purpose && (
                  <p className="text-sm text-red-600">{errors.purpose}</p>
                )}
              </div>

              {mode === "edit" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* File Upload Section - Same as Items */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Surat Peminjaman
                </label>
                <EnhancedFileUpload
                  onFileUpload={handleFileUpload}
                  onFileRemove={handleFileRemove}
                  accept=".pdf,.doc,.docx,.txt"
                  multiple={true}
                  maxSize={10}
                  folder="borrowing-letters"
                  disabled={isReadOnly}
                  initialFileIds={formData.borrowingLetterFileIds}
                  showPreview={true}
                  referenceTable="borrowings"
                  referenceId={
                    mode === "edit" ? initialData?.borrowerId : undefined
                  }
                />
                <p className="text-xs text-gray-500">
                  Upload surat peminjaman dalam format PDF, DOC, DOCX, atau TXT.
                  Maksimal 10MB per file.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {isReadOnly ? "Tutup" : "Batal"}
              </Button>
              {!isReadOnly && (
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title="Konfirmasi Simpan"
        description={`Apakah Anda yakin ingin ${
          mode === "add" ? "menambah" : "mengubah"
        } data peminjaman ini?`}
        confirmText="Ya, Simpan"
        cancelText="Batal"
        onConfirm={handleConfirmSave}
      />
    </>
  );
}

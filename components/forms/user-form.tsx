"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Camera, X } from "lucide-react";

interface UserFormData {
  name: string;
  email: string;
  role: "admin" | "user";
  // Admin fields
  employee_id?: string;
  work_unit?: string;
  phone?: string;
  // User fields
  student_id?: string;
  study_program?: string;
  faculty?: string;
  whatsapp?: string;
  // Common fields
  password?: string;
  confirm_password?: string;
  avatar?: string;
  status: "active" | "inactive";
}

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit" | "view";
  initialData?: Partial<UserFormData>;
  onSubmit?: (data: UserFormData) => void;
  title?: string;
}

const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "user", label: "User" },
];

const workUnitOptions = [
  { value: "teknik-informatika", label: "Teknik Informatika" },
  { value: "sistem-informasi", label: "Sistem Informasi" },
  { value: "teknik-komputer", label: "Teknik Komputer" },
];

const studyProgramOptions = [
  { value: "teknik-informatika", label: "Teknik Informatika" },
  { value: "sistem-informasi", label: "Sistem Informasi" },
  { value: "teknik-komputer", label: "Teknik Komputer" },
  { value: "manajemen-informatika", label: "Manajemen Informatika" },
];

const facultyOptions = [
  { value: "teknik", label: "Fakultas Teknik" },
  { value: "ilmu-komputer", label: "Fakultas Ilmu Komputer" },
  { value: "sains-teknologi", label: "Fakultas Sains dan Teknologi" },
];

const statusOptions = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Tidak Aktif" },
];

export function UserForm({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  title,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "user",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isReadOnly = mode === "view";
  const isEdit = mode === "edit";
  const formTitle =
    title ||
    (mode === "add"
      ? "Tambah Pengguna"
      : mode === "edit"
      ? "Edit Pengguna"
      : "Detail Pengguna");

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    } else {
      setFormData({
        name: "",
        email: "",
        role: "user",
        status: "active",
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nama lengkap harus diisi";
    if (!formData.email.trim()) newErrors.email = "Email harus diisi";
    if (!formData.role) newErrors.role = "Role harus dipilih";

    // Validate based on role
    if (formData.role === "admin") {
      if (!formData.employee_id?.trim())
        newErrors.employee_id = "ID Pegawai harus diisi";
      if (!formData.work_unit) newErrors.work_unit = "Unit kerja harus dipilih";
      if (!formData.phone?.trim())
        newErrors.phone = "Nomor telepon harus diisi";
    } else {
      if (!formData.student_id?.trim())
        newErrors.student_id = "NIM harus diisi";
      if (!formData.study_program)
        newErrors.study_program = "Program studi harus dipilih";
      if (!formData.faculty) newErrors.faculty = "Fakultas harus dipilih";
      if (!formData.whatsapp?.trim())
        newErrors.whatsapp = "Nomor WhatsApp harus diisi";
    }

    // Password validation for new users
    if (mode === "add") {
      if (!formData.password?.trim())
        newErrors.password = "Password harus diisi";
      if (formData.password && formData.password.length < 8) {
        newErrors.password = "Password minimal 8 karakter";
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Konfirmasi password tidak cocok";
      }
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
      console.error("Error saving user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRoleChange = (role: "admin" | "user") => {
    setFormData((prev) => ({
      ...prev,
      role,
      // Clear role-specific fields when role changes
      employeeId: "",
      workUnit: "",
      phone: "",
      studentId: "",
      studyProgram: "",
      faculty: "",
      whatsapp: "",
    }));
  };

  const handleAvatarChange = () => {
    console.log("Change avatar clicked");
  };

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
            {/* Profile Section */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={formData.avatar || "/placeholder.svg"}
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-blue-500 text-white text-lg">
                    {formData.name.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleAvatarChange}
                    className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {formData.name || "Nama Pengguna"}
                </h3>
                <p className="text-gray-600">
                  {formData.email || "email@example.com"}
                </p>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleAvatarChange}
                    className="text-blue-600 hover:text-blue-800 text-sm mt-1 transition-colors"
                  >
                    Ubah Foto
                  </button>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Nama Lengkap"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={errors.name}
                  disabled={isReadOnly}
                  required
                />

                <FormField
                  label="Email"
                  type="email"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={errors.email}
                  disabled={isReadOnly}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
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
              </div>
            </div>

            {/* Role-specific Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {formData.role === "admin"
                  ? "Informasi Pegawai"
                  : "Informasi Mahasiswa"}
              </h3>

              {formData.role === "admin" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="ID Pegawai"
                    placeholder="Masukkan ID pegawai"
                    value={formData.employee_id || ""}
                    onChange={(e) =>
                      handleInputChange("employee_id", e.target.value)
                    }
                    error={errors.employee_id}
                    disabled={isReadOnly}
                    required
                  />

                  <FormField
                    label="Nomor Telepon"
                    placeholder="Masukkan nomor telepon"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    error={errors.phone}
                    disabled={isReadOnly}
                    required
                  />

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Unit Kerja <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.work_unit || ""}
                      onValueChange={(value) =>
                        handleInputChange("work_unit", value)
                      }
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih unit kerja" />
                      </SelectTrigger>
                      <SelectContent>
                        {workUnitOptions.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.workUnit && (
                      <p className="text-sm text-red-600">{errors.workUnit}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="NIM"
                    placeholder="Masukkan NIM"
                    value={formData.student_id || ""}
                    onChange={(e) =>
                      handleInputChange("student_id", e.target.value)
                    }
                    error={errors.student_id}
                    disabled={isReadOnly}
                    required
                  />

                  <FormField
                    label="Nomor WhatsApp"
                    placeholder="Masukkan nomor WhatsApp"
                    value={formData.whatsapp || ""}
                    onChange={(e) =>
                      handleInputChange("whatsapp", e.target.value)
                    }
                    error={errors.whatsapp}
                    disabled={isReadOnly}
                    required
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Program Studi <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.study_program || ""}
                      onValueChange={(value) =>
                        handleInputChange("study_program", value)
                      }
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program studi" />
                      </SelectTrigger>
                      <SelectContent>
                        {studyProgramOptions.map((program) => (
                          <SelectItem key={program.value} value={program.value}>
                            {program.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.studyProgram && (
                      <p className="text-sm text-red-600">
                        {errors.studyProgram}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fakultas <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.faculty || ""}
                      onValueChange={(value) =>
                        handleInputChange("faculty", value)
                      }
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih fakultas" />
                      </SelectTrigger>
                      <SelectContent>
                        {facultyOptions.map((faculty) => (
                          <SelectItem key={faculty.value} value={faculty.value}>
                            {faculty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.faculty && (
                      <p className="text-sm text-red-600">{errors.faculty}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Password Section (only for new users) */}
            {mode === "add" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Password"
                    type="password"
                    placeholder="Masukkan password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    error={errors.password}
                    disabled={isReadOnly}
                    required
                    helperText="Password minimal 8 karakter"
                  />

                  <FormField
                    label="Konfirmasi Password"
                    type="password"
                    placeholder="Konfirmasi password"
                    value={formData.confirm_password || ""}
                    onChange={(e) =>
                      handleInputChange("confirm_password", e.target.value)
                    }
                    error={errors.confirm_password}
                    disabled={isReadOnly}
                    required
                  />
                </div>
              </div>
            )}

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
        } data pengguna ini?`}
        confirmText="Ya, Simpan"
        cancelText="Batal"
        onConfirm={handleConfirmSave}
      />
    </>
  );
}

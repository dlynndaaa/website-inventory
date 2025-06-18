"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Camera } from "lucide-react"

interface AdminProfileData {
  name: string
  email: string
  employeeId: string
  role: string
  workUnit: string
  phone: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  avatar?: string
}

interface UserProfileData {
  name: string
  email: string
  studentId: string
  studyProgram: string
  faculty: string
  whatsapp: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  avatar?: string
}

type ProfileData = AdminProfileData | UserProfileData

interface ProfileFormProps {
  userType: "admin" | "user"
  initialData: ProfileData
  onSubmit?: (data: ProfileData) => void
  className?: string
}

const roleOptions = [
  { value: "administrator", label: "Administrator" },
  { value: "staff", label: "Staff" },
  { value: "supervisor", label: "Supervisor" },
]

const workUnitOptions = [
  { value: "teknik-informatika", label: "Teknik Informatika" },
  { value: "sistem-informasi", label: "Sistem Informasi" },
  { value: "teknik-komputer", label: "Teknik Komputer" },
]

const studyProgramOptions = [
  { value: "teknik-informatika", label: "Teknik Informatika" },
  { value: "sistem-informasi", label: "Sistem Informasi" },
  { value: "teknik-komputer", label: "Teknik Komputer" },
  { value: "manajemen-informatika", label: "Manajemen Informatika" },
]

const facultyOptions = [
  { value: "teknik", label: "Fakultas Teknik" },
  { value: "ilmu-komputer", label: "Fakultas Ilmu Komputer" },
  { value: "sains-teknologi", label: "Fakultas Sains dan Teknologi" },
]

export function ProfileForm({ userType, initialData, onSubmit, className }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Nama lengkap harus diisi"
    if (!formData.email.trim()) newErrors.email = "Email harus diisi"

    if (userType === "admin") {
      const adminData = formData as AdminProfileData
      if (!adminData.employeeId.trim()) newErrors.employeeId = "ID Pegawai harus diisi"
      if (!adminData.role) newErrors.role = "Role harus dipilih"
      if (!adminData.workUnit) newErrors.workUnit = "Unit kerja harus dipilih"
      if (!adminData.phone.trim()) newErrors.phone = "Nomor telepon harus diisi"
    } else {
      const userData = formData as UserProfileData
      if (!userData.studentId.trim()) newErrors.studentId = "Nomor Induk Mahasiswa harus diisi"
      if (!userData.studyProgram) newErrors.studyProgram = "Program studi harus dipilih"
      if (!userData.faculty) newErrors.faculty = "Fakultas harus dipilih"
      if (!userData.whatsapp.trim()) newErrors.whatsapp = "Nomor WhatsApp harus diisi"
    }

    if (showPasswordFields) {
      if (!formData.currentPassword?.trim()) newErrors.currentPassword = "Password saat ini harus diisi"
      if (!formData.newPassword?.trim()) newErrors.newPassword = "Password baru harus diisi"
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Konfirmasi password tidak cocok"
      }
      if (formData.newPassword && formData.newPassword.length < 8) {
        newErrors.newPassword = "Password minimal 8 karakter"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setShowConfirmation(true)
    }
  }

  const handleConfirmSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      onSubmit?.(formData)
      setShowConfirmation(false)
      setShowPasswordFields(false)
      // Clear password fields after successful save
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAvatarChange = () => {
    // Implement avatar change logic
    console.log("Change avatar clicked")
  }

  const isAdmin = userType === "admin"
  const adminData = formData as AdminProfileData
  const userData = formData as UserProfileData

  return (
    <>
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        {/* Profile Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={formData.avatar || "/placeholder.svg"} alt="Profile" />
              <AvatarFallback className="bg-blue-500 text-white text-lg">
                {formData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarChange}
              className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{isAdmin ? "Administrator" : "Nama Pengguna"}</h2>
            <p className="text-gray-600">{formData.email}</p>
            <button
              onClick={handleAvatarChange}
              className="text-blue-600 hover:text-blue-800 text-sm mt-1 transition-colors"
            >
              Ubah Foto
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nama Lengkap"
              placeholder="Masukkan Nama Lengkap Anda"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
              required
            />

            {isAdmin ? (
              <FormField
                label="ID Pegawai"
                placeholder="Masukkan ID Pegawai Anda"
                value={adminData.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
                error={errors.employeeId}
                required
              />
            ) : (
              <FormField
                label="Nomor Induk Mahasiswa"
                placeholder="Masukkan NIM Anda"
                value={userData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                error={errors.studentId}
                required
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isAdmin ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <Select value={adminData.role} onValueChange={(value) => handleInputChange("role", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Peran" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Kerja <span className="text-red-500">*</span>
                  </label>
                  <Select value={adminData.workUnit} onValueChange={(value) => handleInputChange("workUnit", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Masukkan Unit Kerja Anda" />
                    </SelectTrigger>
                    <SelectContent>
                      {workUnitOptions.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.workUnit && <p className="text-sm text-red-600">{errors.workUnit}</p>}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Program Studi <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={userData.studyProgram}
                    onValueChange={(value) => handleInputChange("studyProgram", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Masukkan Program Studi Anda" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyProgramOptions.map((program) => (
                        <SelectItem key={program.value} value={program.value}>
                          {program.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.studyProgram && <p className="text-sm text-red-600">{errors.studyProgram}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fakultas <span className="text-red-500">*</span>
                  </label>
                  <Select value={userData.faculty} onValueChange={(value) => handleInputChange("faculty", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Masukkan Fakultas Anda" />
                    </SelectTrigger>
                    <SelectContent>
                      {facultyOptions.map((faculty) => (
                        <SelectItem key={faculty.value} value={faculty.value}>
                          {faculty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.faculty && <p className="text-sm text-red-600">{errors.faculty}</p>}
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label={isAdmin ? "Nomor Telepon" : "No. WhatsApp"}
              placeholder={isAdmin ? "Masukkan No. Telp Anda" : "Masukkan No. WhatsApp Anda"}
              value={isAdmin ? adminData.phone : userData.whatsapp}
              onChange={(e) => handleInputChange(isAdmin ? "phone" : "whatsapp", e.target.value)}
              error={isAdmin ? errors.phone : errors.whatsapp}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ganti Password</label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="w-full justify-start"
              >
                {showPasswordFields ? "Batal Ganti Password" : "Password minimal 8 karakter"}
              </Button>
            </div>
          </div>

          {showPasswordFields && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Ganti Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Password Saat Ini"
                  type="password"
                  placeholder="Password saat ini"
                  value={formData.currentPassword || ""}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  error={errors.currentPassword}
                  required
                />

                <FormField
                  label="Password Baru"
                  type="password"
                  placeholder="Password baru"
                  value={formData.newPassword || ""}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  error={errors.newPassword}
                  required
                />

                <FormField
                  label="Konfirmasi Password"
                  type="password"
                  placeholder="Konfirmasi password baru"
                  value={formData.confirmPassword || ""}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-start pt-6">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title="Konfirmasi Simpan"
        description="Apakah Anda yakin ingin menyimpan perubahan profil ini?"
        confirmText="Ya, Simpan"
        cancelText="Batal"
        onConfirm={handleConfirmSave}
      />
    </>
  )
}

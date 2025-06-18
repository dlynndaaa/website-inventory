"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { X } from "lucide-react"

interface ItemFormData {
  code: string
  name: string
  quantity: number
  unit: string
  category: string
  condition: string
  image?: File[]
}

interface ItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit" | "view"
  initialData?: Partial<ItemFormData>
  onSubmit?: (data: ItemFormData) => void
  title?: string
}

const quantityOptions = Array.from({ length: 100 }, (_, i) => i + 1)
const unitOptions = ["Unit", "Pcs", "Set", "Box", "Kg", "Liter"]
const categoryOptions = ["Komputer", "Elektronik", "Furniture", "Alat Tulis", "Lainnya"]
const conditionOptions = ["Baik", "Rusak", "Perlu Perbaikan"]

export function ItemForm({ open, onOpenChange, mode, initialData, onSubmit, title }: ItemFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    code: "",
    name: "",
    quantity: 1,
    unit: "Unit",
    category: "",
    condition: "Baik",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isReadOnly = mode === "view"
  const formTitle = title || (mode === "add" ? "Tambah Barang" : mode === "edit" ? "Edit Barang" : "Detail Barang")

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    } else {
      setFormData({
        code: "",
        name: "",
        quantity: 1,
        unit: "Unit",
        category: "",
        condition: "Baik",
      })
    }
    setErrors({})
  }, [initialData, open])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) newErrors.code = "Kode barang harus diisi"
    if (!formData.name.trim()) newErrors.name = "Nama barang harus diisi"
    if (!formData.category) newErrors.category = "Kategori harus dipilih"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isReadOnly) return

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
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof ItemFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileSelect = (files: File[]) => {
    setFormData((prev) => ({ ...prev, image: files }))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">{formTitle}</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Kode Barang"
                placeholder="Masukkan kode barang"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                error={errors.code}
                disabled={isReadOnly}
                required
              />

              <FormField
                label="Nama Barang"
                placeholder="Masukkan nama barang"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={errors.name}
                disabled={isReadOnly}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.quantity.toString()}
                  onValueChange={(value) => handleInputChange("quantity", Number.parseInt(value))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityOptions.map((qty) => (
                      <SelectItem key={qty} value={qty.toString()}>
                        {qty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleInputChange("unit", value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Kondisi <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => handleInputChange("condition", value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isReadOnly && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Upload Gambar</label>
                <FileUpload onFileSelect={handleFileSelect} accept="image/*" maxSize={25} />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isReadOnly ? "Tutup" : "Batal"}
              </Button>
              {!isReadOnly && (
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
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
        description={`Apakah Anda yakin ingin ${mode === "add" ? "menambah" : "mengubah"} data barang ini?`}
        confirmText="Ya, Simpan"
        cancelText="Batal"
        onConfirm={handleConfirmSave}
      />
    </>
  )
}

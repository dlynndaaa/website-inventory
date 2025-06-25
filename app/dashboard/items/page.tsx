"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { ItemForm } from "@/components/forms/item-form"
import { apiClient } from "@/lib/api/client"
import { useTableData } from "@/hooks/use-table-data"

interface Item {
  id: string
  code: string
  name: string
  quantity: number
  available: number
  borrowed: number
  condition: "good" | "damaged"
  category: string
  unit: string
}

export default function ItemsPage() {
  const [data, setData] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<"admin" | "user">("user")
  const [formState, setFormState] = useState<{
    open: boolean
    mode: "add" | "edit" | "view"
    item?: Item
  }>({ open: false, mode: "add" })

  const { paginatedData, handleSearch, pagination } = useTableData({
    data,
    pageSize: 8,
    searchFields: ["code", "name", "category"],
  })

  useEffect(() => {
    const role = localStorage.getItem("role")
    setUserRole(role === "admin" ? "admin" : "user")
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getItems()
      setData(response.items)
    } catch (error) {
      console.error("Failed to load items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    { key: "code" as keyof Item, title: "Kode Barang" },
    { key: "name" as keyof Item, title: "Nama Barang" },
    { key: "quantity" as keyof Item, title: "Jumlah" },
    {
      key: "available" as keyof Item,
      title: "Status",
      render: (value: number, item: Item) => (
        <div className="flex space-x-2">
          {item.available > 0 && <StatusBadge status="available">{item.available} Tersedia</StatusBadge>}
          {item.borrowed > 0 && <StatusBadge status="borrowed">{item.borrowed} Dipinjam</StatusBadge>}
        </div>
      ),
    },
    {
      key: "condition" as keyof Item,
      title: "Kondisi",
      render: (value: string) => (
        <span className={value === "good" ? "text-blue-600" : "text-red-600"}>
          {value === "good" ? "Baik" : "Rusak"}
        </span>
      ),
    },
  ]

  const handleAdd = () => setFormState({ open: true, mode: "add" })
  const handleEdit = (item: Item) => setFormState({ open: true, mode: "edit", item })
  const handleView = (item: Item) => setFormState({ open: true, mode: "view", item })

  const handleDelete = async (item: Item) => {
    try {
      await apiClient.deleteItem(item.id)
      setData((prev) => prev.filter((i) => i.id !== item.id))
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      if (formState.mode === "add") {
        const response = await apiClient.createItem({
          ...formData,
          condition: formData.condition === "Baik" ? "good" : "damaged",
        })
        setData((prev) => [...prev, response.item])
      } else if (formState.mode === "edit" && formState.item) {
        const response = await apiClient.updateItem(formState.item.id, {
          ...formData,
          condition: formData.condition === "Baik" ? "good" : "damaged",
        })
        setData((prev) => prev.map((item) => (item.id === formState.item?.id ? response.item : item)))
      }
    } catch (error) {
      console.error("Failed to save item:", error)
    }
  }

  return (
    <DashboardLayout>
      <DataTable
        title="Daftar Barang"
        data={paginatedData}
        columns={columns}
        searchPlaceholder="Search..."
        addButtonText={userRole === "admin" ? "Tambah Barang" : undefined}
        userRole={userRole}
        onAdd={userRole === "admin" ? handleAdd : undefined}
        onEdit={userRole === "admin" ? handleEdit : undefined}
        onDelete={userRole === "admin" ? handleDelete : undefined}
        onView={handleView}
        onSearch={handleSearch}
        pagination={pagination}
        isLoading={isLoading}
        hideActions={userRole === "user"} // kalau komponen DataTable mendukung ini
      />

      <ItemForm
        open={formState.open}
        onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
        mode={formState.mode}
        initialData={
          formState.item
            ? {
                code: formState.item.code,
                name: formState.item.name,
                quantity: formState.item.quantity,
                unit: formState.item.unit,
                category: formState.item.category,
                condition: formState.item.condition === "good" ? "Baik" : "Rusak",
              }
            : undefined
        }
        onSubmit={handleFormSubmit}
      />
    </DashboardLayout>
  )
}

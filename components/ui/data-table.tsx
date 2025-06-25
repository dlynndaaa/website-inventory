"use client"

import { cn } from "@/lib/utils"
import { getPaginationInfo } from "@/lib/utils/pagination"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"

interface Column<T> {
  key: keyof T
  title: string
  render?: (value: any, item: T) => React.ReactNode
}

interface DataTableProps<T> {
  title: string
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  addButtonText?: string
  onAdd?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  onSearch?: (query: string) => void
  pagination?: {
    current: number
    total: number
    pageSize: number
    onPageChange: (page: number) => void
  }
  isLoading?: boolean
  userRole?: "admin" | "user"
}

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  searchPlaceholder = "Search...",
  addButtonText = "Add Item",
  onAdd,
  onEdit,
  onDelete,
  onView,
  onSearch,
  pagination,
  isLoading = false,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean
    item: T | null
  }>({ open: false, item: null })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleDeleteClick = (item: T) => {
    setDeleteConfirmation({ open: true, item })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation.item) {
      onDelete?.(deleteConfirmation.item)
      setDeleteConfirmation({ open: false, item: null })
    }
  }

  const paginationInfo = pagination
    ? getPaginationInfo(pagination.current, pagination.pageSize, pagination.total)
    : null

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
                disabled={isLoading}
              />
            </div>
            {onAdd && (
              <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                {addButtonText}
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.title}
                      </th>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {columns.map((column) => (
                          <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {column.render ? column.render(item[column.key], item) : item[column.key]}
                          </td>
                        ))}
                        {(onEdit || onDelete || onView) && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              {onView && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onView(item)}
                                  className="text-gray-600 hover:text-gray-800"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              {onEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEdit(item)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {onDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {pagination && paginationInfo && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <p className="text-sm text-gray-700">{paginationInfo.displayText}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation({ open, item: null })}
        title="Konfirmasi Hapus"
        description="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </>
  )
}

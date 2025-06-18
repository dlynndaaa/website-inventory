"use client"

import { useState, useMemo } from "react"
import { getPaginatedData } from "@/lib/utils/pagination"

interface UseTableDataProps<T> {
  data: T[]
  pageSize?: number
  searchFields?: (keyof T)[]
}

export function useTableData<T extends Record<string, any>>({
  data,
  pageSize = 10,
  searchFields = [],
}: UseTableDataProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery || searchFields.length === 0) return data

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      }),
    )
  }, [data, searchQuery, searchFields])

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    return getPaginatedData(filteredData, currentPage, pageSize)
  }, [filteredData, currentPage, pageSize])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return {
    searchQuery,
    currentPage,
    filteredData,
    paginatedData,
    totalItems: filteredData.length,
    handleSearch,
    handlePageChange,
    pagination: {
      current: currentPage,
      total: filteredData.length,
      pageSize,
      onPageChange: handlePageChange,
    },
  }
}

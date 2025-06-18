export function getPaginationInfo(currentPage: number, pageSize: number, totalItems: number) {
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  return {
    startIndex,
    endIndex,
    totalItems,
    displayText: `Menampilkan ${startIndex}-${endIndex} dari ${totalItems} data`,
  }
}

export function getPaginatedData<T>(data: T[], currentPage: number, pageSize: number) {
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  return data.slice(startIndex, endIndex)
}

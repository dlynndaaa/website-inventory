"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { BorrowingStatusBadge } from "@/components/ui/borrowing-status-badge";
import { BorrowingForm } from "@/components/forms/borrowing-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { apiClient } from "@/lib/api/client";
import { useTableData } from "@/hooks/use-table-data";

interface Borrowing {
  id: string;
  borrower_id: string; // Add this property
  borrower_name: string;
  borrower_email: string;
  borrower_phone?: string;
  borrower_whatsapp?: string;
  borrower_student_id: string; // Add this property
  item_id: string;
  item_name: string;
  quantity: number;
  borrow_date: string;
  return_date: string;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "returned";
  borrowing_letter_url?: string;
}

export default function BorrowingPage() {
  const [allData, setAllData] = useState<Borrowing[]>([]);
  const [availableItems, setAvailableItems] = useState<
    Array<{ id: string; name: string; available: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: "add" | "edit" | "view";
    item?: Borrowing;
  }>({ open: false, mode: "add" });

  const { paginatedData, handleSearch, pagination } = useTableData({
    data: allData,
    pageSize: 8,
    searchFields: ["borrower_name", "item_name", "borrower_email"],
  });

  const [borrowers, setBorrowers] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      student_id: string;
      study_program: string;
      faculty: string;
      whatsapp: string;
    }>
  >([]);

  useEffect(() => {
    loadBorrowings();
    loadAvailableItems();
    loadBorrowers();
  }, []);

  const loadBorrowings = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getBorrowings();
      setAllData(response.borrowings);
    } catch (error) {
      console.error("Failed to load borrowings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableItems = async () => {
    try {
      const response = await apiClient.getItems();
      setAvailableItems(response.items.filter((item) => item.available > 0));
    } catch (error) {
      console.error("Failed to load available items:", error);
    }
  };

  const loadBorrowers = async () => {
    try {
      const response = await apiClient.getBorrowers();
      setBorrowers(response.borrowers);
    } catch (error) {
      console.error("Failed to load borrowers:", error);
    }
  };

  const columns = [
    {
      key: "borrower_name" as keyof Borrowing,
      title: "Peminjam",
      render: (value: string) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              U
            </AvatarFallback>
          </Avatar>
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "item_name" as keyof Borrowing,
      title: "Nama Barang",
    },
    {
      key: "quantity" as keyof Borrowing,
      title: "Jumlah",
    },
    {
      key: "borrow_date" as keyof Borrowing,
      title: "Tanggal Pinjam",
      render: (value: string) =>
        format(new Date(value), "dd-MM-yyyy", { locale: id }),
    },
    {
      key: "return_date" as keyof Borrowing,
      title: "Tanggal Kembali",
      render: (value: string) =>
        format(new Date(value), "dd-MM-yyyy", { locale: id }),
    },
    {
      key: "borrowing_letter_url" as keyof Borrowing,
      title: "Surat Peminjaman",
      render: (value: string) =>
        value ? (
          <Button variant="link" className="text-blue-600 p-0 h-auto">
            <FileText className="w-4 h-4 mr-1" />
            Download
          </Button>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "status" as keyof Borrowing,
      title: "Status",
      render: (value: string) => {
        const statusMap = {
          pending: "Menunggu",
          approved: "Dipinjam",
          rejected: "Tolak",
          returned: "Dikembalikan",
        };
        return (
          <BorrowingStatusBadge status={value as any}>
            {statusMap[value as keyof typeof statusMap]}
          </BorrowingStatusBadge>
        );
      },
    },
  ];

  const handleAdd = () => {
    setFormState({ open: true, mode: "add" });
  };

  const handleEdit = (item: Borrowing) => {
    setFormState({ open: true, mode: "edit", item });
  };

  const handleView = (item: Borrowing) => {
    setFormState({ open: true, mode: "view", item });
  };

  const handleDelete = async (item: Borrowing) => {
    try {
      await apiClient.deleteBorrowing(item.id);
      setAllData((prev) => prev.filter((b) => b.id !== item.id));
    } catch (error) {
      console.error("Failed to delete borrowing:", error);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (formState.mode === "add") {
        const response = await apiClient.createBorrowing({
          borrower_id: formData.borrowerId,
          item_id: formData.itemId,
          quantity: formData.quantity,
          borrow_date: formData.borrowDate,
          return_date: formData.returnDate,
          purpose: formData.purpose,
          borrowing_letter_url: formData.borrowingLetter?.[0]?.name,
        });
        await loadBorrowings(); // Reload to get updated data
      } else if (formState.mode === "edit" && formState.item) {
        await apiClient.updateBorrowing(formState.item.id, {
          status: formData.status,
          notes: formData.notes,
        });
        await loadBorrowings(); // Reload to get updated data
      }
    } catch (error) {
      console.error("Failed to save borrowing:", error);
    }
  };

  return (
    <DashboardLayout>
      <DataTable
        title="Daftar Peminjaman"
        data={paginatedData}
        columns={columns}
        searchPlaceholder="Search..."
        addButtonText="Tambah Peminjaman"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onSearch={handleSearch}
        pagination={pagination}
        isLoading={isLoading}
      />

      <BorrowingForm
        open={formState.open}
        onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
        mode={formState.mode}
        initialData={
          formState.item
            ? {
                borrowerId: formState.item.borrower_id,
                borrowerName: formState.item.borrower_name,
                borrowerEmail: formState.item.borrower_email,
                borrowerPhone:
                  formState.item.borrower_phone ||
                  formState.item.borrower_whatsapp ||
                  "",
                borrowerStudentId: formState.item.borrower_student_id,
                itemId: formState.item.item_id,
                itemName: formState.item.item_name,
                quantity: formState.item.quantity,
                borrowDate: new Date(formState.item.borrow_date),
                returnDate: new Date(formState.item.return_date),
                purpose: formState.item.purpose,
                status: formState.item.status,
              }
            : undefined
        }
        onSubmit={handleFormSubmit}
        availableItems={availableItems}
        borrowers={borrowers}
      />
    </DashboardLayout>
  );
}

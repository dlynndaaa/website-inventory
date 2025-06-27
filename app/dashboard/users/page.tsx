"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { UserStatusBadge } from "@/components/ui/user-status-badge";
import { UserForm } from "@/components/forms/user-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api/client";
import { useTableData } from "@/hooks/use-table-data";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  employee_id?: string;
  work_unit?: string;
  phone?: string;
  student_id?: string;
  study_program?: string;
  faculty?: string;
  whatsapp?: string;
  status: "active" | "inactive";
  avatar?: string;
  created_date: string;
}

export default function UsersPage() {
  const [allData, setAllData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: "add" | "edit" | "view";
    user?: User;
  }>({ open: false, mode: "add" });

  const { paginatedData, handleSearch, pagination } = useTableData({
    data: allData,
    pageSize: 8,
    searchFields: ["name", "email", "student_id", "employee_id"],
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUsers();
      setAllData(response.users);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: "student_id" as keyof User,
      title: "NIM",
      render: (value: string, user: User) =>
        user.role === "user" ? value : user.employee_id || "-",
    },
    {
      key: "name" as keyof User,
      title: "Pengguna",
      render: (value: string, user: User) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              {value.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "whatsapp" as keyof User,
      title: "Nomor WhatsApp",
      render: (value: string, user: User) =>
        user.role === "user" ? value : user.phone || "-",
    },
    {
      key: "study_program" as keyof User,
      title: "Program Studi",
      render: (value: string, user: User) => {
        if (user.role === "user") {
          return value === "teknik-informatika" ? "Teknik Informatika" : value;
        }
        return user.work_unit === "teknik-informatika"
          ? "Teknik Informatika"
          : user.work_unit || "-";
      },
    },
    {
      key: "role" as keyof User,
      title: "Role",
      render: (value: string) => (
        <UserStatusBadge status={value === "admin" ? "active" : "inactive"}>
          {value === "admin" ? "Administrator" : "User"}
        </UserStatusBadge>
      ),
    },
  ];

  const handleAdd = () => {
    setFormState({ open: true, mode: "add" });
  };

  const handleEdit = (user: User) => {
    setFormState({ open: true, mode: "edit", user });
  };

  const handleView = (user: User) => {
    setFormState({ open: true, mode: "view", user });
  };

  const handleDelete = async (user: User) => {
    try {
      await apiClient.deleteUser(user.id);
      setAllData((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (formState.mode === "add") {
        const response = await apiClient.createUser(formData);
        setAllData((prev) => [...prev, response.user]);
      } else if (formState.mode === "edit" && formState.user) {
        const response = await apiClient.updateUser(
          formState.user.id,
          formData
        );
        setAllData((prev) =>
          prev.map((user) =>
            user.id === formState.user?.id ? response.user : user
          )
        );
      }
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  return (
    <DashboardLayout>
      <DataTable
        title="Daftar Pengguna"
        data={paginatedData}
        columns={columns}
        searchPlaceholder="Search..."
        addButtonText="Tambah Pengguna"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onSearch={handleSearch}
        pagination={pagination}
        isLoading={isLoading}
      />

      <UserForm
        open={formState.open}
        onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
        mode={formState.mode}
        initialData={formState.user}
        onSubmit={handleFormSubmit}
      />
    </DashboardLayout>
  );
}

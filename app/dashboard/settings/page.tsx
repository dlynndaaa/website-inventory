"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProfileForm } from "@/components/forms/profile-form";

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
  status: string;
  avatar?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (data: any) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
      } else {
        console.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to map User to ProfileData
  const mapUserToProfileData = (user: User) => {
    if (user.role === "admin") {
      return {
        name: user.name,
        email: user.email,
        employeeId: user.employee_id || "",
        role: user.role,
        workUnit: user.work_unit || "",
        phone: user.phone || "",
        avatar: user.avatar,
      };
    } else {
      return {
        name: user.name,
        email: user.email,
        studentId: user.student_id || "",
        studyProgram: user.study_program || "",
        faculty: user.faculty || "",
        whatsapp: user.whatsapp || "",
        avatar: user.avatar,
      };
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-red-600">Failed to load user data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {user.role === "admin" ? "Pengaturan Admin" : "Pengaturan User"}
        </h1>

        <ProfileForm
          userType={user.role}
          initialData={mapUserToProfileData(user)}
          onSubmit={handleProfileSubmit}
        />
      </div>
    </DashboardLayout>
  );
}

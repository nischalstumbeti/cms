"use client";

import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (admin: any, password?: string) => {
    // Store admin data in localStorage for session management
    localStorage.setItem('admin', JSON.stringify(admin));
    localStorage.setItem('admin_session', JSON.stringify({
      email: admin.email,
      role: admin.role
    }));
    
    // Store password temporarily for logging purposes (will be cleared after logging)
    if (password) {
      localStorage.setItem('admin_password_temp', password);
    }
    
    // Redirect to admin dashboard immediately
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AdminLoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}

"use client";

import { AdminLoginForm } from "@/components/auth/admin-login-form";

export default function TestAdminLoginPage() {
  const handleLoginSuccess = (admin: any) => {
    console.log('Login successful:', admin);
    alert(`Welcome ${admin.name}! Role: ${admin.role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Test Admin Login</h1>
        <AdminLoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}

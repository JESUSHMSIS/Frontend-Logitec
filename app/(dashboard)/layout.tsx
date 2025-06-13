"use client";

import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-[70px]">
          <div className="fixed top-0 right-0 left-[70px] z-10">
            <Navbar />
          </div>
          <main className="p-4 pt-16">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}

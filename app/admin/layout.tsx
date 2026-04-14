"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";
import { RefreshCw, Shield } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    setAuthorized(true);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] border-4 border-[rgb(var(--foreground))] flex items-center justify-center shadow-[6px_6px_0_rgb(var(--foreground)/0.15)] animate-pulse">
            <Shield size={36} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="animate-spin text-[rgb(var(--primary))]" size={18} />
            <span className="text-[rgb(var(--muted-foreground))] font-bold text-sm">MEMUAT ADMIN PANEL...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex transition-colors duration-300">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Subtle Background Pattern */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>
        
        <main className="relative z-10 animate-fade-in pb-20 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}

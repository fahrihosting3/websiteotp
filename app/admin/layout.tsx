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
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white flex items-center justify-center">
            <Shield size={28} className="text-neutral-950" />
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="animate-spin text-neutral-400" size={16} />
            <span className="text-neutral-400 text-sm">Memuat...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen">
        <main className="pb-20 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}

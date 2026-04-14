"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminNavbar from "@/components/AdminNavbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RefreshCw } from "lucide-react";

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
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] flex items-center justify-center">
            <RefreshCw className="animate-spin text-white" size={28} />
          </div>
          <span className="text-[rgb(var(--muted-foreground))] font-medium">Memuat...</span>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[rgb(var(--background))] transition-colors duration-300">
        <AdminNavbar />
        
        {/* Subtle Background Pattern */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>
        
        <main className="relative z-10 animate-fade-in">{children}</main>
      </div>
    </ThemeProvider>
  );
}

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
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 neo-grid-bg opacity-20"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-16 h-16 border-4 border-white/20 animate-float"></div>
        <div className="absolute bottom-32 right-32 w-12 h-12 bg-white/10 animate-float-reverse"></div>
        <div className="absolute top-1/2 right-20 w-8 h-8 border-4 border-white/15 rotate-45 animate-bounce-neo"></div>
        
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-white flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] animate-pulse-neo">
            <Shield size={36} className="text-black" />
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="animate-spin text-white" size={18} />
            <span className="text-white text-sm font-mono uppercase tracking-wider">Loading Admin...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 neo-grid-bg opacity-10 pointer-events-none"></div>
      
      {/* Floating shapes */}
      <div className="fixed top-40 left-[30%] w-20 h-20 border-4 border-white/10 animate-float pointer-events-none"></div>
      <div className="fixed bottom-40 right-[20%] w-14 h-14 bg-white/5 animate-float-reverse pointer-events-none"></div>
      <div className="fixed top-[60%] left-[15%] w-10 h-10 border-4 border-white/10 rotate-45 animate-bounce-neo pointer-events-none"></div>
      <div className="fixed top-20 right-[40%] w-8 h-8 bg-white/5 animate-float pointer-events-none"></div>
      <div className="fixed bottom-20 left-[50%] w-12 h-12 border-4 border-white/5 rotate-12 animate-float-reverse pointer-events-none"></div>
      
      <AdminSidebar />
      <div className="flex-1 min-h-screen relative z-10">
        <main className="pb-20 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}

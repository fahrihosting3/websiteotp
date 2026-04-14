"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Receipt, 
  Clock, 
  LogOut, 
  RefreshCw, 
  Shield, 
  ChevronLeft,
  ChevronRight,
  Key,
  X,
  Menu
} from "lucide-react";
import { logoutUser } from "@/lib/auth";
import { useState, useEffect } from "react";

interface AdminSidebarProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function AdminSidebar({ onRefresh, refreshing = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved) setCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const navItems = [
    { href: "/admin", label: "Overview", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
    { href: "/admin/pending", label: "Pending", icon: Clock },
    { href: "/admin/settings", label: "Settings API", icon: Key },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-black border-r-4 border-white">
      {/* Logo */}
      <div className={`p-5 border-b-4 border-white ${collapsed ? "px-4" : ""}`}>
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-white flex items-center justify-center shrink-0 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
            <Shield size={24} className="text-black" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-black text-lg tracking-tighter uppercase">Admin</p>
              <p className="text-neutral-500 text-[10px] font-mono uppercase tracking-widest">Panel</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-mono text-neutral-600 tracking-[0.2em] px-3 mb-4 mt-2 uppercase">Navigation</p>
        )}
        
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all duration-100 border-2 ${
              isActive(item.href)
                ? "bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                : "text-white border-transparent hover:border-white hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t-4 border-white space-y-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Data"
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white border-2 border-transparent hover:border-white hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all duration-100 disabled:opacity-50 ${collapsed ? "justify-center" : ""}`}
          >
            <RefreshCw size={18} className={`shrink-0 ${refreshing ? "animate-spin" : ""}`} />
            {!collapsed && <span>Refresh</span>}
          </button>
        )}

        <button
          onClick={handleLogout}
          title="Keluar"
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white border-2 border-transparent hover:border-white hover:bg-white hover:text-black transition-all duration-100 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-4 top-20 w-8 h-8 bg-white border-2 border-black text-black items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-14 h-14 bg-white border-4 border-black text-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-10 h-10 bg-white border-2 border-black text-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Spacer */}
      <div className={`hidden lg:block shrink-0 transition-all duration-200 ${collapsed ? "w-20" : "w-64"}`} />
    </>
  );
}

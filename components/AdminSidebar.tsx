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
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Logo */}
      <div className={`p-5 border-b border-neutral-800 ${collapsed ? "px-4" : ""}`}>
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white flex items-center justify-center shrink-0">
            <Shield size={20} className="text-neutral-950" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-bold text-sm tracking-tight">ADMIN</p>
              <p className="text-neutral-500 text-[10px] font-mono">PANEL</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-mono text-neutral-600 tracking-widest px-3 mb-3 mt-2">MENU</p>
        )}
        
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 ${
              isActive(item.href)
                ? "bg-white text-neutral-950 font-semibold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-neutral-800 space-y-1">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Data"
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all duration-150 disabled:opacity-50 ${collapsed ? "justify-center" : ""}`}
          >
            <RefreshCw size={18} className={`shrink-0 ${refreshing ? "animate-spin" : ""}`} />
            {!collapsed && <span>Refresh</span>}
          </button>
        )}

        <button
          onClick={handleLogout}
          title="Keluar"
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/50 transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white items-center justify-center transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 w-12 h-12 bg-neutral-950 border border-neutral-800 text-white flex items-center justify-center shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 transition-all duration-300 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Spacer */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`} />
    </>
  );
}

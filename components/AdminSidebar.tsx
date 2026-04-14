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
  Moon, 
  Sun, 
  ChevronLeft,
  ChevronRight,
  Settings,
  Key,
  X
} from "lucide-react";
import { logoutUser } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";

interface AdminSidebarProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function AdminSidebar({ onRefresh, refreshing = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved) setCollapsed(JSON.parse(saved));
  }, []);

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  // Close mobile sidebar on route change
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-4 border-b-4 border-[rgb(var(--foreground))] ${collapsed ? "px-3" : ""}`}>
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] border-3 border-[rgb(var(--foreground))] flex items-center justify-center shadow-[4px_4px_0_rgb(var(--foreground)/0.2)] group-hover:shadow-[5px_5px_0_rgb(var(--foreground)/0.25)] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-all duration-200 shrink-0">
            <Shield size={24} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="text-[rgb(var(--foreground))] font-black text-lg tracking-tight leading-none">ADMIN</p>
              <p className="text-[rgb(var(--muted-foreground))] text-xs font-mono tracking-wider">PANEL v2.0</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        <div className={`mb-4 ${collapsed ? "hidden" : ""}`}>
          <p className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-widest px-3 mb-2">MENU</p>
        </div>
        
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            style={{ animationDelay: `${index * 0.05}s` }}
            className={`animate-slide-in flex items-center gap-3 px-3 py-3 font-bold text-sm border-3 transition-all duration-200 group ${
              isActive(item.href)
                ? "bg-[rgb(var(--primary))] text-white border-[rgb(var(--foreground))] shadow-[4px_4px_0_rgb(var(--foreground)/0.2)]"
                : "bg-[rgb(var(--card))] text-[rgb(var(--foreground))] border-transparent hover:border-[rgb(var(--foreground))] hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {isActive(item.href) && !collapsed && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t-4 border-[rgb(var(--foreground))] space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          className={`w-full flex items-center gap-3 px-3 py-3 font-bold text-sm border-3 border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground))] hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.15)] transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-amber-400 shrink-0" />
          ) : (
            <Moon size={20} className="shrink-0" />
          )}
          {!collapsed && <span>{theme === "dark" ? "Mode Terang" : "Mode Gelap"}</span>}
        </button>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Data"
            className={`w-full flex items-center gap-3 px-3 py-3 font-bold text-sm border-3 border-transparent bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground))] hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.15)] transition-all duration-200 disabled:opacity-50 ${collapsed ? "justify-center" : ""}`}
          >
            <RefreshCw size={20} className={`shrink-0 ${refreshing ? "animate-spin" : ""}`} />
            {!collapsed && <span>Refresh</span>}
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Keluar"
          className={`w-full flex items-center gap-3 px-3 py-3 font-bold text-sm border-3 border-[rgb(var(--destructive))] bg-[rgb(var(--destructive)/0.1)] text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive))] hover:text-white hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.15)] transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* Collapse Toggle - Desktop Only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[rgb(var(--primary))] border-2 border-[rgb(var(--foreground))] text-white items-center justify-center shadow-[2px_2px_0_rgb(var(--foreground)/0.2)] hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.25)] transition-all z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 w-14 h-14 bg-[rgb(var(--primary))] border-3 border-[rgb(var(--foreground))] text-white flex items-center justify-center shadow-[4px_4px_0_rgb(var(--foreground)/0.2)] hover:shadow-[5px_5px_0_rgb(var(--foreground)/0.25)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
      >
        <Settings size={24} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[rgb(var(--card))] border-r-4 border-[rgb(var(--foreground))] transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 bg-[rgb(var(--muted))] border-2 border-[rgb(var(--foreground))] flex items-center justify-center"
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 bg-[rgb(var(--card))] border-r-4 border-[rgb(var(--foreground))] shadow-[6px_0_0_rgb(var(--foreground)/0.05)] transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Spacer for content */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`} />
    </>
  );
}

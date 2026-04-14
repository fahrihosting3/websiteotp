"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard,
  ShoppingCart, 
  CreditCard, 
  History, 
  LogOut, 
  RefreshCw, 
  Shield, 
  Moon, 
  Sun, 
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Wallet,
  User
} from "lucide-react";
import { logoutUser } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";

interface UserSidebarProps {
  user?: any;
  balance?: any;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function UserSidebar({ user, balance, onRefresh, refreshing = false }: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user-sidebar-collapsed");
    if (saved) setCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("user-sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-slate-800" },
    { href: "/services", label: "Layanan", icon: ShoppingCart, color: "bg-amber-500" },
    { href: "/deposit", label: "Deposit", icon: CreditCard, color: "bg-emerald-500" },
    { href: "/history", label: "Riwayat", icon: History, color: "bg-sky-500" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className={`p-4 border-b-4 border-[rgb(var(--foreground))] ${collapsed ? "px-2" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 border-3 border-[rgb(var(--foreground))] flex items-center justify-center shadow-[3px_3px_0_rgb(var(--foreground)/0.2)] shrink-0">
            <User size={22} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <p className="text-[rgb(var(--foreground))] font-black text-sm truncate">{user?.name || "User"}</p>
              <p className="text-[rgb(var(--muted-foreground))] text-[10px] font-mono truncate">{user?.email || ""}</p>
            </div>
          )}
        </div>
        
        {/* Balance */}
        {!collapsed && (
          <div className="mt-4 bg-[rgb(var(--muted))] border-3 border-[rgb(var(--foreground))] p-3 shadow-[3px_3px_0_rgb(var(--foreground)/0.15)] animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-emerald-500" />
                <span className="text-[10px] font-mono text-[rgb(var(--muted-foreground))]">SALDO</span>
              </div>
              <button 
                onClick={onRefresh} 
                disabled={refreshing}
                className="p-1 hover:bg-[rgb(var(--card))] rounded transition-colors"
              >
                <RefreshCw size={12} className={`text-[rgb(var(--muted-foreground))] ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
            <p className="text-[rgb(var(--foreground))] font-black text-lg mt-1">
              {balance?.formated || "Rp0"}
            </p>
          </div>
        )}

        {collapsed && (
          <div className="mt-3 flex justify-center">
            <div className="w-10 h-10 bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
              <Wallet size={16} className="text-emerald-500" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-widest px-3 mb-3">MENU</p>
        )}
        
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            style={{ animationDelay: `${index * 0.05}s` }}
            className={`animate-slide-in flex items-center gap-3 px-3 py-3 font-bold text-sm border-3 transition-all duration-200 ${
              isActive(item.href)
                ? `${item.color} text-white border-[rgb(var(--foreground))] shadow-[4px_4px_0_rgb(var(--foreground)/0.2)]`
                : "bg-[rgb(var(--card))] text-[rgb(var(--foreground))] border-transparent hover:border-[rgb(var(--foreground))] hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Admin Link - Only show if admin */}
        {user?.role === "admin" && (
          <>
            {!collapsed && (
              <p className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-widest px-3 mt-6 mb-3">ADMIN</p>
            )}
            <Link
              href="/admin"
              title={collapsed ? "Admin Panel" : undefined}
              className={`flex items-center gap-3 px-3 py-3 font-bold text-sm border-3 border-rose-500 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.15)] transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
            >
              <Shield size={20} className="shrink-0" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t-4 border-[rgb(var(--foreground))] space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          className={`w-full flex items-center gap-3 px-3 py-3 font-bold text-sm border-3 border-transparent bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--foreground))] hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.15)] transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-amber-400 shrink-0" />
          ) : (
            <Moon size={20} className="shrink-0" />
          )}
          {!collapsed && <span>{theme === "dark" ? "Terang" : "Gelap"}</span>}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Keluar"
          className={`w-full flex items-center gap-3 px-3 py-3 font-bold text-sm border-3 border-[rgb(var(--foreground))] bg-[rgb(var(--card))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--destructive))] hover:text-white hover:border-[rgb(var(--destructive))] hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.15)] transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* Collapse Toggle - Desktop Only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[rgb(var(--foreground))] border-2 border-[rgb(var(--foreground))] text-[rgb(var(--background))] items-center justify-center shadow-[2px_2px_0_rgb(var(--foreground)/0.2)] hover:shadow-[3px_3px_0_rgb(var(--foreground)/0.25)] transition-all z-50"
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
        className="lg:hidden fixed bottom-4 left-4 z-50 w-14 h-14 bg-[rgb(var(--foreground))] border-3 border-[rgb(var(--foreground))] text-[rgb(var(--background))] flex items-center justify-center shadow-[4px_4px_0_rgb(var(--foreground)/0.3)] hover:shadow-[5px_5px_0_rgb(var(--foreground)/0.35)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[rgb(var(--card))] border-r-4 border-[rgb(var(--foreground))] shadow-[8px_0_30px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 bg-[rgb(var(--muted))] border-2 border-[rgb(var(--foreground))] flex items-center justify-center hover:bg-[rgb(var(--destructive))] hover:text-white hover:border-[rgb(var(--destructive))] transition-colors"
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 bg-[rgb(var(--card))] border-r-4 border-[rgb(var(--foreground))] shadow-[8px_0_20px_rgba(0,0,0,0.1)] transition-all duration-300 ${
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

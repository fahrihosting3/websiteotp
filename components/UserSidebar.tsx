"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Menu,
  X,
  Home,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Layanan", href: "/services", icon: ShoppingCart },
  { label: "Deposit", href: "/deposit", icon: Wallet },
  { label: "Riwayat", href: "/history", icon: History },
];

export default function UserSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    setUser(currentUser);
    fetchBalance();
  }, [router]);

  const fetchBalance = async () => {
    if (!process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY) return;
    setLoadingBalance(true);
    try {
      const res = await axios.get("https://www.rumahotp.io/api/v1/user/balance", {
        headers: {
          "x-apikey": process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY,
          Accept: "application/json",
        },
      });
      setBalanceData(res.data);
    } catch (err) {
      console.error("Gagal mengambil saldo:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-neutral-950 text-white
          flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          ${mobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-neutral-950 font-black text-sm">RO</span>
            </div>
            {!collapsed && (
              <span className="font-semibold text-base tracking-tight whitespace-nowrap">
                RUMA OTP
              </span>
            )}
          </Link>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Section */}
        <div className={`p-4 border-b border-neutral-800 ${collapsed ? "px-2" : ""}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {getInitials(user.name)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
          
          {/* Balance */}
          {!collapsed && (
            <div className="mt-3 p-3 bg-neutral-900 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Saldo</span>
                <button 
                  onClick={fetchBalance} 
                  disabled={loadingBalance}
                  className="p-1 hover:bg-neutral-800 rounded transition-colors"
                >
                  <RefreshCw size={12} className={`text-neutral-400 ${loadingBalance ? "animate-spin" : ""}`} />
                </button>
              </div>
              <p className="text-lg font-bold text-white mt-1">
                {loadingBalance ? "..." : balanceData?.success ? balanceData.data.formated : "Rp 0"}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${collapsed ? "justify-center" : ""}
                  ${isActive 
                    ? "bg-white text-neutral-950 font-semibold" 
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-neutral-800 space-y-1">
          {/* Back to Home */}
          <Link
            href="/"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-neutral-400 hover:bg-neutral-800 hover:text-white
              transition-all duration-200
              ${collapsed ? "justify-center" : ""}
            `}
            title={collapsed ? "Beranda" : undefined}
          >
            <Home size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Beranda</span>}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-red-400 hover:bg-red-950/50 hover:text-red-300
              transition-all duration-200
              ${collapsed ? "justify-center" : ""}
            `}
            title={collapsed ? "Keluar" : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Keluar</span>}
          </button>

          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 mt-2 rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar - Mobile */}
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Menu size={22} className="text-neutral-700" />
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">RO</span>
            </div>
            <span className="font-semibold text-neutral-900">RUMA OTP</span>
          </Link>

          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

// components/AdminNavbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Clock,
  LogOut,
  Terminal,
  ChevronRight,
  Home,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
  { href: "/admin/pending", label: "Pending", icon: Clock },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current || current.role !== "admin") {
      router.push("/auth/login");
      return;
    }
    setUser(current);
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r-4 border-slate-800 flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b-4 border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 border-3 border-slate-300 flex items-center justify-center">
              <Terminal size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">ADMIN</h1>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider">PANEL v1.0</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 font-bold text-sm border-3 transition-all ${
                  active
                    ? "bg-rose-500 text-white border-rose-400 shadow-[4px_4px_0px_#f43f5e]"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600"
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {active && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t-4 border-slate-800 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 font-bold text-sm bg-slate-800 text-slate-300 border-3 border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
          >
            <Home size={18} />
            User Dashboard
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 font-bold text-sm bg-slate-800 text-rose-400 border-3 border-slate-700 hover:bg-rose-500 hover:text-white hover:border-rose-400 transition-all"
          >
            <LogOut size={18} />
            Keluar
          </button>

          {/* User Info */}
          {user && (
            <div className="mt-4 p-3 bg-slate-800 border-3 border-slate-700">
              <p className="text-xs font-mono text-slate-500 tracking-wider mb-1">LOGGED IN AS</p>
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b-4 border-slate-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-500 border-2 border-slate-300 flex items-center justify-center">
            <Terminal size={16} className="text-white" />
          </div>
          <h1 className="text-base font-black text-white tracking-tight">ADMIN PANEL</h1>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/95 pt-20">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 font-bold text-base border-3 transition-all ${
                    active
                      ? "bg-rose-500 text-white border-rose-400 shadow-[4px_4px_0px_#f43f5e]"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4 border-t-2 border-slate-800 mt-4 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-4 font-bold text-base bg-slate-800 text-slate-300 border-3 border-slate-700"
              >
                <Home size={20} />
                User Dashboard
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 font-bold text-base bg-slate-800 text-rose-400 border-3 border-slate-700"
              >
                <LogOut size={20} />
                Keluar
              </button>
            </div>

            {user && (
              <div className="mt-6 p-4 bg-slate-800 border-3 border-slate-700">
                <p className="text-xs font-mono text-slate-500 tracking-wider mb-1">LOGGED IN AS</p>
                <p className="text-base font-bold text-white">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

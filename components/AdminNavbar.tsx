"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Users, Receipt, Clock, LogOut, RefreshCw, Shield, Moon, Sun, Menu, X } from "lucide-react";
import { logoutUser } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";

interface AdminNavbarProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function AdminNavbar({ onRefresh, refreshing = false }: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const navItems = [
    { href: "/admin", label: "Overview", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
    { href: "/admin/pending", label: "Pending", icon: Clock },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[rgb(var(--card))] border-b-4 border-[rgb(var(--foreground))] shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/admin" 
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] border-3 border-[rgb(var(--foreground))] flex items-center justify-center shadow-[3px_3px_0_rgb(var(--foreground)/0.2)] group-hover:shadow-[4px_4px_0_rgb(var(--foreground)/0.25)] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-all duration-200">
              <Shield size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[rgb(var(--foreground))] font-black text-sm tracking-tight leading-none">ADMIN</p>
              <p className="text-[rgb(var(--muted-foreground))] text-[10px] font-mono tracking-wider">PANEL</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={`animate-fade-in flex items-center gap-2 px-4 py-2 font-bold text-sm border-2 transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-[rgb(var(--primary))] text-white border-[rgb(var(--foreground))] shadow-[3px_3px_0_rgb(var(--foreground)/0.2)]"
                    : "bg-transparent text-[rgb(var(--foreground))] border-transparent hover:bg-[rgb(var(--muted))] hover:border-[rgb(var(--border))]"
                }`}
              >
                <item.icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] rounded-lg transition-all duration-200"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? (
                <Sun size={20} className="text-amber-400" />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] rounded-lg font-bold text-sm transition-all duration-200 disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                <span className="hidden lg:inline">Refresh</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive)/0.1)] rounded-lg font-bold text-sm transition-all duration-200"
              title="Keluar"
            >
              <LogOut size={16} />
              <span className="hidden lg:inline">Keluar</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[rgb(var(--border))] animate-fade-in">
            <nav className="flex flex-col gap-2 stagger-children">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-[rgb(var(--primary))] text-white"
                      : "text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <div className="border-t border-[rgb(var(--border))] my-2"></div>
              
              {onRefresh && (
                <button
                  onClick={() => {
                    onRefresh();
                    setMobileMenuOpen(false);
                  }}
                  disabled={refreshing}
                  className="flex items-center gap-3 px-4 py-3 text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] rounded-lg font-bold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                  <span>Refresh Data</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-[rgb(var(--destructive))] hover:bg-[rgb(var(--destructive)/0.1)] rounded-lg font-bold text-sm transition-all duration-200"
              >
                <LogOut size={18} />
                <span>Keluar</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

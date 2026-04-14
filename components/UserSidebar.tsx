"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  History,
  LogOut,
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

// Floating shapes component for animated background
function FloatingShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 border-4 border-black/10 animate-float" />
      <div className="absolute top-40 right-20 w-12 h-12 border-4 border-black/10 rounded-full animate-float-reverse" />
      <div className="absolute bottom-32 left-1/4 w-20 h-20 border-4 border-black/5 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/3 w-8 h-8 border-4 border-black/10 rounded-full animate-bounce-neo" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-20 right-10 w-14 h-14 border-4 border-black/5 animate-float-reverse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-20 w-10 h-10 border-4 border-black/10 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
    </div>
  );
}

export default function UserSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="neo-card p-8">
          <RefreshCw className="w-8 h-8 animate-spin text-black" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Animated Background */}
      <FloatingShapes />
      
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left: Logo & Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 border-4 border-black bg-white hover:bg-black hover:text-white transition-colors"
              style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
            >
              <Menu size={20} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div 
                className="w-10 h-10 bg-black flex items-center justify-center border-4 border-black"
                style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.3)' }}
              >
                <span className="text-white font-black text-sm">RO</span>
              </div>
              <span className="font-black text-xl tracking-tight hidden sm:block">RUMA OTP</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 font-bold text-sm uppercase tracking-wider
                    border-4 border-black transition-all
                    ${isActive 
                      ? "bg-black text-white" 
                      : "bg-white text-black hover:bg-black hover:text-white"
                    }
                  `}
                  style={{ 
                    boxShadow: isActive ? '0px 0px 0px 0px rgba(0,0,0,1)' : '3px 3px 0px 0px rgba(0,0,0,1)',
                    transform: isActive ? 'translate(3px, 3px)' : 'translate(0, 0)'
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User & Balance */}
          <div className="flex items-center gap-3">
            {/* Balance */}
            <div 
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border-4 border-black"
              style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
            >
              <Wallet size={16} />
              <span className="font-bold text-sm">
                {loadingBalance ? "..." : balanceData?.success ? balanceData.data.formated : "Rp 0"}
              </span>
              <button 
                onClick={fetchBalance} 
                disabled={loadingBalance}
                className="p-1 hover:bg-black hover:text-white transition-colors"
              >
                <RefreshCw size={14} className={loadingBalance ? "animate-spin" : ""} />
              </button>
            </div>

            {/* User Menu */}
            <div 
              className="flex items-center gap-2 px-3 py-2 bg-black text-white border-4 border-black"
              style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.3)' }}
            >
              <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-black text-xs">
                {getInitials(user.name)}
              </div>
              <span className="font-bold text-sm hidden md:block">{user.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72
          bg-white border-r-4 border-black
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b-4 border-black">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <span className="text-white font-black text-sm">RO</span>
            </div>
            <span className="font-black text-lg">RUMA OTP</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 border-4 border-black hover:bg-black hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b-4 border-black">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-lg">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate">{user.name}</p>
              <p className="text-sm text-neutral-600 truncate">{user.email}</p>
            </div>
          </div>
          
          {/* Balance */}
          <div 
            className="p-3 bg-white border-4 border-black"
            style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Saldo</span>
              <button 
                onClick={fetchBalance} 
                disabled={loadingBalance}
                className="p-1 hover:bg-black hover:text-white transition-colors"
              >
                <RefreshCw size={12} className={loadingBalance ? "animate-spin" : ""} />
              </button>
            </div>
            <p className="text-xl font-black mt-1">
              {loadingBalance ? "..." : balanceData?.success ? balanceData.data.formated : "Rp 0"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider
                  border-4 border-black transition-all animate-slide-in-left
                  ${isActive 
                    ? "bg-black text-white" 
                    : "bg-white text-black hover:bg-black hover:text-white"
                  }
                `}
                style={{ 
                  boxShadow: isActive ? '0px 0px 0px 0px rgba(0,0,0,1)' : '4px 4px 0px 0px rgba(0,0,0,1)',
                  transform: isActive ? 'translate(4px, 4px)' : 'translate(0, 0)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t-4 border-black space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider border-4 border-black bg-white hover:bg-black hover:text-white transition-all"
            style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
          >
            <Home size={20} />
            <span>Beranda</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wider border-4 border-black bg-white text-black hover:bg-black hover:text-white transition-all"
            style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}

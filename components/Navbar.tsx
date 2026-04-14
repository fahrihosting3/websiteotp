// components/Navbar.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { LogOut, Menu, X, Terminal, User, Mail, Code2, Wallet, ChevronDown, Shield } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import axios from "axios";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      fetchBalance();
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
    setMobileMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
              <Terminal size={16} className="text-gray-600" />
            </div>
            <span className="font-semibold text-lg text-gray-800 tracking-tight hidden sm:inline">
              RUMA OTP
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200"
            >
              Beranda
            </Link>
            <Link 
              href="/#fitur" 
              className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200"
            >
              Fitur
            </Link>

            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/services" 
                  className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200"
                >
                  Layanan
                </Link>
                <Link 
                  href="/deposit" 
                  className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200"
                >
                  Deposit
                </Link>
                {isAdmin() && (
                  <Link 
                    href="/admin" 
                    className="text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors duration-200 flex items-center gap-1"
                  >
                    <Shield size={14} />
                    Admin
                  </Link>
                )}

                {/* Balance + Avatar Section */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200" ref={dropdownRef}>
                  {/* Balance Display */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <Wallet size={14} className="text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800">
                      {loadingBalance ? (
                        <span className="inline-block w-16 h-4 bg-gray-200 rounded animate-pulse" />
                      ) : balanceData?.success ? (
                        balanceData.data.formated
                      ) : (
                        "Rp 0"
                      )}
                    </span>
                  </div>

                  {/* Avatar Button */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-semibold hover:bg-gray-700 transition-colors duration-200 ring-2 ring-gray-200 ring-offset-1">
                        {getInitials(user.name)}
                      </div>
                      <ChevronDown 
                        size={14} 
                        className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} 
                      />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* User Info Header */}
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3 space-y-1">
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <User size={15} className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">Nama</p>
                              <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <Mail size={15} className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <Code2 size={15} className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">Username API</p>
                              <p className="text-sm font-mono font-medium text-gray-800 truncate">{user.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <Wallet size={15} className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">Saldo</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {balanceData?.success ? balanceData.data.formated : "Rp 0"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 p-3">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors duration-200"
                          >
                            <LogOut size={15} />
                            Keluar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="px-4 py-1.5 text-gray-700 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  Masuk
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-gray-600" />
            ) : (
              <Menu size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link
              href="/#fitur"
              className="block text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fitur
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/services"
                  className="block text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Layanan
                </Link>
                <Link
                  href="/deposit"
                  className="block text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Deposit
                </Link>
                {isAdmin() && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors duration-200 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield size={14} />
                    Admin Panel
                  </Link>
                )}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {/* Mobile Balance */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg shrink-0">
                      <Wallet size={12} className="text-gray-500" />
                      <span className="text-xs font-semibold text-gray-800">
                        {loadingBalance ? "..." : balanceData?.success ? balanceData.data.formated : "Rp 0"}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Detail Items */}
                  <div className="space-y-1 px-2">
                    <div className="flex items-center gap-2.5 py-2 text-sm text-gray-600">
                      <Code2 size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">API:</span>
                      <span className="font-mono text-xs font-medium text-gray-800">{user.username}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut size={14} />
                    Keluar
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    router.push("/auth/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-gray-700 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    router.push("/auth/register");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

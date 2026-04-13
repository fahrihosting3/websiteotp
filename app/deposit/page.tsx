// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { User, LogOut, Wallet, Terminal, RefreshCw, ShoppingCart, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    setUser(current);
    fetchBalance();
  }, [router]);

  const fetchBalance = async () => {
    setRefreshing(true);
    if (!process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY) {
      setLoadingBalance(false);
      setRefreshing(false);
      return;
    }

    try {
      const res = await fetch("https://www.rumahotp.io/api/v1/user/balance", {
        headers: {
          "x-apikey": process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      if (data.success) setBalance(data.data);
    } catch (err) {
      console.error("Gagal ambil saldo", err);
    } finally {
      setLoadingBalance(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-gray-50">
        {/* Retro Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(0deg,_#d1d5db_1px,_transparent_1px),linear-gradient(90deg,_#d1d5db_1px,_transparent_1px)] bg-[length:40px_40px] opacity-10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-gray-400" />
                <span className="text-[10px] font-mono text-gray-400 tracking-wider">DASHBOARD</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                <h1 className="text-3xl sm:text-4xl font-light text-gray-900 tracking-tight">
                  Dashboard
                </h1>
              </div>
              <p className="text-gray-500 text-sm ml-3">
                Selamat datang kembali, <span className="font-semibold text-gray-700">{user?.name}</span>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm"
            >
              <LogOut size={14} />
              Keluar
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Saldo Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Wallet size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-gray-400">SALDO</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loadingBalance ? "..." : balance?.formated || "Rp0"}
                    </p>
                  </div>
                </div>
                <button onClick={fetchBalance} disabled={refreshing} className="p-1 text-gray-400 hover:text-gray-600">
                  <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[9px] font-mono text-gray-400">API_USERNAME</p>
                <p className="font-mono text-xs text-gray-700">{balance?.username || "-"}</p>
              </div>
            </div>

            {/* User Card */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <User size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-400">AKUN</p>
                  <p className="text-base font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pilih Layanan Button */}
            <Link 
              href="/services"
              className="block"
            >
              <div 
                className="border-4 border-gray-900 bg-amber-400 p-6 shadow-[6px_6px_0px_#0A0A0A] hover:shadow-[8px_8px_0px_#0A0A0A] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 cursor-pointer h-full"
                style={{ fontFamily: "'Space Mono', 'Courier New', monospace" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-900 border-3 border-gray-900 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
                      <ShoppingCart size={24} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Terminal size={10} className="text-gray-900" />
                        <span className="text-[10px] font-bold tracking-[3px] text-gray-900">RUMAHOTP.IO</span>
                      </div>
                      <h3 className="text-xl font-black tracking-tight text-gray-900">PILIH LAYANAN</h3>
                      <p className="text-xs text-gray-700 tracking-wide mt-1">Beli nomor virtual untuk verifikasi OTP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-900 flex items-center justify-center">
                      <ArrowRight size={20} className="text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Deposit Button */}
            <Link 
              href="/deposit"
              className="block"
            >
              <div 
                className="border-4 border-gray-900 bg-emerald-400 p-6 shadow-[6px_6px_0px_#0A0A0A] hover:shadow-[8px_8px_0px_#0A0A0A] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 cursor-pointer h-full"
                style={{ fontFamily: "'Space Mono', 'Courier New', monospace" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-900 border-3 border-gray-900 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
                      <CreditCard size={24} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Terminal size={10} className="text-gray-900" />
                        <span className="text-[10px] font-bold tracking-[3px] text-gray-900">TOP UP</span>
                      </div>
                      <h3 className="text-xl font-black tracking-tight text-gray-900">DEPOSIT SALDO</h3>
                      <p className="text-xs text-gray-700 tracking-wide mt-1">Isi saldo untuk membeli nomor OTP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-900 flex items-center justify-center">
                      <ArrowRight size={20} className="text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

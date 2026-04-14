// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, refreshUserData } from "@/lib/auth";
import { useRouter } from "next/navigation";
import UserSidebar from "@/components/UserSidebar";
import Link from "next/link";
import {
  User,
  Wallet,
  RefreshCw,
  ShoppingCart,
  ArrowRight,
  CreditCard,
  History,
  Shield,
} from "lucide-react";

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
      
      await refreshUserData();
    } catch (err) {
      console.error("Gagal ambil saldo", err);
    } finally {
      setLoadingBalance(false);
      setRefreshing(false);
    }
  };

  if (!user) return null;

  return (
    <UserSidebar>
      <div className="min-h-full bg-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Selamat datang kembali,</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                {user?.name}
              </h1>
            </div>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
              >
                <Shield size={16} />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Saldo Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-neutral-900 rounded-lg flex items-center justify-center">
                    <Wallet size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">SALDO ANDA</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {loadingBalance ? "..." : balance?.formated || "Rp 0"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={fetchBalance} 
                  disabled={refreshing} 
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <RefreshCw size={16} className={`text-neutral-400 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-[10px] text-neutral-400 font-medium mb-1">API USERNAME</p>
                <p className="font-mono text-sm text-neutral-700">{balance?.username || "-"}</p>
              </div>
            </div>

            {/* User Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <User size={20} className="text-neutral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 font-medium">AKUN ANDA</p>
                  <p className="text-base font-semibold text-neutral-900 truncate">{user?.name}</p>
                  <p className="text-sm text-neutral-500 truncate">{user?.email}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  user?.role === "admin" 
                    ? "bg-red-100 text-red-700" 
                    : "bg-neutral-100 text-neutral-700"
                }`}>
                  {user?.role === "admin" ? <Shield size={12} /> : <User size={12} />}
                  {user?.role?.toUpperCase() || "USER"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h2 className="text-sm font-semibold text-neutral-500 mb-4 uppercase tracking-wide">Menu Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pilih Layanan */}
            <Link href="/services" className="group">
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShoppingCart size={22} className="text-amber-600" />
                  </div>
                  <ArrowRight size={18} className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">Pilih Layanan</h3>
                <p className="text-sm text-neutral-500">Beli nomor virtual untuk verifikasi OTP</p>
              </div>
            </Link>

            {/* Deposit */}
            <Link href="/deposit" className="group">
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CreditCard size={22} className="text-emerald-600" />
                  </div>
                  <ArrowRight size={18} className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">Deposit Saldo</h3>
                <p className="text-sm text-neutral-500">Isi saldo untuk membeli nomor OTP</p>
              </div>
            </Link>

            {/* Riwayat */}
            <Link href="/history" className="group sm:col-span-2 lg:col-span-1">
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <History size={22} className="text-sky-600" />
                  </div>
                  <ArrowRight size={18} className="text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1">Riwayat Transaksi</h3>
                <p className="text-sm text-neutral-500">Lihat semua riwayat deposit dan pembelian</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </UserSidebar>
  );
}

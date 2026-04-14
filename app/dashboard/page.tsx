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
  Zap,
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
      <div className="min-h-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-up">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Selamat datang kembali,
              </p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {user?.name}
              </h1>
            </div>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-5 py-3 bg-black text-white font-bold uppercase tracking-wider border-4 border-black hover:bg-white hover:text-black transition-all"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)' }}
              >
                <Shield size={18} />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 stagger">
            {/* Saldo Card */}
            <div 
              className="bg-white border-4 border-black p-6 animate-slide-up"
              style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 bg-black flex items-center justify-center animate-pulse-neo"
                  >
                    <Wallet size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      SALDO ANDA
                    </p>
                    <p className="text-3xl font-black">
                      {loadingBalance ? "..." : balance?.formated || "Rp 0"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={fetchBalance} 
                  disabled={refreshing} 
                  className="p-3 border-4 border-black hover:bg-black hover:text-white transition-all"
                  style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
                >
                  <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>
              <div 
                className="bg-neutral-100 border-4 border-black p-4"
                style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  API USERNAME
                </p>
                <p className="font-mono font-bold text-lg">{balance?.username || "-"}</p>
              </div>
            </div>

            {/* User Card */}
            <div 
              className="bg-white border-4 border-black p-6 animate-slide-up"
              style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)', animationDelay: '0.1s' }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-16 h-16 bg-black text-white flex items-center justify-center font-black text-2xl"
                >
                  {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    AKUN ANDA
                  </p>
                  <p className="text-xl font-black truncate">{user?.name}</p>
                  <p className="text-sm text-neutral-600 truncate font-medium">{user?.email}</p>
                </div>
                <div 
                  className={`px-4 py-2 border-4 border-black font-black text-sm uppercase ${
                    user?.role === "admin" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                  style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
                >
                  {user?.role?.toUpperCase() || "USER"}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
              <Zap size={16} />
              Menu Cepat
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {/* Pilih Layanan */}
            <Link href="/services" className="group animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div 
                className="bg-white border-4 border-black p-6 h-full transition-all group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]"
                style={{ 
                  boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '12px 12px 0px 0px rgba(0,0,0,1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-14 h-14 bg-black flex items-center justify-center group-hover:animate-wiggle"
                  >
                    <ShoppingCart size={24} className="text-white" />
                  </div>
                  <ArrowRight size={24} className="text-black group-hover:translate-x-2 transition-transform" />
                </div>
                <h3 className="text-xl font-black mb-2">PILIH LAYANAN</h3>
                <p className="text-sm text-neutral-600 font-medium">
                  Beli nomor virtual untuk verifikasi OTP
                </p>
              </div>
            </Link>

            {/* Deposit */}
            <Link href="/deposit" className="group animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div 
                className="bg-white border-4 border-black p-6 h-full transition-all group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]"
                style={{ 
                  boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '12px 12px 0px 0px rgba(0,0,0,1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-14 h-14 bg-black flex items-center justify-center group-hover:animate-wiggle"
                  >
                    <CreditCard size={24} className="text-white" />
                  </div>
                  <ArrowRight size={24} className="text-black group-hover:translate-x-2 transition-transform" />
                </div>
                <h3 className="text-xl font-black mb-2">DEPOSIT SALDO</h3>
                <p className="text-sm text-neutral-600 font-medium">
                  Isi saldo untuk membeli nomor OTP
                </p>
              </div>
            </Link>

            {/* Riwayat */}
            <Link href="/history" className="group sm:col-span-2 lg:col-span-1 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div 
                className="bg-white border-4 border-black p-6 h-full transition-all group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]"
                style={{ 
                  boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '12px 12px 0px 0px rgba(0,0,0,1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,1)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-14 h-14 bg-black flex items-center justify-center group-hover:animate-wiggle"
                  >
                    <History size={24} className="text-white" />
                  </div>
                  <ArrowRight size={24} className="text-black group-hover:translate-x-2 transition-transform" />
                </div>
                <h3 className="text-xl font-black mb-2">RIWAYAT TRANSAKSI</h3>
                <p className="text-sm text-neutral-600 font-medium">
                  Lihat semua riwayat deposit dan pembelian
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </UserSidebar>
  );
}

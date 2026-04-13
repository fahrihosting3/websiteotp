// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { User, Mail, Code2, DollarSign, RefreshCw, LogOut, TrendingUp, CreditCard, Clock } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
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
      console.warn("API Key belum diisi di .env.local");
      setLoadingBalance(false);
      setRefreshing(false);
      return;
    }

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
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        {/* Retro Pattern Background - Elegan */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,_#e5e7eb_1px,_transparent_1px),linear-gradient(90deg,_#e5e7eb_1px,_transparent_1px)] bg-[length:40px_40px] opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          {/* Header Section - Improved */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 animate-fade-in-up">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
                  Dashboard
                </h1>
              </div>
              <p className="text-gray-500 text-sm ml-3">
                Selamat datang kembali, <span className="font-semibold text-gray-700">{user?.name}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
            >
              <LogOut size={16} className="text-gray-500" />
              <span className="text-sm font-medium">Keluar</span>
            </button>
          </div>

          {/* Stats Cards - Elegant */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Account Info Card */}
            <div className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up animation-delay-100">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
                <span className="text-xs text-gray-400">Info</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Nama Lengkap</h3>
              <p className="text-xl font-semibold text-gray-900">{user?.name}</p>
            </div>

            {/* Email Card */}
            <div className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up animation-delay-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Mail size={20} className="text-gray-600" />
                </div>
                <span className="text-xs text-gray-400">Email</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Alamat Email</h3>
              <p className="text-base font-medium text-gray-800 break-all">{user?.email}</p>
            </div>

            {/* Username Card */}
            <div className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up animation-delay-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Code2 size={20} className="text-gray-600" />
                </div>
                <span className="text-xs text-gray-400">API</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Username API</h3>
              <p className="text-base font-mono text-gray-800">{user?.username}</p>
            </div>
          </div>

          {/* Balance Section - Improved */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up animation-delay-400">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <DollarSign size={22} className="text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Saldo Akun</h2>
                  <p className="text-sm text-gray-500">Informasi saldo RUMA OTP Anda</p>
                </div>
              </div>
              <button
                onClick={fetchBalance}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                Refresh Saldo
              </button>
            </div>

            {/* Balance Content */}
            {loadingBalance ? (
              <div className="py-20 text-center">
                <div className="inline-flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 text-sm">Memuat saldo...</p>
                </div>
              </div>
            ) : balanceData?.success ? (
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Total Saldo</p>
                    <CreditCard size={16} className="text-gray-400" />
                  </div>
                  <p className="text-5xl font-bold text-gray-900 mb-3">
                    {balanceData.data.formated}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <TrendingUp size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Saldo mentah: <span className="font-semibold">{balanceData.data.balance.toLocaleString("id-ID")}</span>
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Username API</p>
                    <p className="font-mono text-sm font-semibold text-gray-800">{balanceData.data.username}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Status Akun</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm shadow-green-200"></div>
                      <p className="text-sm font-semibold text-green-600">Aktif</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-red-50/30 rounded-b-2xl">
                <p className="text-red-600 font-medium mb-1">Gagal Memuat Saldo</p>
                <p className="text-gray-500 text-sm">Pastikan API Key sudah benar di file .env.local</p>
              </div>
            )}
          </div>

          {/* Coming Soon - Elegant */}
          <div className="mt-8 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-400">FITUR SEGERA</span>
            </div>
            <p className="text-gray-700 text-sm">
              Fitur beli nomor, daftar service, dan notifikasi SMS real-time akan segera hadir 🚀
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </>
  );
}
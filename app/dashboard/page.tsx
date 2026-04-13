// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { User, Mail, Code2, DollarSign, RefreshCw, LogOut, TrendingUp, Terminal, Cpu } from "lucide-react";

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

        <div className="relative z-10 container-custom py-8 pb-20">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={20} className="text-gray-500" />
                <span className="text-gray-500 font-mono text-xs tracking-wider">DASHBOARD_TERMINAL v1.0</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-2 tracking-tight">
                Dashboard
              </h1>
              <p className="text-gray-500 font-mono text-sm">
                <span className="text-gray-400">➤</span> WELCOME BACK, <span className="text-gray-700">{user?.name?.toUpperCase()}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-600 font-mono text-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            >
              <LogOut size={16} />
              LOGOUT
            </button>
          </div>

          {/* Main Grid - Retro Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Account Info Card */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 animate-fade-in-up animation-delay-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <User size={18} className="text-gray-600" />
                </div>
                <h2 className="text-sm font-mono text-gray-500 tracking-wide">IDENTITY</h2>
              </div>
              <p className="text-xl font-light text-gray-900 mb-1">{user?.name}</p>
              <p className="text-xs text-gray-400 font-mono">Nama lengkap terdaftar</p>
            </div>

            {/* Email Card */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 animate-fade-in-up animation-delay-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Mail size={18} className="text-gray-600" />
                </div>
                <h2 className="text-sm font-mono text-gray-500 tracking-wide">COMMUNICATION</h2>
              </div>
              <p className="text-base font-mono text-gray-700 mb-1 break-all">{user?.email}</p>
              <p className="text-xs text-gray-400 font-mono">Email terdaftar</p>
            </div>

            {/* Username Card */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Code2 size={18} className="text-gray-600" />
                </div>
                <h2 className="text-sm font-mono text-gray-500 tracking-wide">API_KEY</h2>
              </div>
              <p className="font-mono text-base text-gray-700 mb-1">{user?.username}</p>
              <p className="text-xs text-gray-400 font-mono">ID unik untuk integrasi API</p>
            </div>
          </div>

          {/* Balance Section */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 animate-fade-in-up animation-delay-400">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={22} className="text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-light text-gray-900">Saldo RUMA OTP</h2>
                  <p className="text-xs text-gray-400 font-mono tracking-wide">BALANCE_INFORMATION</p>
                </div>
              </div>
              <button
                onClick={fetchBalance}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-mono text-sm hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                REFRESH
              </button>
            </div>

            {/* Balance Content */}
            {loadingBalance ? (
              <div className="py-20 text-center">
                <div className="inline-block">
                  <Cpu size={32} className="text-gray-400 animate-pulse mb-3" />
                  <p className="text-gray-400 font-mono text-sm tracking-wide">LOADING_BALANCE...</p>
                </div>
              </div>
            ) : balanceData?.success ? (
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-500 font-mono text-xs tracking-wide mb-2">TOTAL_BALANCE</p>
                  <p className="text-5xl font-light text-gray-900 mb-2">
                    {balanceData.data.formated}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <TrendingUp size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500 font-mono">
                      RAW: {balanceData.data.balance.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-gray-500 font-mono text-[10px] tracking-wide mb-2">API_USERNAME</p>
                    <p className="font-mono text-sm text-gray-800">{balanceData.data.username}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-gray-500 font-mono text-[10px] tracking-wide mb-2">STATUS</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <p className="font-mono text-sm text-gray-800">ACTIVE</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-red-50/30 rounded-b-2xl">
                <p className="text-red-500 font-mono text-sm font-medium mb-1">ERROR_FETCHING_BALANCE</p>
                <p className="text-gray-400 text-xs font-mono">Pastikan API Key sudah benar di .env.local</p>
              </div>
            )}
          </div>

          {/* Coming Soon - Retro Style */}
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Terminal size={14} className="text-gray-400" />
              <span className="text-gray-400 font-mono text-[10px] tracking-wider">COMING_SOON</span>
            </div>
            <p className="text-gray-500 font-mono text-sm tracking-wide">
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
          animation: fadeInUp 0.6s ease-out forwards;
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
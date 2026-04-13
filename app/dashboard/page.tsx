// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BuyNumber from "@/components/BuyNumber";
import { User, LogOut, Wallet, TrendingUp, Terminal, RefreshCw } from "lucide-react";

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
        {/* Retro Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,_#d1d5db_1px,_transparent_1px),linear-gradient(90deg,_#d1d5db_1px,_transparent_1px)] bg-[length:40px_40px] opacity-10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          {/* Header - Retro Style */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-gray-400" />
                <span className="text-[10px] font-mono text-gray-400 tracking-wider">DASHBOARD_TERMINAL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                <h1 className="text-3xl sm:text-4xl font-light text-gray-900 tracking-tight">
                  Dashboard
                </h1>
              </div>
              <p className="text-gray-500 text-sm ml-3">
                <span className="text-gray-400">➤</span> WELCOME BACK, <span className="font-semibold text-gray-700">{user?.name?.toUpperCase()}</span>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-sm font-mono"
            >
              <LogOut size={14} />
              LOGOUT
            </button>
          </div>

          {/* Stats Cards - Retro Style */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            {/* Saldo Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Wallet size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-gray-400 tracking-wider">BALANCE</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {loadingBalance ? "..." : balance?.formated || "Rp0"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fetchBalance}
                    disabled={refreshing}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={10} className="text-gray-400" />
                    <p className="text-[9px] font-mono text-gray-400 tracking-wider">API_USERNAME</p>
                  </div>
                  <p className="font-mono text-xs text-gray-700">{balance?.username || "-"}</p>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-gray-400 tracking-wider">ACCOUNT_INFO</p>
                    <p className="text-base font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buy Number Section */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-600 text-xs">🛒</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 tracking-wider">ORDER_SECTION</span>
                <span className="text-gray-300 text-xs">//</span>
                <span className="text-xs font-mono text-gray-400 tracking-wider">BELI_NOMOR_VIRTUAL</span>
              </div>
            </div>
            
            <BuyNumber />
          </div>
        </div>
      </div>
    </>
  );
}
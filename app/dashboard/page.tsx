// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BuyNumber from "@/components/BuyNumber";
import { User, LogOut, Wallet, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
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
    if (!process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY) {
      setLoadingBalance(false);
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
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-bold tracking-tighter">Dashboard</h1>
              <p className="text-zinc-400 mt-2 text-lg">
                Selamat datang kembali, <span className="text-white font-medium">{user?.name}</span>
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-2xl transition-all"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Saldo Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <Wallet size={28} />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Saldo Anda</p>
                      <p className="text-4xl font-bold mt-1">
                        {loadingBalance ? "..." : balance?.formated || "Rp0"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fetchBalance}
                    className="text-white/80 hover:text-white transition"
                  >
                    <TrendingUp size={24} />
                  </button>
                </div>

                <div className="bg-black/30 rounded-2xl p-5 text-sm">
                  <p className="text-white/70">Username API</p>
                  <p className="font-mono mt-1">{balance?.username || "-"}</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="lg:col-span-7">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Akun Anda</p>
                    <p className="text-xl font-semibold">{user?.name}</p>
                    <p className="text-zinc-500 text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Fitur Beli Nomor */}
          <div className="mt-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-9 h-9 bg-violet-600/10 rounded-2xl flex items-center justify-center">
                <span className="text-violet-500 text-2xl">🛒</span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">Beli Nomor Virtual OTP</h2>
            </div>

            <BuyNumber />
          </div>

        </div>
      </div>
    </>
  );
}
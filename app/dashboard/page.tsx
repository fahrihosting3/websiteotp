// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { User, Mail, Code2, DollarSign, RefreshCw, LogOut, TrendingUp } from "lucide-react";

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
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-background)] to-[var(--color-surface)] pt-8 pb-20">
        <div className="container-custom">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-2">
                Dashboard
              </h1>
              <p className="text-lg text-[var(--color-text-secondary)]">
                Selamat datang kembali, <strong>{user?.name}</strong>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 text-[var(--color-error)] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 font-medium"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Account Info Card */}
            <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-8 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-xl flex items-center justify-center">
                  <User className="text-[var(--color-primary)]" size={24} />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Nama Lengkap</h2>
              </div>
              <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">{user?.name}</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Profil pengguna Anda</p>
            </div>

            {/* Email Card */}
            <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-8 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                  <Mail className="text-[var(--color-secondary)]" size={24} />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Email</h2>
              </div>
              <p className="text-lg font-semibold text-[var(--color-text-primary)] break-all mb-2">{user?.email}</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Alamat email terdaftar</p>
            </div>

            {/* Username Card */}
            <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-8 card-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                  <Code2 className="text-[var(--color-accent)]" size={24} />
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Username</h2>
              </div>
              <p className="font-mono text-lg font-semibold text-[var(--color-text-primary)] mb-2">{user?.username}</p>
              <p className="text-[var(--color-text-secondary)] text-sm">ID unik untuk API</p>
            </div>
          </div>

          {/* Balance Section */}
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-8 card-shadow">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-[var(--color-secondary)]" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Saldo RUMA OTP</h2>
                  <p className="text-[var(--color-text-secondary)]">Saldo akun Anda saat ini</p>
                </div>
              </div>
              <button
                onClick={fetchBalance}
                disabled={refreshing}
                className="flex items-center gap-2 px-5 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors duration-200 disabled:opacity-50 font-medium"
              >
                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* Balance Content */}
            {loadingBalance ? (
              <div className="py-16 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[var(--color-text-secondary)] font-medium">Memuat saldo...</p>
              </div>
            ) : balanceData?.success ? (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-xl p-8">
                  <p className="text-[var(--color-text-secondary)] text-sm font-medium mb-3">Saldo Total</p>
                  <p className="text-6xl font-bold text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text mb-3">
                    {balanceData.data.formated}
                  </p>
                  <div className="flex items-center gap-2 text-[var(--color-secondary)]">
                    <TrendingUp size={18} />
                    <span className="text-sm font-medium">Saldo mentah: {balanceData.data.balance.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-[var(--color-surface)] rounded-xl p-6">
                    <p className="text-[var(--color-text-secondary)] text-sm font-medium mb-2">Username API</p>
                    <p className="font-mono text-lg font-bold text-[var(--color-text-primary)]">{balanceData.data.username}</p>
                  </div>
                  <div className="bg-[var(--color-surface)] rounded-xl p-6">
                    <p className="text-[var(--color-text-secondary)] text-sm font-medium mb-2">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[var(--color-success)] rounded-full"></div>
                      <p className="font-bold text-[var(--color-text-primary)]">Aktif</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-[var(--color-error)] font-bold text-lg mb-2">Gagal Memuat Saldo</p>
                <p className="text-[var(--color-text-secondary)] text-sm">Pastikan API Key sudah benar di .env.local</p>
              </div>
            )}
          </div>

          {/* Coming Soon */}
          <div className="mt-8 p-6 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 border border-[var(--color-border)] rounded-2xl text-center">
            <p className="text-[var(--color-text-secondary)] font-medium">
              Fitur beli nomor, daftar service, dan notifikasi SMS real-time akan segera hadir 🚀
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

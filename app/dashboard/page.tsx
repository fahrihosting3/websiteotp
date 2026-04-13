// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { User, LogOut, Clock, Plus, ShoppingCart, History } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    setUser(current);
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        {/* Retro Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,_#e5e7eb_1px,_transparent_1px),linear-gradient(90deg,_#e5e7eb_1px,_transparent_1px)] bg-[length:40px_40px] opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 animate-fade-in-up">
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

          {/* User Info Card - Hanya Nama */}
          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-6 mb-10">
            <div className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
                <span className="text-xs text-gray-400">Profil</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Nama Lengkap</h3>
              <p className="text-xl font-semibold text-gray-900">{user?.name}</p>
            </div>
          </div>

          {/* Menu Aksi - Area kosong untuk diisi */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                <Plus size={20} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Beli Nomor</h3>
              <p className="text-sm text-gray-500">Dapatkan nomor virtual untuk verifikasi OTP</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                <ShoppingCart size={20} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Riwayat Pesanan</h3>
              <p className="text-sm text-gray-500">Lihat history pembelian nomor Anda</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                <History size={20} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Notifikasi OTP</h3>
              <p className="text-sm text-gray-500">Lihat semua kode OTP yang masuk</p>
            </div>
          </div>

          {/* Coming Soon / Empty State */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="p-8 text-center">
              <Clock size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Fitur lengkap akan segera hadir. Silakan pilih menu di atas untuk mulai menggunakan layanan.
              </p>
            </div>
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
      `}</style>
    </>
  );
}
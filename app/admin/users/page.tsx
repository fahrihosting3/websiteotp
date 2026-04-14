// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getAllUsers, type UserData } from "@/lib/externalDB";
import { useRouter } from "next/navigation";
import {
  Users,
  RefreshCw,
  AlertCircle,
  Search,
  Wallet,
} from "lucide-react";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current || current.role !== "admin") {
      router.push("/auth/login");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const usersRes = await getAllUsers();
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-slate-600" size={24} />
          <span className="text-slate-600 font-medium">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #475569 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            opacity: 0.06,
          }}
        />
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-200 border-3 border-slate-800 flex items-center justify-center">
              <Users size={24} className="text-slate-800" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
                Daftar Users
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Total {users.length} user terdaftar
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border-3 border-slate-800 shadow-[3px_3px_0px_#1e293b] hover:shadow-[4px_4px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-sm font-bold"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            REFRESH
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari username atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-3 border-slate-800 shadow-[4px_4px_0px_#1e293b] focus:shadow-[6px_6px_0px_#1e293b] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="p-4 text-left text-xs font-bold tracking-wider">USERNAME</th>
                  <th className="p-4 text-left text-xs font-bold tracking-wider">EMAIL</th>
                  <th className="p-4 text-left text-xs font-bold tracking-wider">ROLE</th>
                  <th className="p-4 text-left text-xs font-bold tracking-wider">SALDO</th>
                  <th className="p-4 text-left text-xs font-bold tracking-wider">TERDAFTAR</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr
                    key={u.email}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} border-t-2 border-slate-200 hover:bg-sky-50 transition-colors`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-slate-700">
                          {u.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="font-bold text-sm text-slate-800">{u.username}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-bold border-2 border-slate-800 ${
                          u.role === "admin" ? "bg-rose-100" : "bg-sky-100"
                        }`}
                      >
                        {u.role?.toUpperCase() || "USER"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-slate-400" />
                        <span className="font-bold text-sm text-slate-800">
                          {formatCurrency(u.balance || 0)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">
                  {search ? "Tidak ada user yang cocok" : "Belum ada user terdaftar"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

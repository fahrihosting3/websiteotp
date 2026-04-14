"use client";

import { useEffect, useState } from "react";
import { getAllUsers, type UserData } from "@/lib/externalDB";
import { Users, RefreshCw, AlertCircle, Search } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.username.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await getAllUsers();
      if (res.success && res.data) {
        setUsers(res.data);
        setFilteredUsers(res.data);
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-neutral-800 flex items-center justify-center">
            <RefreshCw className="animate-spin text-neutral-400" size={20} />
          </div>
          <span className="text-neutral-500 text-sm">Memuat data users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-neutral-500 text-xs font-mono mb-1">ADMIN PANEL</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Data Users</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Total <span className="text-white">{users.length}</span> user terdaftar
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Cari username atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 text-sm transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-800 flex items-center justify-center">
              <Users size={18} className="text-neutral-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Daftar User</h2>
              <p className="text-sm text-neutral-500">{filteredUsers.length} user ditemukan</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-800/50">
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">USERNAME</th>
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">EMAIL</th>
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">ROLE</th>
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">SALDO</th>
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">TERDAFTAR</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.email} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white flex items-center justify-center text-neutral-950 font-bold text-sm shrink-0">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-400 text-sm">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-red-950 border border-red-800 text-red-400"
                        : "bg-neutral-800 border border-neutral-700 text-neutral-400"
                    }`}>
                      {u.role?.toUpperCase() || "USER"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{formatCurrency(u.balance || 0)}</td>
                  <td className="px-5 py-4 text-neutral-500 text-sm">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-16 text-neutral-500">
              <AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Tidak ada user ditemukan</p>
              <p className="text-sm">Coba ubah kata kunci pencarian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

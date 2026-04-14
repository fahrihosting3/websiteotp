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
          <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse-neo">
            <RefreshCw className="animate-spin text-black" size={24} />
          </div>
          <span className="text-white text-sm font-mono uppercase tracking-wider">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <p className="text-neutral-500 text-xs font-mono tracking-[0.2em] mb-2">// ADMIN PANEL</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">Data Users</h1>
          <p className="text-neutral-400 text-sm mt-2 font-mono">
            Total <span className="text-white font-bold">{users.length}</span> user terdaftar
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black uppercase text-sm border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Cari username atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black border-4 border-white text-white placeholder-neutral-500 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-sm font-mono transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-black border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
        <div className="p-6 border-b-4 border-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white flex items-center justify-center border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Users size={24} className="text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase">Daftar User</h2>
              <p className="text-sm text-neutral-500 font-mono">{filteredUsers.length} user ditemukan</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-white bg-neutral-900">
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">Username</th>
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">Saldo</th>
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => (
                <tr key={u.email} className={`border-b-4 border-neutral-800 hover:bg-neutral-900 transition-colors ${idx % 2 === 0 ? 'bg-neutral-950' : 'bg-black'}`}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white flex items-center justify-center text-black font-black text-sm border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-white">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-neutral-400 text-sm font-mono">{u.email}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 text-xs font-black uppercase ${
                      u.role === "admin"
                        ? "bg-white text-black border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-neutral-800 text-white border-4 border-neutral-600"
                    }`}>
                      {u.role?.toUpperCase() || "USER"}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-white">{formatCurrency(u.balance || 0)}</td>
                  <td className="px-6 py-5 text-neutral-500 text-sm font-mono">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-16 border-t-4 border-dashed border-neutral-700">
              <AlertCircle size={40} className="mx-auto mb-4 text-neutral-600" />
              <p className="font-black text-white uppercase">Tidak ada user ditemukan</p>
              <p className="text-sm text-neutral-500 font-mono mt-1">Coba ubah kata kunci pencarian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

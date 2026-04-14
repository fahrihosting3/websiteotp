"use client";

import { useEffect, useState } from "react";
import { getAllUsers, type UserData } from "@/lib/externalDB";
import { Users, Terminal, RefreshCw, AlertCircle, Search } from "lucide-react";

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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--info))] flex items-center justify-center animate-pulse">
            <RefreshCw className="animate-spin text-white" size={24} />
          </div>
          <span className="text-[rgb(var(--muted-foreground))] font-medium">Memuat data users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[rgb(var(--muted-foreground))]" />
            <span className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-wider">ADMIN PANEL</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[rgb(var(--info))] to-[rgb(var(--primary))] rounded-full"></div>
            <h1 className="text-3xl sm:text-4xl font-black text-[rgb(var(--foreground))] tracking-tight">
              Data Users
            </h1>
          </div>
          <p className="text-[rgb(var(--muted-foreground))] text-sm ml-4">
            Total <span className="font-semibold text-[rgb(var(--foreground))]">{users.length}</span> user terdaftar
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="btn-neo flex items-center gap-2 px-4 py-2.5 text-[rgb(var(--foreground))] text-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          REFRESH
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Cari username atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[rgb(var(--card))] border-3 border-[rgb(var(--foreground))] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all duration-200"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card-neo overflow-hidden animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="p-6 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[rgb(var(--info)/0.15)] border-2 border-[rgb(var(--info))] rounded-xl flex items-center justify-center">
              <Users size={20} className="text-[rgb(var(--info))]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[rgb(var(--foreground))]">Daftar User</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">{filteredUsers.length} user ditemukan</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-neo">
            <thead>
              <tr>
                <th>USERNAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>SALDO</th>
                <th>TERDAFTAR</th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {filteredUsers.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-[rgb(var(--foreground))]">{u.username}</span>
                    </div>
                  </td>
                  <td className="text-[rgb(var(--muted-foreground))]">{u.email}</td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded border-2 ${
                      u.role === "admin"
                        ? "bg-[rgb(var(--destructive)/0.15)] border-[rgb(var(--destructive))] text-[rgb(var(--destructive))]"
                        : "bg-[rgb(var(--info)/0.15)] border-[rgb(var(--info))] text-[rgb(var(--info))]"
                    }`}>
                      {u.role?.toUpperCase() || "USER"}
                    </span>
                  </td>
                  <td className="font-bold text-[rgb(var(--foreground))]">{formatCurrency(u.balance || 0)}</td>
                  <td className="text-[rgb(var(--muted-foreground))] text-sm">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-16 text-[rgb(var(--muted-foreground))]">
              <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-bold">Tidak ada user ditemukan</p>
              <p className="text-sm">Coba ubah kata kunci pencarian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

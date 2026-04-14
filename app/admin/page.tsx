"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getAllUsers, getAllTransactions, type UserData, type TransactionData } from "@/lib/externalDB";
import {
  Users,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

export default function AdminOverview() {
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    successTransactions: 0,
    cancelledTransactions: 0,
    totalDeposit: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [usersRes, trxRes] = await Promise.all([
        getAllUsers(),
        getAllTransactions(),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }

      if (trxRes.success && trxRes.data) {
        setTransactions(trxRes.data);
        
        const successTrx = trxRes.data.filter((t) => t.status === "success");
        const cancelTrx = trxRes.data.filter((t) => t.status === "cancel" || t.status === "expired");
        const pendingCount = trxRes.data.filter((t) => t.status === "pending");
        const totalDeposit = successTrx.reduce((sum, t) => sum + (t.amount || 0), 0);

        setStats({
          totalUsers: usersRes.data?.length || 0,
          totalTransactions: trxRes.data.length,
          pendingTransactions: pendingCount.length,
          successTransactions: successTrx.length,
          cancelledTransactions: cancelTrx.length,
          totalDeposit,
        });
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-medium">
            <CheckCircle2 size={12} /> Sukses
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 text-xs font-medium">
            <Clock size={12} /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-950 border border-red-800 text-red-400 text-xs font-medium">
            <XCircle size={12} /> {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-neutral-500 text-xs font-mono mb-1">ADMIN PANEL</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Overview</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Selamat datang, <span className="text-white">{user?.name}</span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-neutral-800 flex items-center justify-center">
              <Users size={18} className="text-neutral-400" />
            </div>
          </div>
          <p className="text-neutral-500 text-xs font-mono mb-1">TOTAL USER</p>
          <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-neutral-800 flex items-center justify-center">
              <Receipt size={18} className="text-neutral-400" />
            </div>
          </div>
          <p className="text-neutral-500 text-xs font-mono mb-1">TOTAL TRX</p>
          <p className="text-2xl font-bold text-white">{stats.totalTransactions}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-950 flex items-center justify-center">
              <Clock size={18} className="text-amber-400" />
            </div>
          </div>
          <p className="text-neutral-500 text-xs font-mono mb-1">PENDING</p>
          <p className="text-2xl font-bold text-white">{stats.pendingTransactions}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-950 flex items-center justify-center">
              <Wallet size={18} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-neutral-500 text-xs font-mono mb-1">TOTAL DEPOSIT</p>
          <p className="text-lg font-bold text-white">{formatCurrency(stats.totalDeposit)}</p>
        </div>
      </div>

      {/* Success/Failed Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-xs font-mono mb-1">TRX SUKSES</p>
              <p className="text-2xl font-bold text-white">{stats.successTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-950 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-xs font-mono mb-1">TRX GAGAL</p>
              <p className="text-2xl font-bold text-white">{stats.cancelledTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-red-950 flex items-center justify-center">
              <XCircle size={24} className="text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data */}
      <div className="bg-neutral-900 border border-neutral-800 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-400">TRANSAKSI TERBARU</h3>
              <TrendingUp size={14} className="text-neutral-600" />
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((trx) => (
                <div 
                  key={trx.id} 
                  className="flex items-center justify-between p-3 bg-neutral-800/50 border border-neutral-800 hover:bg-neutral-800 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-white">{trx.userEmail}</p>
                    <p className="text-xs text-neutral-500">{formatDate(trx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-white">{formatCurrency(trx.amount)}</p>
                    {getStatusBadge(trx.status)}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada transaksi</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-400">USER TERBARU</h3>
              <ArrowUpRight size={14} className="text-neutral-600" />
            </div>
            <div className="space-y-3">
              {users.slice(0, 5).map((u) => (
                <div 
                  key={u.email} 
                  className="flex items-center justify-between p-3 bg-neutral-800/50 border border-neutral-800 hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white flex items-center justify-center text-neutral-950 font-bold text-sm">
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{u.username}</p>
                      <p className="text-xs text-neutral-500">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium ${
                    u.role === "admin" 
                      ? "bg-red-950 border border-red-800 text-red-400" 
                      : "bg-neutral-800 border border-neutral-700 text-neutral-400"
                  }`}>
                    {u.role?.toUpperCase() || "USER"}
                  </span>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Belum ada user</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

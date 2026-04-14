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
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle2 size={12} /> OK
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-black uppercase border-2 border-white">
            <Clock size={12} /> WAIT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 text-white text-xs font-black uppercase border-2 border-neutral-600">
            <XCircle size={12} /> {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <p className="text-neutral-500 text-xs font-mono tracking-[0.2em] mb-2">// ADMIN PANEL</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">Overview</h1>
          <p className="text-neutral-400 text-sm mt-2 font-mono">
            Welcome back, <span className="text-white font-bold">{user?.name}</span>
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black uppercase text-sm border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-black border-4 border-white p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="w-12 h-12 bg-white flex items-center justify-center mb-4 border-2 border-black">
            <Users size={24} className="text-black" />
          </div>
          <p className="text-neutral-500 text-[10px] font-mono tracking-[0.15em] mb-1">TOTAL USER</p>
          <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
        </div>

        <div className="bg-black border-4 border-white p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="w-12 h-12 bg-white flex items-center justify-center mb-4 border-2 border-black">
            <Receipt size={24} className="text-black" />
          </div>
          <p className="text-neutral-500 text-[10px] font-mono tracking-[0.15em] mb-1">TOTAL TRX</p>
          <p className="text-4xl font-black text-white">{stats.totalTransactions}</p>
        </div>

        <div className="bg-black border-4 border-white p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="w-12 h-12 bg-neutral-800 border-2 border-white flex items-center justify-center mb-4">
            <Clock size={24} className="text-white" />
          </div>
          <p className="text-neutral-500 text-[10px] font-mono tracking-[0.15em] mb-1">PENDING</p>
          <p className="text-4xl font-black text-white">{stats.pendingTransactions}</p>
        </div>

        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-12 h-12 bg-black flex items-center justify-center mb-4 border-2 border-white">
            <Wallet size={24} className="text-white" />
          </div>
          <p className="text-neutral-600 text-[10px] font-mono tracking-[0.15em] mb-1">TOTAL DEPOSIT</p>
          <p className="text-2xl font-black text-black">{formatCurrency(stats.totalDeposit)}</p>
        </div>
      </div>

      {/* Success/Failed Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-[10px] font-mono tracking-[0.15em] mb-1">TRX SUKSES</p>
              <p className="text-4xl font-black text-black">{stats.successTransactions}</p>
            </div>
            <div className="w-16 h-16 bg-black flex items-center justify-center border-2 border-black">
              <CheckCircle2 size={32} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-black border-4 border-white p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-[10px] font-mono tracking-[0.15em] mb-1">TRX GAGAL</p>
              <p className="text-4xl font-black text-white">{stats.cancelledTransactions}</p>
            </div>
            <div className="w-16 h-16 bg-neutral-800 flex items-center justify-center border-2 border-white">
              <XCircle size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data */}
      <div className="bg-black border-4 border-white p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Transaksi Terbaru</h3>
              <TrendingUp size={16} className="text-neutral-600" />
            </div>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((trx) => (
                <div 
                  key={trx.id} 
                  className="flex items-center justify-between p-4 bg-neutral-900 border-2 border-white hover:bg-neutral-800 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
                >
                  <div>
                    <p className="font-bold text-sm text-white">{trx.userEmail}</p>
                    <p className="text-xs text-neutral-500 font-mono">{formatDate(trx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-white mb-1">{formatCurrency(trx.amount)}</p>
                    {getStatusBadge(trx.status)}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-neutral-700">
                  <AlertCircle size={32} className="mx-auto mb-3 text-neutral-600" />
                  <p className="text-sm text-neutral-500 font-mono">No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">User Terbaru</h3>
              <ArrowUpRight size={16} className="text-neutral-600" />
            </div>
            <div className="space-y-3">
              {users.slice(0, 5).map((u) => (
                <div 
                  key={u.email} 
                  className="flex items-center justify-between p-4 bg-neutral-900 border-2 border-white hover:bg-neutral-800 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white flex items-center justify-center text-black font-black text-sm border-2 border-black">
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{u.username}</p>
                      <p className="text-xs text-neutral-500 font-mono">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-black uppercase ${
                    u.role === "admin" 
                      ? "bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                      : "bg-neutral-800 text-white border-2 border-neutral-600"
                  }`}>
                    {u.role?.toUpperCase() || "USER"}
                  </span>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-neutral-700">
                  <AlertCircle size={32} className="mx-auto mb-3 text-neutral-600" />
                  <p className="text-sm text-neutral-500 font-mono">No users yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

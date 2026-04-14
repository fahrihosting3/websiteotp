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
  Terminal,
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
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgb(var(--success)/0.15)] border-2 border-[rgb(var(--success))] text-[rgb(var(--success))] text-xs font-bold rounded">
            <CheckCircle2 size={12} /> SUKSES
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgb(var(--warning)/0.15)] border-2 border-[rgb(var(--warning))] text-[rgb(var(--warning))] text-xs font-bold rounded">
            <Clock size={12} /> PENDING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgb(var(--destructive)/0.15)] border-2 border-[rgb(var(--destructive))] text-[rgb(var(--destructive))] text-xs font-bold rounded">
            <XCircle size={12} /> {status.toUpperCase()}
          </span>
        );
    }
  };

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
            <div className="w-1.5 h-8 bg-gradient-to-b from-[rgb(var(--primary))] to-[rgb(var(--secondary))] rounded-full"></div>
            <h1 className="text-3xl sm:text-4xl font-black text-[rgb(var(--foreground))] tracking-tight">
              Overview
            </h1>
          </div>
          <p className="text-[rgb(var(--muted-foreground))] text-sm ml-4">
            Selamat datang, <span className="font-semibold text-[rgb(var(--foreground))]">{user?.name}</span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <div className="card-neo p-5 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[rgb(var(--info)/0.15)] border-2 border-[rgb(var(--info))] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users size={20} className="text-[rgb(var(--info))]" />
            </div>
          </div>
          <p className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-wider mb-1">TOTAL USER</p>
          <p className="text-3xl font-black text-[rgb(var(--foreground))]">{stats.totalUsers}</p>
        </div>

        <div className="card-neo p-5 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[rgb(var(--secondary)/0.15)] border-2 border-[rgb(var(--secondary))] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Receipt size={20} className="text-[rgb(var(--secondary))]" />
            </div>
          </div>
          <p className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-wider mb-1">TOTAL TRX</p>
          <p className="text-3xl font-black text-[rgb(var(--foreground))]">{stats.totalTransactions}</p>
        </div>

        <div className="card-neo p-5 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[rgb(var(--warning)/0.15)] border-2 border-[rgb(var(--warning))] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Clock size={20} className="text-[rgb(var(--warning))]" />
            </div>
          </div>
          <p className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-wider mb-1">PENDING</p>
          <p className="text-3xl font-black text-[rgb(var(--foreground))]">{stats.pendingTransactions}</p>
        </div>

        <div className="card-neo p-5 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[rgb(var(--success)/0.15)] border-2 border-[rgb(var(--success))] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Wallet size={20} className="text-[rgb(var(--success))]" />
            </div>
          </div>
          <p className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-wider mb-1">TOTAL DEPOSIT</p>
          <p className="text-xl font-black text-[rgb(var(--foreground))]">{formatCurrency(stats.totalDeposit)}</p>
        </div>
      </div>

      {/* Success/Failed Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 stagger-children">
        <div className="card-neo p-5 bg-[rgb(var(--success)/0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-wider mb-1">TRX SUKSES</p>
              <p className="text-3xl font-black text-[rgb(var(--foreground))]">{stats.successTransactions}</p>
            </div>
            <div className="w-14 h-14 bg-[rgb(var(--success)/0.2)] rounded-full flex items-center justify-center">
              <CheckCircle2 size={28} className="text-[rgb(var(--success))]" />
            </div>
          </div>
        </div>
        <div className="card-neo p-5 bg-[rgb(var(--destructive)/0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-wider mb-1">TRX GAGAL</p>
              <p className="text-3xl font-black text-[rgb(var(--foreground))]">{stats.cancelledTransactions}</p>
            </div>
            <div className="w-14 h-14 bg-[rgb(var(--destructive)/0.2)] rounded-full flex items-center justify-center">
              <XCircle size={28} className="text-[rgb(var(--destructive))]" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data */}
      <div className="card-neo p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[rgb(var(--muted-foreground))] tracking-wider">TRANSAKSI TERBARU</h3>
              <TrendingUp size={16} className="text-[rgb(var(--primary))]" />
            </div>
            <div className="space-y-3 stagger-children">
              {transactions.slice(0, 5).map((trx) => (
                <div 
                  key={trx.id} 
                  className="flex items-center justify-between p-3 bg-[rgb(var(--muted)/0.5)] rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] transition-all duration-200"
                >
                  <div>
                    <p className="font-bold text-sm text-[rgb(var(--foreground))]">{trx.userEmail}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{formatDate(trx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-[rgb(var(--foreground))]">{formatCurrency(trx.amount)}</p>
                    {getStatusBadge(trx.status)}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                  <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Belum ada transaksi</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[rgb(var(--muted-foreground))] tracking-wider">USER TERBARU</h3>
              <ArrowUpRight size={16} className="text-[rgb(var(--secondary))]" />
            </div>
            <div className="space-y-3 stagger-children">
              {users.slice(0, 5).map((u) => (
                <div 
                  key={u.email} 
                  className="flex items-center justify-between p-3 bg-[rgb(var(--muted)/0.5)] rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] flex items-center justify-center text-white font-bold text-sm">
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[rgb(var(--foreground))]">{u.username}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{u.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded border-2 ${
                    u.role === "admin" 
                      ? "bg-[rgb(var(--destructive)/0.15)] border-[rgb(var(--destructive))] text-[rgb(var(--destructive))]" 
                      : "bg-[rgb(var(--info)/0.15)] border-[rgb(var(--info))] text-[rgb(var(--info))]"
                  }`}>
                    {u.role?.toUpperCase() || "USER"}
                  </span>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                  <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Belum ada user</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

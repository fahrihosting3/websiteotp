"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Terminal,
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  Activity,
  Loader2,
  Shield,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  pendingTransactions: number;
  successTransactions: number;
  totalDeposits: number;
  totalAmount: number;
}

interface Transaction {
  id: string;
  externalId: string;
  userEmail: string;
  type: string;
  amount: number;
  fee: number;
  total: number;
  status: string;
  method: string;
  createdAt: string;
  paidAt?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "users">("overview");
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    
    if (!isAdmin()) {
      router.push("/dashboard");
      return;
    }
    
    setUser(current);
    fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
        setTransactions(data.recentTransactions);
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-teal-200 text-teal-800";
      case "pending":
        return "bg-amber-200 text-amber-800";
      case "failed":
      case "cancel":
      case "expired":
        return "bg-rose-200 text-rose-800";
      default:
        return "bg-slate-200 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 size={14} />;
      case "pending":
        return <Clock size={14} />;
      default:
        return <XCircle size={14} />;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-100">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
            <p className="text-slate-600 font-medium">Memuat data admin...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-slate-100">
        {/* Pattern Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #475569 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
              opacity: 0.06,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 group"
            >
              <div className="w-10 h-10 bg-white border-3 border-slate-800 flex items-center justify-center shadow-[3px_3px_0px_#1e293b] group-hover:shadow-[4px_4px_0px_#1e293b] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-all">
                <ArrowLeft size={18} className="text-slate-800" />
              </div>
              <span className="font-bold text-sm tracking-wide">KEMBALI</span>
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield size={14} className="text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-500 tracking-[3px]">
                    ADMIN PANEL
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                  DASHBOARD ADMIN
                </h1>
                <p className="text-slate-600 mt-2">
                  Kelola pengguna dan transaksi
                </p>
              </div>

              <button
                onClick={fetchAdminData}
                disabled={refreshing}
                className="w-12 h-12 bg-white border-3 border-slate-800 flex items-center justify-center shadow-[3px_3px_0px_#1e293b] hover:shadow-[4px_4px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={`text-slate-800 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-sky-200 border-2 border-slate-800 flex items-center justify-center">
                  <Users size={18} className="text-slate-800" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 tracking-[2px]">TOTAL USER</p>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.activeUsers || 0} aktif 24 jam terakhir
              </p>
            </div>

            <div className="bg-white border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-200 border-2 border-slate-800 flex items-center justify-center">
                  <CreditCard size={18} className="text-slate-800" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 tracking-[2px]">TOTAL TRX</p>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats?.totalTransactions || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.successTransactions || 0} berhasil
              </p>
            </div>

            <div className="bg-white border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-200 border-2 border-slate-800 flex items-center justify-center">
                  <Activity size={18} className="text-slate-800" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 tracking-[2px]">PENDING</p>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats?.pendingTransactions || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                Transaksi sedang berjalan
              </p>
            </div>

            <div className="bg-white border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-200 border-2 border-slate-800 flex items-center justify-center">
                  <DollarSign size={18} className="text-slate-800" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 tracking-[2px]">TOTAL DEPOSIT</p>
              </div>
              <p className="text-2xl font-black text-slate-800">{formatCurrency(stats?.totalAmount || 0)}</p>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.totalDeposits || 0} deposit berhasil
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["overview", "transactions", "users"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-bold text-sm border-3 border-slate-800 transition-all ${
                  activeTab === tab
                    ? "bg-slate-800 text-white shadow-none"
                    : "bg-white text-slate-800 shadow-[3px_3px_0px_#1e293b] hover:shadow-[4px_4px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                }`}
              >
                {tab === "overview" ? "OVERVIEW" : tab === "transactions" ? "TRANSAKSI" : "PENGGUNA"}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-white border-4 border-slate-800 p-6 shadow-[6px_6px_0px_#1e293b]">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} />
                  TRANSAKSI TERBARU
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="border-2 border-slate-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-slate-500 truncate max-w-[150px]">
                          {tx.userEmail}
                        </span>
                        <span className={`px-2 py-1 text-[10px] font-bold flex items-center gap-1 ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          {tx.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{formatCurrency(tx.amount)}</span>
                        <span className="text-[10px] text-slate-500">{formatDate(tx.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-slate-500 text-center py-8">Belum ada transaksi</p>
                  )}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white border-4 border-slate-800 p-6 shadow-[6px_6px_0px_#1e293b]">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Users size={18} />
                  PENGGUNA TERBARU
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {users.slice(0, 10).map((u) => (
                    <div key={u.id} className="border-2 border-slate-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-800">{u.name}</span>
                        <span className={`px-2 py-1 text-[10px] font-bold ${
                          u.role === "admin" ? "bg-purple-200 text-purple-800" : "bg-slate-200 text-slate-800"
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{u.email}</span>
                        <span className="text-xs font-bold text-teal-600">{formatCurrency(u.balance)}</span>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-slate-500 text-center py-8">Belum ada pengguna</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="bg-white border-4 border-slate-800 p-6 shadow-[6px_6px_0px_#1e293b]">
              <h3 className="text-lg font-black text-slate-800 mb-4">SEMUA TRANSAKSI</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-4 border-slate-800">
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">ID</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">USER</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">TIPE</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">JUMLAH</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">FEE</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">TOTAL</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">STATUS</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">TANGGAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-200">
                        <td className="py-3 px-2 text-xs font-mono text-slate-600 truncate max-w-[100px]">
                          {tx.externalId}
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-600 truncate max-w-[150px]">
                          {tx.userEmail}
                        </td>
                        <td className="py-3 px-2 text-xs font-bold text-slate-800 uppercase">
                          {tx.type}
                        </td>
                        <td className="py-3 px-2 text-sm font-bold text-slate-800">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-500">
                          {formatCurrency(tx.fee)}
                        </td>
                        <td className="py-3 px-2 text-sm font-bold text-slate-800">
                          {formatCurrency(tx.total)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 text-[10px] font-bold inline-flex items-center gap-1 ${getStatusColor(tx.status)}`}>
                            {getStatusIcon(tx.status)}
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-[10px] text-slate-500">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <p className="text-slate-500 text-center py-12">Belum ada transaksi</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white border-4 border-slate-800 p-6 shadow-[6px_6px_0px_#1e293b]">
              <h3 className="text-lg font-black text-slate-800 mb-4">SEMUA PENGGUNA</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-4 border-slate-800">
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">NAMA</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">EMAIL</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">ROLE</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">SALDO</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">TERDAFTAR</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-slate-600">LOGIN TERAKHIR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-200">
                        <td className="py-3 px-2 text-sm font-bold text-slate-800">
                          {u.name}
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-600">
                          {u.email}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 text-[10px] font-bold ${
                            u.role === "admin" ? "bg-purple-200 text-purple-800" : "bg-slate-200 text-slate-800"
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm font-bold text-teal-600">
                          {formatCurrency(u.balance)}
                        </td>
                        <td className="py-3 px-2 text-[10px] text-slate-500">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="py-3 px-2 text-[10px] text-slate-500">
                          {u.lastLoginAt ? formatDate(u.lastLoginAt) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-slate-500 text-center py-12">Belum ada pengguna</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

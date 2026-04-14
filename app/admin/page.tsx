// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser, isAdmin } from "@/lib/auth";
import { getAllUsers, getAllTransactions, getPendingTransactions, type UserData, type TransactionData } from "@/lib/externalDB";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminSidebar from "@/components/AdminSidebar";
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
} from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
  const [pendingTrx, setPendingTrx] = useState<TransactionData[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "transactions" | "pending">("overview");
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    
    // Check if user is admin
    if (current.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    
    setUser(current);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch all data in parallel
      const [usersRes, trxRes, pendingRes] = await Promise.all([
        getAllUsers(),
        getAllTransactions(),
        getPendingTransactions(),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }

      if (trxRes.success && trxRes.data) {
        setTransactions(trxRes.data);
        
        // Calculate stats
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

      if (pendingRes.success && pendingRes.data) {
        setPendingTrx(pendingRes.data);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/");
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
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 border-2 border-slate-800 text-xs font-bold text-slate-800">
            <CheckCircle2 size={12} /> SUKSES
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 border-2 border-slate-800 text-xs font-bold text-slate-800">
            <Clock size={12} /> PENDING
          </span>
        );
      case "cancel":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 border-2 border-slate-800 text-xs font-bold text-slate-800">
            <XCircle size={12} /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 border-2 border-slate-800 text-xs font-bold text-slate-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-slate-600" size={24} />
          <span className="text-slate-600 font-medium">Memuat data admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={fetchData}
        onLogout={handleLogout}
        refreshing={refreshing}
        stats={{
          totalUsers: stats.totalUsers,
          totalTransactions: stats.totalTransactions,
          pendingTransactions: stats.pendingTransactions,
        }}
      />

      {/* Main Content - with sidebar offset on desktop */}
      <div className="lg:pl-64 min-h-screen transition-all duration-300">
        {/* Background Pattern */}
        <div className="fixed inset-0 lg:pl-64 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #475569 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
              opacity: 0.06,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">ADMIN PANEL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  {activeTab === "overview" && "Overview"}
                  {activeTab === "users" && "Data Users"}
                  {activeTab === "transactions" && "Semua Transaksi"}
                  {activeTab === "pending" && "Transaksi Pending"}
                </h1>
              </div>
              <p className="text-slate-500 text-sm ml-3">
                Selamat datang, <span className="font-semibold text-slate-700">{user?.name}</span>
              </p>
            </div>

            {/* Mobile refresh button */}
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="lg:hidden flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border-3 border-slate-800 shadow-[3px_3px_0px_#1e293b] hover:shadow-[4px_4px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-sm font-bold"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              REFRESH
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-sky-200 border-2 border-slate-800 flex items-center justify-center">
                  <Users size={18} className="text-slate-800" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 tracking-wider">TOTAL USER</p>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats.totalUsers}</p>
            </div>

            <div className="bg-white border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-200 border-2 border-slate-800 flex items-center justify-center">
                  <Receipt size={18} className="text-slate-800" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 tracking-wider">TOTAL TRX</p>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats.totalTransactions}</p>
            </div>

            <div className="bg-white border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-200 border-2 border-slate-800 flex items-center justify-center">
                  <Clock size={18} className="text-slate-800" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 tracking-wider">PENDING</p>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats.pendingTransactions}</p>
            </div>

            <div className="bg-white border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-200 border-2 border-slate-800 flex items-center justify-center">
                  <Wallet size={18} className="text-slate-800" />
                </div>
                <p className="text-[10px] font-mono text-slate-500 tracking-wider">TOTAL DEPOSIT</p>
              </div>
              <p className="text-xl font-black text-slate-800">{formatCurrency(stats.totalDeposit)}</p>
            </div>
          </div>

          {/* Success/Failed Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-teal-50 border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-slate-600 tracking-wider mb-1">TRX SUKSES</p>
                  <p className="text-2xl font-black text-slate-800">{stats.successTransactions}</p>
                </div>
                <CheckCircle2 size={32} className="text-teal-600" />
              </div>
            </div>
            <div className="bg-rose-50 border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-slate-600 tracking-wider mb-1">TRX GAGAL/EXPIRED</p>
                  <p className="text-2xl font-black text-slate-800">{stats.cancelledTransactions}</p>
                </div>
                <XCircle size={32} className="text-rose-600" />
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b]">
            {activeTab === "overview" && (
              <div className="p-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Transactions */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-3 tracking-wider">TRANSAKSI TERBARU</h3>
                    <div className="space-y-2">
                      {transactions.slice(0, 5).map((trx) => (
                        <div key={trx.id} className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-800">
                          <div>
                            <p className="font-bold text-sm text-slate-800">{trx.userEmail}</p>
                            <p className="text-xs text-slate-500">{formatDate(trx.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-slate-800">{formatCurrency(trx.amount)}</p>
                            {getStatusBadge(trx.status)}
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                          <p>Belum ada transaksi</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Users */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-3 tracking-wider">USER TERBARU</h3>
                    <div className="space-y-2">
                      {users.slice(0, 5).map((u) => (
                        <div key={u.email} className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-800">
                          <div>
                            <p className="font-bold text-sm text-slate-800">{u.username}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-slate-800 ${
                              u.role === "admin" ? "bg-rose-100" : "bg-sky-100"
                            }`}>
                              {u.role?.toUpperCase() || "USER"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                          <p>Belum ada user</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="p-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">Daftar User ({users.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="p-3 text-left text-xs font-bold tracking-wider">USERNAME</th>
                        <th className="p-3 text-left text-xs font-bold tracking-wider">EMAIL</th>
                        <th className="p-3 text-left text-xs font-bold tracking-wider">ROLE</th>
                        <th className="p-3 text-left text-xs font-bold tracking-wider">SALDO</th>
                        <th className="p-3 text-left text-xs font-bold tracking-wider">TERDAFTAR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, idx) => (
                        <tr key={u.email} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-3 font-bold text-sm text-slate-800">{u.username}</td>
                          <td className="p-3 text-sm text-slate-600">{u.email}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-slate-800 ${
                              u.role === "admin" ? "bg-rose-100" : "bg-sky-100"
                            }`}>
                              {u.role?.toUpperCase() || "USER"}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-sm text-slate-800">{formatCurrency(u.balance || 0)}</td>
                          <td className="p-3 text-sm text-slate-600">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Belum ada user terdaftar</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="p-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">Semua Transaksi ({transactions.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="p-3 text-left text-xs font-bold tracking-wider">ID</th>
                        <th className="p-3 text-left text-xs font-bold tracking-wider">USER</th>
                        <th className="p-3 text-left text-xs font-bold tracking-wider">TIPE</th>
                        <th className="p-3 text-left text-xs font-bold tracking-wider">NOMINAL</th>
                        <th className="p-3 text-left text-xs font-bold tracking-wider">STATUS</th>
                        <th className="p-3 text-left text-xs font-bold tracking-wider">TANGGAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((trx, idx) => (
                        <tr key={trx.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-3 font-mono text-xs text-slate-600">{trx.depositId || trx.id}</td>
                          <td className="p-3 text-sm text-slate-800">{trx.userEmail}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-slate-800 bg-sky-100">
                              {trx.type?.toUpperCase() || "DEPOSIT"}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-sm text-slate-800">{formatCurrency(trx.amount)}</td>
                          <td className="p-3">{getStatusBadge(trx.status)}</td>
                          <td className="p-3 text-sm text-slate-600">{formatDate(trx.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Belum ada transaksi</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "pending" && (
              <div className="p-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">Transaksi Pending ({pendingTrx.length})</h2>
                <div className="space-y-3">
                  {pendingTrx.map((trx) => (
                    <div key={trx.id} className="bg-amber-50 border-3 border-slate-800 p-4 shadow-[4px_4px_0px_#1e293b]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-slate-800">{trx.userEmail}</p>
                          <p className="text-xs font-mono text-slate-500">{trx.depositId}</p>
                        </div>
                        {getStatusBadge(trx.status)}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs">Nominal</p>
                          <p className="font-bold text-slate-800">{formatCurrency(trx.amount)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Total</p>
                          <p className="font-bold text-slate-800">{formatCurrency(trx.total)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs">Dibuat</p>
                          <p className="font-bold text-slate-800">{formatDate(trx.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingTrx.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <CheckCircle2 size={48} className="mx-auto mb-3 text-teal-500" />
                      <p className="font-bold">Tidak ada transaksi pending</p>
                      <p className="text-sm">Semua transaksi sudah diproses</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

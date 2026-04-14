// app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getTransactionsByUser, type TransactionData } from "@/lib/externalDB";
import { useRouter } from "next/navigation";
import UserSidebar from "@/components/UserSidebar";
import {
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  Wallet,
  Filter,
} from "lucide-react";

export default function HistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filteredTrx, setFilteredTrx] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "success" | "pending" | "failed">("all");
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    setUser(current);
    fetchTransactions(current.email);
  }, [router]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredTrx(transactions);
    } else if (filter === "failed") {
      setFilteredTrx(transactions.filter((t) => t.status === "cancel" || t.status === "expired"));
    } else {
      setFilteredTrx(transactions.filter((t) => t.status === filter));
    }
  }, [filter, transactions]);

  const fetchTransactions = async (email: string) => {
    setRefreshing(true);
    try {
      const res = await getTransactionsByUser(email);
      if (res.success && res.data) {
        setTransactions(res.data);
        setFilteredTrx(res.data);
      }
    } catch (err) {
      console.error("Gagal ambil transaksi", err);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 size={18} className="text-emerald-600" />;
      case "pending":
        return <Clock size={18} className="text-amber-600" />;
      default:
        return <XCircle size={18} className="text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            <CheckCircle2 size={12} /> Sukses
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
            <Clock size={12} /> Pending
          </span>
        );
      case "cancel":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            <XCircle size={12} /> {status === "cancel" ? "Dibatalkan" : "Kadaluarsa"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-full">
            {status}
          </span>
        );
    }
  };

  // Calculate stats
  const stats = {
    total: transactions.length,
    success: transactions.filter((t) => t.status === "success").length,
    pending: transactions.filter((t) => t.status === "pending").length,
    failed: transactions.filter((t) => t.status === "cancel" || t.status === "expired").length,
    totalAmount: transactions.filter((t) => t.status === "success").reduce((sum, t) => sum + t.amount, 0),
  };

  if (!user) return null;

  return (
    <UserSidebar>
      <div className="min-h-full bg-neutral-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Riwayat Transaksi</h1>
              <p className="text-sm text-neutral-500 mt-1">Lihat semua aktivitas transaksi Anda</p>
            </div>

            <button
              onClick={() => user && fetchTransactions(user.email)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Receipt size={14} className="text-neutral-400" />
                <p className="text-xs text-neutral-500 font-medium">Total</p>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <p className="text-xs text-neutral-500 font-medium">Sukses</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{stats.success}</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-amber-500" />
                <p className="text-xs text-neutral-500 font-medium">Pending</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <XCircle size={14} className="text-red-500" />
                <p className="text-xs text-neutral-500 font-medium">Gagal</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>

          {/* Total Deposit Card */}
          <div className="bg-neutral-900 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center">
                  <Wallet size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium">TOTAL DEPOSIT SUKSES</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[
              { id: "all", label: "Semua", count: stats.total },
              { id: "success", label: "Sukses", count: stats.success },
              { id: "pending", label: "Pending", count: stats.pending },
              { id: "failed", label: "Gagal", count: stats.failed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <Filter size={14} />
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-neutral-400" />
                <p className="text-neutral-500 font-medium">Memuat transaksi...</p>
              </div>
            ) : filteredTrx.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {filteredTrx.map((trx) => (
                  <div key={trx.id} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                          trx.status === "success" ? "bg-emerald-100" :
                          trx.status === "pending" ? "bg-amber-100" :
                          "bg-red-100"
                        }`}>
                          {getStatusIcon(trx.status)}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">
                            {trx.type === "deposit" ? "Deposit Saldo" : "Pembelian"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-neutral-500 text-xs">
                            <Calendar size={12} />
                            <span>{formatDate(trx.createdAt)}</span>
                          </div>
                          {trx.depositId && (
                            <p className="text-[11px] font-mono text-neutral-400 mt-1">
                              ID: {trx.depositId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <p className={`text-lg font-bold ${
                          trx.type === "deposit" && trx.status === "success" ? "text-emerald-600" : "text-neutral-900"
                        }`}>
                          {trx.type === "deposit" ? "+" : "-"}{formatCurrency(trx.amount)}
                        </p>
                        {getStatusBadge(trx.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Receipt size={40} className="mx-auto mb-3 text-neutral-300" />
                <p className="text-neutral-500 font-medium">Tidak ada transaksi</p>
                <p className="text-neutral-400 text-sm mt-1">
                  {filter !== "all" ? "Coba filter lainnya" : "Transaksi Anda akan muncul di sini"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserSidebar>
  );
}

// app/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getTransactionsByUser, type TransactionData } from "@/lib/externalDB";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  ArrowLeft,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
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
        return <CheckCircle2 size={20} className="text-teal-600" />;
      case "pending":
        return <Clock size={20} className="text-amber-600" />;
      default:
        return <XCircle size={20} className="text-rose-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 border-3 border-slate-800 text-xs font-black text-slate-800">
            <CheckCircle2 size={12} /> SUKSES
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 border-3 border-slate-800 text-xs font-black text-slate-800">
            <Clock size={12} /> PENDING
          </span>
        );
      case "cancel":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 border-3 border-slate-800 text-xs font-black text-slate-800">
            <XCircle size={12} /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border-3 border-slate-800 text-xs font-black text-slate-800">
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

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-slate-100">
        {/* Background Pattern */}
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

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="space-y-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm font-medium mb-2"
              >
                <ArrowLeft size={16} />
                Kembali ke Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-slate-400" />
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">HISTORY</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-sky-500 rounded-full"></div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                  Riwayat Transaksi
                </h1>
              </div>
            </div>

            <button
              onClick={() => user && fetchTransactions(user.email)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border-3 border-slate-800 shadow-[3px_3px_0px_#1e293b] hover:shadow-[4px_4px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-sm font-bold"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              REFRESH
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-4 border-slate-800 p-4 shadow-[4px_4px_0px_#1e293b]">
              <div className="flex items-center gap-2 mb-2">
                <Receipt size={16} className="text-slate-600" />
                <p className="text-[10px] font-mono text-slate-500 tracking-wider">TOTAL</p>
              </div>
              <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            </div>
            <div className="bg-teal-50 border-4 border-slate-800 p-4 shadow-[4px_4px_0px_#1e293b]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-teal-600" />
                <p className="text-[10px] font-mono text-slate-500 tracking-wider">SUKSES</p>
              </div>
              <p className="text-2xl font-black text-slate-800">{stats.success}</p>
            </div>
            <div className="bg-amber-50 border-4 border-slate-800 p-4 shadow-[4px_4px_0px_#1e293b]">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-amber-600" />
                <p className="text-[10px] font-mono text-slate-500 tracking-wider">PENDING</p>
              </div>
              <p className="text-2xl font-black text-slate-800">{stats.pending}</p>
            </div>
            <div className="bg-rose-50 border-4 border-slate-800 p-4 shadow-[4px_4px_0px_#1e293b]">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={16} className="text-rose-600" />
                <p className="text-[10px] font-mono text-slate-500 tracking-wider">GAGAL</p>
              </div>
              <p className="text-2xl font-black text-slate-800">{stats.failed}</p>
            </div>
          </div>

          {/* Total Deposit Card */}
          <div className="bg-emerald-400 border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b] mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-800 flex items-center justify-center">
                  <Wallet size={24} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-800 tracking-wider">TOTAL DEPOSIT SUKSES</p>
                  <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "all", label: "SEMUA", count: stats.total },
              { id: "success", label: "SUKSES", count: stats.success },
              { id: "pending", label: "PENDING", count: stats.pending },
              { id: "failed", label: "GAGAL", count: stats.failed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-sm border-3 border-slate-800 transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? "bg-slate-800 text-white shadow-[3px_3px_0px_#475569]"
                    : "bg-white text-slate-800 shadow-[2px_2px_0px_#1e293b] hover:shadow-[3px_3px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                }`}
              >
                <Filter size={14} />
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="bg-white border-4 border-slate-800 shadow-[6px_6px_0px_#1e293b] overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-slate-400" />
                <p className="text-slate-500 font-medium">Memuat transaksi...</p>
              </div>
            ) : filteredTrx.length > 0 ? (
              <div className="divide-y-4 divide-slate-800">
                {filteredTrx.map((trx) => (
                  <div key={trx.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 flex items-center justify-center border-3 border-slate-800 ${
                          trx.status === "success" ? "bg-teal-100" :
                          trx.status === "pending" ? "bg-amber-100" :
                          "bg-rose-100"
                        }`}>
                          {getStatusIcon(trx.status)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg">
                            {trx.type === "deposit" ? "Deposit Saldo" : "Pembelian"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                            <Calendar size={14} />
                            <span>{formatDate(trx.createdAt)}</span>
                          </div>
                          {trx.depositId && (
                            <p className="text-xs font-mono text-slate-400 mt-1">
                              ID: {trx.depositId}
                            </p>
                          )}
                          {trx.paymentMethod && (
                            <p className="text-xs text-slate-500 mt-1">
                              Metode: {trx.paymentMethod}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className={`text-xl font-black ${
                          trx.type === "deposit" && trx.status === "success" ? "text-teal-600" : "text-slate-800"
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
                <Receipt size={48} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-bold">Tidak ada transaksi</p>
                <p className="text-slate-400 text-sm mt-1">
                  {filter !== "all" ? "Coba filter lainnya" : "Transaksi Anda akan muncul di sini"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

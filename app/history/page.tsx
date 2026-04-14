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
        return <CheckCircle2 size={20} className="text-black" />;
      case "pending":
        return <Clock size={20} className="text-black" />;
      default:
        return <XCircle size={20} className="text-black" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider border-2 border-black"
            style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
          >
            <CheckCircle2 size={12} /> Sukses
          </span>
        );
      case "pending":
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider border-2 border-black"
            style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
          >
            <Clock size={12} /> Pending
          </span>
        );
      case "cancel":
      case "expired":
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider border-2 border-black"
            style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.3)' }}
          >
            <XCircle size={12} /> {status === "cancel" ? "Batal" : "Expired"}
          </span>
        );
      default:
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-black text-xs font-bold uppercase tracking-wider border-2 border-black"
            style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
          >
            {status}
          </span>
        );
    }
  };

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
      <div className="min-h-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-up">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">RIWAYAT TRANSAKSI</h1>
              <p className="text-sm text-neutral-600 font-medium mt-1">Lihat semua aktivitas transaksi Anda</p>
            </div>

            <button
              onClick={() => user && fetchTransactions(user.email)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white font-bold uppercase tracking-wider text-sm border-4 border-black hover:bg-black hover:text-white transition-all"
              style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
            {[
              { label: "TOTAL", value: stats.total, icon: Receipt },
              { label: "SUKSES", value: stats.success, icon: CheckCircle2 },
              { label: "PENDING", value: stats.pending, icon: Clock },
              { label: "GAGAL", value: stats.failed, icon: XCircle },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="bg-white border-4 border-black p-4 animate-slide-up"
                style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)', animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon size={16} />
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{stat.label}</p>
                </div>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Total Deposit Card */}
          <div 
            className="bg-black text-white border-4 border-black p-6 mb-6 animate-slide-up"
            style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.3)', animationDelay: '0.4s' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white flex items-center justify-center">
                <Wallet size={24} className="text-black" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">TOTAL DEPOSIT SUKSES</p>
                <p className="text-3xl font-black">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            {[
              { id: "all", label: "Semua", count: stats.total },
              { id: "success", label: "Sukses", count: stats.success },
              { id: "pending", label: "Pending", count: stats.pending },
              { id: "failed", label: "Gagal", count: stats.failed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm border-4 border-black transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? "bg-black text-white translate-x-1 translate-y-1"
                    : "bg-white text-black hover:bg-black hover:text-white"
                }`}
                style={{ 
                  boxShadow: filter === tab.id ? '0px 0px 0px 0px rgba(0,0,0,1)' : '3px 3px 0px 0px rgba(0,0,0,1)'
                }}
              >
                <Filter size={14} />
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div 
            className="bg-white border-4 border-black overflow-hidden animate-slide-up"
            style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)', animationDelay: '0.6s' }}
          >
            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-black" />
                <p className="font-bold">Memuat transaksi...</p>
              </div>
            ) : filteredTrx.length > 0 ? (
              <div className="divide-y-4 divide-black">
                {filteredTrx.map((trx) => (
                  <div key={trx.id} className="p-5 hover:bg-neutral-100 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div 
                          className={`w-12 h-12 flex items-center justify-center border-4 border-black ${
                            trx.status === "success" ? "bg-white" :
                            trx.status === "pending" ? "bg-neutral-100" :
                            "bg-black text-white"
                          }`}
                          style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
                        >
                          {getStatusIcon(trx.status)}
                        </div>
                        <div>
                          <p className="font-black text-lg">
                            {trx.type === "deposit" ? "DEPOSIT SALDO" : "PEMBELIAN"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-neutral-600 text-sm font-medium">
                            <Calendar size={14} />
                            <span>{formatDate(trx.createdAt)}</span>
                          </div>
                          {trx.depositId && (
                            <p className="text-xs font-mono text-neutral-400 mt-1">
                              ID: {trx.depositId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className={`text-2xl font-black ${
                          trx.type === "deposit" && trx.status === "success" ? "text-black" : "text-black"
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
                <div 
                  className="w-16 h-16 bg-neutral-100 flex items-center justify-center mx-auto mb-4 border-4 border-black"
                  style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <Receipt size={28} className="text-neutral-400" />
                </div>
                <p className="font-black text-xl mb-1">TIDAK ADA TRANSAKSI</p>
                <p className="text-neutral-600 font-medium">
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

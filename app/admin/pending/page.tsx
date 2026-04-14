"use client";

import { useEffect, useState } from "react";
import { getPendingTransactions, type TransactionData } from "@/lib/externalDB";
import { Clock, Terminal, RefreshCw, CheckCircle2, Wallet, Calendar, User } from "lucide-react";

export default function AdminPendingPage() {
  const [pendingTrx, setPendingTrx] = useState<TransactionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await getPendingTransactions();
      if (res.success && res.data) {
        setPendingTrx(res.data);
      }
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--warning))] to-[rgb(var(--accent))] flex items-center justify-center animate-pulse">
            <RefreshCw className="animate-spin text-white" size={24} />
          </div>
          <span className="text-[rgb(var(--muted-foreground))] font-medium">Memuat transaksi pending...</span>
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
            <div className="w-1.5 h-8 bg-gradient-to-b from-[rgb(var(--warning))] to-[rgb(var(--accent))] rounded-full"></div>
            <h1 className="text-3xl sm:text-4xl font-black text-[rgb(var(--foreground))] tracking-tight">
              Transaksi Pending
            </h1>
          </div>
          <p className="text-[rgb(var(--muted-foreground))] text-sm ml-4">
            <span className="font-semibold text-[rgb(var(--foreground))]">{pendingTrx.length}</span> transaksi menunggu pembayaran
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

      {/* Pending Transactions */}
      <div className="card-neo overflow-hidden animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="p-6 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[rgb(var(--warning)/0.15)] border-2 border-[rgb(var(--warning))] rounded-xl flex items-center justify-center animate-pulse-glow">
              <Clock size={20} className="text-[rgb(var(--warning))]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[rgb(var(--foreground))]">Transaksi Pending</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Menunggu konfirmasi pembayaran</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {pendingTrx.length > 0 ? (
            <div className="grid gap-4 stagger-children">
              {pendingTrx.map((trx) => (
                <div 
                  key={trx.id} 
                  className="bg-[rgb(var(--warning)/0.08)] border-3 border-[rgb(var(--warning)/0.5)] rounded-xl p-5 hover:border-[rgb(var(--warning))] transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[rgb(var(--warning)/0.2)] flex items-center justify-center">
                        <User size={18} className="text-[rgb(var(--warning))]" />
                      </div>
                      <div>
                        <p className="font-bold text-[rgb(var(--foreground))]">{trx.userEmail}</p>
                        <p className="text-xs font-mono text-[rgb(var(--muted-foreground))]">{trx.depositId}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--warning)/0.2)] border-2 border-[rgb(var(--warning))] text-[rgb(var(--warning))] text-xs font-bold rounded-full">
                      <Clock size={14} className="animate-pulse" /> MENUNGGU PEMBAYARAN
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-[rgb(var(--card))] rounded-lg p-3 border border-[rgb(var(--border))]">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet size={14} className="text-[rgb(var(--muted-foreground))]" />
                        <p className="text-[rgb(var(--muted-foreground))] text-xs font-medium">Nominal</p>
                      </div>
                      <p className="font-bold text-[rgb(var(--foreground))]">{formatCurrency(trx.amount)}</p>
                    </div>
                    <div className="bg-[rgb(var(--card))] rounded-lg p-3 border border-[rgb(var(--border))]">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet size={14} className="text-[rgb(var(--muted-foreground))]" />
                        <p className="text-[rgb(var(--muted-foreground))] text-xs font-medium">Total Bayar</p>
                      </div>
                      <p className="font-bold text-[rgb(var(--foreground))]">{formatCurrency(trx.total)}</p>
                    </div>
                    <div className="bg-[rgb(var(--card))] rounded-lg p-3 border border-[rgb(var(--border))]">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={14} className="text-[rgb(var(--muted-foreground))]" />
                        <p className="text-[rgb(var(--muted-foreground))] text-xs font-medium">Dibuat</p>
                      </div>
                      <p className="font-bold text-[rgb(var(--foreground))] text-sm">{formatDate(trx.createdAt)}</p>
                    </div>
                    <div className="bg-[rgb(var(--card))] rounded-lg p-3 border border-[rgb(var(--border))]">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-[rgb(var(--muted-foreground))]" />
                        <p className="text-[rgb(var(--muted-foreground))] text-xs font-medium">Metode</p>
                      </div>
                      <p className="font-bold text-[rgb(var(--foreground))]">{trx.paymentMethod || "QRIS"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[rgb(var(--success)/0.15)] flex items-center justify-center">
                <CheckCircle2 size={40} className="text-[rgb(var(--success))]" />
              </div>
              <p className="font-bold text-xl text-[rgb(var(--foreground))] mb-2">Tidak ada transaksi pending</p>
              <p className="text-[rgb(var(--muted-foreground))]">Semua transaksi sudah diproses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

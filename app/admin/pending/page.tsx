"use client";

import { useEffect, useState } from "react";
import { getPendingTransactions, type TransactionData } from "@/lib/externalDB";
import { Clock, RefreshCw, CheckCircle2, Wallet, Calendar, User } from "lucide-react";

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
          <div className="w-14 h-14 bg-neutral-800 flex items-center justify-center">
            <RefreshCw className="animate-spin text-neutral-400" size={20} />
          </div>
          <span className="text-neutral-500 text-sm">Memuat transaksi pending...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-neutral-500 text-xs font-mono mb-1">ADMIN PANEL</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Transaksi Pending</h1>
          <p className="text-neutral-400 text-sm mt-1">
            <span className="text-white">{pendingTrx.length}</span> transaksi menunggu pembayaran
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

      {/* Pending Transactions */}
      <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-950 flex items-center justify-center">
              <Clock size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Transaksi Pending</h2>
              <p className="text-sm text-neutral-500">Menunggu konfirmasi pembayaran</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {pendingTrx.length > 0 ? (
            <div className="space-y-4">
              {pendingTrx.map((trx) => (
                <div 
                  key={trx.id} 
                  className="bg-neutral-800/50 border border-neutral-800 p-5 hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-neutral-700 flex items-center justify-center">
                        <User size={16} className="text-neutral-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{trx.userEmail}</p>
                        <p className="text-xs font-mono text-neutral-500">{trx.depositId}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950 border border-amber-800 text-amber-400 text-xs font-medium">
                      <Clock size={12} /> Menunggu Pembayaran
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-neutral-900 p-3 border border-neutral-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet size={12} className="text-neutral-500" />
                        <p className="text-neutral-500 text-xs">Nominal</p>
                      </div>
                      <p className="font-medium text-white text-sm">{formatCurrency(trx.amount)}</p>
                    </div>
                    <div className="bg-neutral-900 p-3 border border-neutral-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet size={12} className="text-neutral-500" />
                        <p className="text-neutral-500 text-xs">Total Bayar</p>
                      </div>
                      <p className="font-medium text-white text-sm">{formatCurrency(trx.total)}</p>
                    </div>
                    <div className="bg-neutral-900 p-3 border border-neutral-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={12} className="text-neutral-500" />
                        <p className="text-neutral-500 text-xs">Dibuat</p>
                      </div>
                      <p className="font-medium text-white text-sm">{formatDate(trx.createdAt)}</p>
                    </div>
                    <div className="bg-neutral-900 p-3 border border-neutral-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={12} className="text-neutral-500" />
                        <p className="text-neutral-500 text-xs">Tipe</p>
                      </div>
                      <p className="font-medium text-white text-sm uppercase">{trx.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-950 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="font-medium text-white mb-1">Tidak ada transaksi pending</p>
              <p className="text-neutral-500 text-sm">Semua transaksi sudah diproses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
          <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse-neo">
            <RefreshCw className="animate-spin text-black" size={24} />
          </div>
          <span className="text-white text-sm font-mono uppercase tracking-wider">Loading pending...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <p className="text-neutral-500 text-xs font-mono tracking-[0.2em] mb-2">// ADMIN PANEL</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">Pending</h1>
          <p className="text-neutral-400 text-sm mt-2 font-mono">
            <span className="text-white font-bold">{pendingTrx.length}</span> transaksi menunggu
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black uppercase text-sm border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Pending Transactions */}
      <div className="bg-black border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
        <div className="p-6 border-b-4 border-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neutral-800 border-4 border-white flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase">Transaksi Pending</h2>
              <p className="text-sm text-neutral-500 font-mono">Menunggu konfirmasi pembayaran</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {pendingTrx.length > 0 ? (
            <div className="space-y-4">
              {pendingTrx.map((trx) => (
                <div 
                  key={trx.id} 
                  className="bg-neutral-900 border-4 border-white p-6 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white flex items-center justify-center border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <User size={20} className="text-black" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{trx.userEmail}</p>
                        <p className="text-xs font-mono text-neutral-500">{trx.depositId}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-black uppercase border-4 border-white animate-pulse-neo">
                      <Clock size={14} /> WAITING
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-black p-4 border-4 border-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet size={14} className="text-neutral-500" />
                        <p className="text-neutral-500 text-xs font-mono uppercase">Nominal</p>
                      </div>
                      <p className="font-black text-white">{formatCurrency(trx.amount)}</p>
                    </div>
                    <div className="bg-white p-4 border-4 border-black">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet size={14} className="text-neutral-600" />
                        <p className="text-neutral-600 text-xs font-mono uppercase">Total</p>
                      </div>
                      <p className="font-black text-black">{formatCurrency(trx.total)}</p>
                    </div>
                    <div className="bg-black p-4 border-4 border-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-neutral-500" />
                        <p className="text-neutral-500 text-xs font-mono uppercase">Dibuat</p>
                      </div>
                      <p className="font-bold text-white text-sm">{formatDate(trx.createdAt)}</p>
                    </div>
                    <div className="bg-black p-4 border-4 border-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-neutral-500" />
                        <p className="text-neutral-500 text-xs font-mono uppercase">Tipe</p>
                      </div>
                      <p className="font-black text-white uppercase">{trx.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-4 border-dashed border-neutral-700">
              <div className="w-20 h-20 mx-auto mb-4 bg-white flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 size={36} className="text-black" />
              </div>
              <p className="font-black text-white text-xl uppercase mb-2">All Clear!</p>
              <p className="text-neutral-500 font-mono">Tidak ada transaksi pending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

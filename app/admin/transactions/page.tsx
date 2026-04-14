"use client";

import { useEffect, useState } from "react";
import { getAllTransactions, type TransactionData } from "@/lib/externalDB";
import { Receipt, Terminal, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await getAllTransactions();
      if (res.success && res.data) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-slate-600" size={24} />
          <span className="text-slate-600 font-medium">Memuat transaksi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-slate-400" />
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">ADMIN PANEL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Semua Transaksi
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-3">
            Total <span className="font-semibold text-slate-700">{transactions.length}</span> transaksi
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border-3 border-slate-800 shadow-[3px_3px_0px_#1e293b] hover:shadow-[4px_4px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-sm font-bold"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          REFRESH
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b]">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-200 border-2 border-slate-800 flex items-center justify-center">
              <Receipt size={18} className="text-slate-800" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Daftar Transaksi ({transactions.length})</h2>
          </div>

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
      </div>
    </div>
  );
}

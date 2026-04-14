"use client";

import { useEffect, useState } from "react";
import { getAllTransactions, type TransactionData } from "@/lib/externalDB";
import { Receipt, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle, Search, Filter } from "lucide-react";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filteredTrx, setFilteredTrx] = useState<TransactionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.userEmail.toLowerCase().includes(query) ||
          t.depositId?.toLowerCase().includes(query)
      );
    }

    setFilteredTrx(filtered);
  }, [searchQuery, statusFilter, transactions]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await getAllTransactions();
      if (res.success && res.data) {
        setTransactions(res.data);
        setFilteredTrx(res.data);
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-medium">
            <CheckCircle2 size={12} /> Sukses
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 text-xs font-medium">
            <Clock size={12} /> Pending
          </span>
        );
      case "cancel":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-950 border border-red-800 text-red-400 text-xs font-medium">
            <XCircle size={12} /> {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-neutral-800 flex items-center justify-center">
            <RefreshCw className="animate-spin text-neutral-400" size={20} />
          </div>
          <span className="text-neutral-500 text-sm">Memuat transaksi...</span>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Semua Transaksi</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Total <span className="text-white">{transactions.length}</span> transaksi
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Cari email atau ID transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 text-sm transition-colors"
          />
        </div>
        
        <div className="relative">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-11 pr-8 py-2.5 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700 appearance-none cursor-pointer text-sm transition-colors"
          >
            <option value="all">Semua Status</option>
            <option value="success">Sukses</option>
            <option value="pending">Pending</option>
            <option value="cancel">Dibatalkan</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="p-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-800 flex items-center justify-center">
              <Receipt size={18} className="text-neutral-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Daftar Transaksi</h2>
              <p className="text-sm text-neutral-500">{filteredTrx.length} transaksi ditemukan</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-800/50">
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">ID</th>
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">USER</th>
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">TIPE</th>
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">NOMINAL</th>
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">STATUS</th>
                <th className="text-left px-5 py-3 text-xs font-mono text-neutral-400">TANGGAL</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrx.map((trx) => (
                <tr key={trx.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-neutral-500">{trx.depositId || trx.id}</td>
                  <td className="px-5 py-4 text-white text-sm">{trx.userEmail}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium">
                      {trx.type?.toUpperCase() || "DEPOSIT"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{formatCurrency(trx.amount)}</td>
                  <td className="px-5 py-4">{getStatusBadge(trx.status)}</td>
                  <td className="px-5 py-4 text-neutral-500 text-sm">{formatDate(trx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTrx.length === 0 && (
            <div className="text-center py-16 text-neutral-500">
              <AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Tidak ada transaksi ditemukan</p>
              <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

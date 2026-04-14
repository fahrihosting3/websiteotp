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
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle2 size={12} /> OK
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-black uppercase border-2 border-white">
            <Clock size={12} /> WAIT
          </span>
        );
      case "cancel":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 text-neutral-400 text-xs font-black uppercase border-2 border-neutral-600">
            <XCircle size={12} /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 text-white text-xs font-black uppercase border-2 border-neutral-600">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <RefreshCw className="animate-spin text-black" size={24} />
          </div>
          <span className="text-white text-sm font-mono uppercase tracking-wider">Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <p className="text-neutral-500 text-xs font-mono tracking-[0.2em] mb-2">// ADMIN PANEL</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">Transaksi</h1>
          <p className="text-neutral-400 text-sm mt-2 font-mono">
            Total <span className="text-white font-bold">{transactions.length}</span> transaksi
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black uppercase text-sm border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Cari email atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black border-4 border-white text-white placeholder-neutral-500 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-sm font-mono transition-all"
          />
        </div>
        
        <div className="relative">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-12 pr-8 py-3 bg-white border-4 border-black text-black font-bold focus:outline-none appearance-none cursor-pointer text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="all">SEMUA</option>
            <option value="success">SUKSES</option>
            <option value="pending">PENDING</option>
            <option value="cancel">BATAL</option>
            <option value="expired">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-black border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
        <div className="p-6 border-b-4 border-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white flex items-center justify-center border-2 border-black">
              <Receipt size={24} className="text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase">Daftar Transaksi</h2>
              <p className="text-sm text-neutral-500 font-mono">{filteredTrx.length} transaksi ditemukan</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-white bg-neutral-900">
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">Tipe</th>
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">Nominal</th>
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-black text-white uppercase tracking-wider">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrx.map((trx, idx) => (
                <tr key={trx.id} className={`border-b-2 border-neutral-800 hover:bg-neutral-900 transition-colors ${idx % 2 === 0 ? 'bg-neutral-950' : 'bg-black'}`}>
                  <td className="px-6 py-5 font-mono text-xs text-neutral-500">{trx.depositId || trx.id}</td>
                  <td className="px-6 py-5 text-white text-sm font-bold">{trx.userEmail}</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-neutral-800 border-2 border-neutral-600 text-white text-xs font-black uppercase">
                      {trx.type?.toUpperCase() || "DEPOSIT"}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-black text-white">{formatCurrency(trx.amount)}</td>
                  <td className="px-6 py-5">{getStatusBadge(trx.status)}</td>
                  <td className="px-6 py-5 text-neutral-500 text-sm font-mono">{formatDate(trx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTrx.length === 0 && (
            <div className="text-center py-16 border-t-2 border-dashed border-neutral-700">
              <AlertCircle size={40} className="mx-auto mb-4 text-neutral-600" />
              <p className="font-black text-white uppercase">Tidak ada transaksi</p>
              <p className="text-sm text-neutral-500 font-mono mt-1">Coba ubah filter atau kata kunci</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

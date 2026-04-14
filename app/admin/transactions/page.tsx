"use client";

import { useEffect, useState } from "react";
import { getAllTransactions, type TransactionData } from "@/lib/externalDB";
import { Receipt, Terminal, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle, Search, Filter } from "lucide-react";

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

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Filter by search
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
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgb(var(--success)/0.15)] border-2 border-[rgb(var(--success))] text-[rgb(var(--success))] text-xs font-bold rounded">
            <CheckCircle2 size={12} /> SUKSES
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgb(var(--warning)/0.15)] border-2 border-[rgb(var(--warning))] text-[rgb(var(--warning))] text-xs font-bold rounded">
            <Clock size={12} /> PENDING
          </span>
        );
      case "cancel":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgb(var(--destructive)/0.15)] border-2 border-[rgb(var(--destructive))] text-[rgb(var(--destructive))] text-xs font-bold rounded">
            <XCircle size={12} /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[rgb(var(--muted))] border-2 border-[rgb(var(--border))] text-[rgb(var(--foreground))] text-xs font-bold rounded">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--secondary))] to-[rgb(var(--primary))] flex items-center justify-center animate-pulse">
            <RefreshCw className="animate-spin text-white" size={24} />
          </div>
          <span className="text-[rgb(var(--muted-foreground))] font-medium">Memuat transaksi...</span>
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
            <div className="w-1.5 h-8 bg-gradient-to-b from-[rgb(var(--secondary))] to-[rgb(var(--success))] rounded-full"></div>
            <h1 className="text-3xl sm:text-4xl font-black text-[rgb(var(--foreground))] tracking-tight">
              Semua Transaksi
            </h1>
          </div>
          <p className="text-[rgb(var(--muted-foreground))] text-sm ml-4">
            Total <span className="font-semibold text-[rgb(var(--foreground))]">{transactions.length}</span> transaksi
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Cari email atau ID transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[rgb(var(--card))] border-3 border-[rgb(var(--foreground))] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all duration-200"
          />
        </div>
        
        <div className="relative">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-12 pr-8 py-3 bg-[rgb(var(--card))] border-3 border-[rgb(var(--foreground))] text-[rgb(var(--foreground))] font-bold focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] appearance-none cursor-pointer transition-all duration-200"
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
      <div className="card-neo overflow-hidden animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="p-6 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[rgb(var(--secondary)/0.15)] border-2 border-[rgb(var(--secondary))] rounded-xl flex items-center justify-center">
              <Receipt size={20} className="text-[rgb(var(--secondary))]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[rgb(var(--foreground))]">Daftar Transaksi</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">{filteredTrx.length} transaksi ditemukan</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-neo">
            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>TIPE</th>
                <th>NOMINAL</th>
                <th>STATUS</th>
                <th>TANGGAL</th>
              </tr>
            </thead>
            <tbody className="stagger-children">
              {filteredTrx.map((trx) => (
                <tr key={trx.id}>
                  <td className="font-mono text-xs text-[rgb(var(--muted-foreground))]">{trx.depositId || trx.id}</td>
                  <td className="text-[rgb(var(--foreground))] font-medium">{trx.userEmail}</td>
                  <td>
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded border-2 bg-[rgb(var(--info)/0.15)] border-[rgb(var(--info))] text-[rgb(var(--info))]">
                      {trx.type?.toUpperCase() || "DEPOSIT"}
                    </span>
                  </td>
                  <td className="font-bold text-[rgb(var(--foreground))]">{formatCurrency(trx.amount)}</td>
                  <td>{getStatusBadge(trx.status)}</td>
                  <td className="text-[rgb(var(--muted-foreground))] text-sm">{formatDate(trx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTrx.length === 0 && (
            <div className="text-center py-16 text-[rgb(var(--muted-foreground))]">
              <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-bold">Tidak ada transaksi ditemukan</p>
              <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

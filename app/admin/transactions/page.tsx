// app/admin/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getAllTransactions, type TransactionData } from "@/lib/externalDB";
import { useRouter } from "next/navigation";
import {
  Receipt,
  RefreshCw,
  AlertCircle,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";

export default function AdminTransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current || current.role !== "admin") {
      router.push("/auth/login");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const trxRes = await getAllTransactions();
      if (trxRes.success && trxRes.data) {
        setTransactions(trxRes.data);
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
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 border-2 border-slate-800 text-xs font-bold text-slate-800">
            <XCircle size={12} /> {status?.toUpperCase()}
          </span>
        );
    }
  };

  const filteredTransactions = transactions.filter((trx) => {
    const matchesSearch =
      trx.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      trx.depositId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || trx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-slate-600" size={24} />
          <span className="text-slate-600 font-medium">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #475569 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            opacity: 0.06,
          }}
        />
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-200 border-3 border-slate-800 flex items-center justify-center">
              <Receipt size={24} className="text-slate-800" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
                Semua Transaksi
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Total {transactions.length} transaksi
              </p>
            </div>
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari email atau ID transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-3 border-slate-800 shadow-[4px_4px_0px_#1e293b] focus:shadow-[6px_6px_0px_#1e293b] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border-3 border-slate-800 shadow-[4px_4px_0px_#1e293b] text-sm font-bold outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="success">Sukses</option>
              <option value="pending">Pending</option>
              <option value="cancel">Cancel</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-slate-800 border-3 border-slate-700 text-white flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">TOTAL TRANSAKSI</p>
            <p className="text-xl font-black">{filteredTransactions.length}</p>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">TOTAL NOMINAL</p>
            <p className="text-xl font-black">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="p-4 text-left text-xs font-bold tracking-wider">ID</th>
                  <th className="p-4 text-left text-xs font-bold tracking-wider">USER</th>
                  <th className="p-4 text-left text-xs font-bold tracking-wider">TIPE</th>
                  <th className="p-4 text-left text-xs font-bold tracking-wider">NOMINAL</th>
                  <th className="p-4 text-left text-xs font-bold tracking-wider">STATUS</th>
                  <th className="p-4 text-left text-xs font-bold tracking-wider">TANGGAL</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((trx, idx) => (
                  <tr
                    key={trx.id}
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} border-t-2 border-slate-200 hover:bg-teal-50 transition-colors`}
                  >
                    <td className="p-4 font-mono text-xs text-slate-600">{trx.depositId || trx.id}</td>
                    <td className="p-4 text-sm text-slate-800 font-medium">{trx.userEmail}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-slate-800 bg-sky-100">
                        {trx.type?.toUpperCase() || "DEPOSIT"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-sm text-slate-800">{formatCurrency(trx.amount)}</td>
                    <td className="p-4">{getStatusBadge(trx.status)}</td>
                    <td className="p-4 text-sm text-slate-600">{formatDate(trx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">
                  {search || statusFilter !== "all"
                    ? "Tidak ada transaksi yang cocok"
                    : "Belum ada transaksi"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

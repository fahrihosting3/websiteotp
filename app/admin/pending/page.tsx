// app/admin/pending/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getPendingTransactions, updateTransactionStatus, type TransactionData } from "@/lib/externalDB";
import { useRouter } from "next/navigation";
import {
  Clock,
  RefreshCw,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function AdminPendingPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingTrx, setPendingTrx] = useState<TransactionData[]>([]);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
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
      const res = await getPendingTransactions();
      if (res.success && res.data) {
        setPendingTrx(res.data);
      }
    } catch (error) {
      console.error("Error fetching pending:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (depositId: string, status: "success" | "cancel") => {
    setProcessing(depositId);
    try {
      const res = await updateTransactionStatus(depositId, status);
      if (res.success) {
        // Remove from pending list
        setPendingTrx((prev) => prev.filter((t) => t.depositId !== depositId));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setProcessing(null);
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

  const filteredPending = pendingTrx.filter(
    (trx) =>
      trx.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      trx.depositId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPendingAmount = filteredPending.reduce((sum, t) => sum + (t.amount || 0), 0);

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
            <div className="w-12 h-12 bg-amber-200 border-3 border-slate-800 flex items-center justify-center">
              <Clock size={24} className="text-slate-800" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
                Transaksi Pending
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {pendingTrx.length} transaksi menunggu
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

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari email atau ID transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-3 border-slate-800 shadow-[4px_4px_0px_#1e293b] focus:shadow-[6px_6px_0px_#1e293b] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 p-4 bg-amber-100 border-4 border-slate-800 shadow-[6px_6px_0px_#1e293b] flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-amber-600" />
            <div>
              <p className="text-[10px] font-mono text-slate-600 tracking-wider">PENDING</p>
              <p className="text-xl font-black text-slate-800">{filteredPending.length}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-400" />
          <div>
            <p className="text-[10px] font-mono text-slate-600 tracking-wider">TOTAL NOMINAL PENDING</p>
            <p className="text-xl font-black text-slate-800">{formatCurrency(totalPendingAmount)}</p>
          </div>
        </div>

        {/* Pending Cards */}
        {filteredPending.length > 0 ? (
          <div className="grid gap-4">
            {filteredPending.map((trx) => (
              <div
                key={trx.id}
                className="bg-white border-4 border-slate-800 shadow-[6px_6px_0px_#1e293b] p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 border-2 border-slate-800 text-xs font-bold text-slate-800">
                        <Clock size={12} /> PENDING
                      </span>
                      <span className="text-xs font-mono text-slate-500">{trx.depositId}</span>
                    </div>
                    <p className="font-bold text-lg text-slate-800">{trx.userEmail}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
                      <span className="font-bold text-slate-800">{formatCurrency(trx.amount)}</span>
                      <span>{formatDate(trx.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdateStatus(trx.depositId!, "success")}
                      disabled={processing === trx.depositId}
                      className="flex items-center gap-2 px-4 py-3 bg-teal-500 text-white border-3 border-slate-800 shadow-[4px_4px_0px_#1e293b] hover:shadow-[5px_5px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-sm font-bold disabled:opacity-50"
                    >
                      {processing === trx.depositId ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      APPROVE
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(trx.depositId!, "cancel")}
                      disabled={processing === trx.depositId}
                      className="flex items-center gap-2 px-4 py-3 bg-rose-500 text-white border-3 border-slate-800 shadow-[4px_4px_0px_#1e293b] hover:shadow-[5px_5px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-sm font-bold disabled:opacity-50"
                    >
                      {processing === trx.depositId ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={16} />
                      )}
                      REJECT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-4 border-slate-800 shadow-[8px_8px_0px_#1e293b] p-12">
            <div className="text-center text-slate-500">
              <CheckCircle2 size={64} className="mx-auto mb-4 text-teal-500" />
              <p className="text-xl font-bold text-slate-800 mb-2">Tidak ada transaksi pending</p>
              <p className="text-sm">Semua transaksi sudah diproses</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { getCurrentUser, updateUserBalance } from "@/lib/auth";
import { createTransaction, updateTransactionStatus, getTransactionByDepositId } from "@/lib/externalDB";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Terminal,
  ArrowLeft,
  CreditCard,
  QrCode,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  Wallet,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

type DepositStatus = "idle" | "loading" | "pending" | "success" | "cancel" | "expired" | "error";

interface DepositData {
  id: string;
  status: string;
  method: string;
  currency?: {
    type: string;
    total: string;
    fee: string;
    diterima: string;
  };
  total: number;
  fee: number;
  diterima: number;
  qr_string: string;
  qr_image: string;
  created_at: string;
  created_at_ts: number;
  expired_at: string;
  expired_at_ts: number;
  brand?: {
    name: string;
    icon: string;
    type: string;
  };
}

interface PendingDeposit {
  depositData: DepositData;
  amount: string;
  createdAt: number;
}

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 200000, 500000];
const STORAGE_KEY = "pendingDeposit";

export default function DepositPage() {
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<DepositStatus>("idle");
  const [depositData, setDepositData] = useState<DepositData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showPendingNotif, setShowPendingNotif] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const router = useRouter();

  // Restore pending deposit from localStorage on mount
  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    setUser(current);

    // Check for pending deposit in localStorage
    const savedDeposit = localStorage.getItem(STORAGE_KEY);
    if (savedDeposit) {
      try {
        const pending: PendingDeposit = JSON.parse(savedDeposit);
        const now = Date.now();
        const expiredAt = pending.depositData.expired_at_ts;
        
        // Check if deposit is still valid (not expired)
        if (expiredAt > now) {
          setDepositData(pending.depositData);
          setAmount(pending.amount);
          setStatus("pending");
          setTimeLeft(Math.floor((expiredAt - now) / 1000));
        } else {
          // Deposit expired, clear storage
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.error("Failed to restore pending deposit:", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsRestoring(false);
  }, [router]);

  // Save pending deposit to localStorage whenever depositData changes
  useEffect(() => {
    if (status === "pending" && depositData) {
      const pending: PendingDeposit = {
        depositData,
        amount,
        createdAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
    }
  }, [status, depositData, amount]);

  // Countdown timer
  useEffect(() => {
    if (status !== "pending" || !depositData) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expiredAt = depositData.expired_at_ts;
      const remaining = Math.max(0, Math.floor((expiredAt - now) / 1000));

      if (remaining <= 0) {
        setStatus("expired");
        localStorage.removeItem(STORAGE_KEY);
        // Update transaction status to expired
        updateTransactionStatus(depositData.id, "expired");
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, depositData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleCreateDeposit = async () => {
    const numAmount = parseInt(amount.replace(/\D/g, ""));
    if (!numAmount || numAmount < 1000) {
      toast.error("Minimal deposit Rp1.000");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(
        `https://www.rumahotp.io/api/v2/deposit/create?amount=${numAmount}&payment_id=qris`,
        {
          method: "GET",
          headers: {
            "x-apikey": process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY || "",
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setDepositData(data.data);
        setStatus("pending");
        toast.success("QRIS berhasil dibuat!");

        // Save transaction to external database
        if (user) {
          await createTransaction({
            userId: user.id,
            userEmail: user.email,
            type: "deposit",
            amount: data.data.diterima,
            fee: data.data.fee,
            total: data.data.total,
            status: "pending",
            depositId: data.data.id,
            qrImage: data.data.qr_image,
            qrString: data.data.qr_string,
            expiredAt: data.data.expired_at,
          });
        }
      } else {
        toast.error(data.message || "Gagal membuat deposit");
        setStatus("error");
      }
    } catch (err) {
      console.error("Error creating deposit:", err);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setStatus("error");
    }
  };

  const checkPaymentStatus = useCallback(async (showNotif = true) => {
    if (!depositData) return;

    setCheckingStatus(true);

    try {
      const res = await fetch(
        `https://www.rumahotp.io/api/v2/deposit/get_status?deposit_id=${depositData.id}`,
        {
          method: "GET",
          headers: {
            "x-apikey": process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY || "",
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        if (data.data.status === "success") {
          setStatus("success");
          localStorage.removeItem(STORAGE_KEY);
          toast.success("Pembayaran berhasil!");
          
          // Update transaction status and user balance
          await updateTransactionStatus(depositData.id, "success");
          if (user) {
            await updateUserBalance(depositData.diterima);
          }
        } else if (data.data.status === "cancel") {
          setStatus("cancel");
          localStorage.removeItem(STORAGE_KEY);
          toast.error("Pembayaran dibatalkan");
          await updateTransactionStatus(depositData.id, "cancel");
        } else if (data.data.status === "pending" && showNotif) {
          // Show pending notification with animation
          setShowPendingNotif(true);
          setTimeout(() => setShowPendingNotif(false), 3000);
        }
      }
    } catch (err) {
      console.error("Error checking status:", err);
    } finally {
      setCheckingStatus(false);
    }
  }, [depositData, user]);

  // Auto-check payment status every 10 seconds
  useEffect(() => {
    if (status !== "pending") return;

    const interval = setInterval(() => {
      checkPaymentStatus(false); // Don't show notif on auto-check
    }, 10000);

    return () => clearInterval(interval);
  }, [status, checkPaymentStatus]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin ke clipboard!");
  };

  const resetDeposit = () => {
    setStatus("idle");
    setDepositData(null);
    setAmount("");
    setTimeLeft(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value) {
      setAmount(parseInt(value).toLocaleString("id-ID"));
    } else {
      setAmount("");
    }
  };

  // Show loading while restoring state
  if (isRestoring) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-100">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-slate-600" size={24} />
            <span className="text-slate-600 font-medium">Memuat...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-slate-100">
        {/* Pending Payment Notification */}
        {showPendingNotif && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
            <div className="bg-amber-50 border-4 border-slate-800 px-6 py-4 shadow-[6px_6px_0px_#1e293b] flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-200 border-2 border-slate-800 flex items-center justify-center">
                <Loader2 size={20} className="text-slate-800 animate-spin" />
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm">PEMBAYARAN BELUM SELESAI</p>
                <p className="text-xs text-slate-600">Silakan selesaikan pembayaran Anda</p>
              </div>
            </div>
          </div>
        )}

        {/* Neo Brutalism Pattern Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #475569 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
              opacity: 0.06,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 group"
            >
              <div className="w-10 h-10 bg-white border-3 border-slate-800 flex items-center justify-center shadow-[3px_3px_0px_#1e293b] group-hover:shadow-[4px_4px_0px_#1e293b] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-all">
                <ArrowLeft size={18} className="text-slate-800" />
              </div>
              <span className="font-bold text-sm tracking-wide">KEMBALI</span>
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <Terminal size={14} className="text-slate-500" />
              <span className="text-[10px] font-mono text-slate-500 tracking-[3px]">
                DEPOSIT
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              TOP UP SALDO
            </h1>
            <p className="text-slate-600 mt-2">
              Isi saldo untuk membeli nomor virtual OTP
            </p>
          </div>

          {/* Main Content */}
          {status === "idle" || status === "loading" || status === "error" ? (
            <div className="space-y-6">
              {/* Amount Input Card */}
              <div className="bg-white border-4 border-slate-800 p-6 shadow-[8px_8px_0px_#1e293b]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-teal-200 border-3 border-slate-800 flex items-center justify-center shadow-[3px_3px_0px_#1e293b]">
                    <Wallet size={22} className="text-slate-800" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 tracking-[2px]">
                      STEP 1
                    </p>
                    <h2 className="text-xl font-black text-slate-800">
                      MASUKKAN NOMINAL
                    </h2>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 mb-2 tracking-wide">
                    JUMLAH DEPOSIT
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-4 text-2xl font-black text-slate-800 bg-slate-50 border-4 border-slate-800 focus:outline-none focus:ring-0 focus:border-slate-800 shadow-[4px_4px_0px_#1e293b] focus:shadow-[6px_6px_0px_#1e293b] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Minimal deposit Rp1.000</p>
                </div>

                {/* Preset Amounts */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-700 mb-3 tracking-wide">
                    PILIH NOMINAL
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset.toLocaleString("id-ID"))}
                        className={`py-3 px-4 text-sm font-bold border-3 border-slate-800 transition-all text-slate-800 ${
                          amount === preset.toLocaleString("id-ID")
                            ? "bg-sky-200 shadow-[4px_4px_0px_#1e293b] translate-x-[-2px] translate-y-[-2px]"
                            : "bg-white shadow-[3px_3px_0px_#1e293b] hover:shadow-[4px_4px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                        }`}
                      >
                        {formatCurrency(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-700 mb-3 tracking-wide">
                    METODE PEMBAYARAN
                  </p>
                  <div className="bg-slate-50 border-3 border-slate-800 p-4 flex items-center gap-4 shadow-[3px_3px_0px_#1e293b]">
                    <div className="w-14 h-14 bg-white border-2 border-slate-800 flex items-center justify-center">
                      <QrCode size={28} className="text-slate-800" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-800">QRIS</p>
                      <p className="text-xs text-slate-600">
                        Bayar dengan semua e-wallet & mobile banking
                      </p>
                    </div>
                    <div className="w-6 h-6 bg-teal-200 border-2 border-slate-800 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-slate-800" />
                    </div>
                  </div>
                </div>

                {/* Create Deposit Button */}
                <button
                  onClick={handleCreateDeposit}
                  disabled={status === "loading" || !amount}
                  className={`w-full py-4 text-lg font-black border-4 border-slate-800 transition-all ${
                    status === "loading" || !amount
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-[4px_4px_0px_#1e293b]"
                      : "bg-teal-200 text-slate-800 shadow-[6px_6px_0px_#1e293b] hover:shadow-[8px_8px_0px_#1e293b] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                  }`}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin" />
                      MEMPROSES...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard size={20} />
                      BUAT PEMBAYARAN
                    </span>
                  )}
                </button>
              </div>

              {/* Info Card */}
              <div className="bg-amber-50 border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-slate-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800 mb-1">INFORMASI PENTING</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>- Maksimal 3 pembayaran pending dalam satu waktu</li>
                      <li>- QRIS berlaku selama 20 menit</li>
                      <li>- Saldo akan otomatis ditambahkan setelah pembayaran</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : status === "pending" ? (
            <div className="space-y-6">
              {/* QR Code Card */}
              <div className="bg-white border-4 border-slate-800 p-6 shadow-[8px_8px_0px_#1e293b]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sky-200 border-3 border-slate-800 flex items-center justify-center shadow-[3px_3px_0px_#1e293b]">
                      <QrCode size={22} className="text-slate-800" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 tracking-[2px]">
                        STEP 2
                      </p>
                      <h2 className="text-xl font-black text-slate-800">
                        SCAN QRIS
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-rose-100 border-3 border-slate-800 px-4 py-2 shadow-[3px_3px_0px_#1e293b]">
                    <Clock size={16} className="text-slate-800" />
                    <span className="font-mono font-black text-lg text-slate-800">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* QR Image */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white border-4 border-slate-800 p-4 shadow-[6px_6px_0px_#1e293b]">
                    {depositData?.qr_image && (
                      <Image
                        src={depositData.qr_image}
                        alt="QRIS Code"
                        width={240}
                        height={240}
                        className="w-60 h-60"
                        unoptimized
                      />
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between bg-slate-50 border-3 border-slate-800 p-4">
                    <span className="text-sm font-bold text-slate-600">TOTAL BAYAR</span>
                    <span className="text-2xl font-black text-slate-800">
                      {formatCurrency(depositData?.total || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-100 border-3 border-slate-800 p-3">
                    <span className="text-xs font-bold text-slate-600">Nominal</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(depositData?.diterima || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-100 border-3 border-slate-800 p-3">
                    <span className="text-xs font-bold text-slate-600">Biaya Admin</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(depositData?.fee || 0)}
                    </span>
                  </div>
                </div>

                {/* Copy Address (for USDT) */}
                {depositData?.method?.includes("usdt") && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-slate-700 mb-2">ALAMAT WALLET</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 border-3 border-slate-800 p-3 font-mono text-sm text-slate-800 truncate">
                        {depositData.qr_string}
                      </div>
                      <button
                        onClick={() => copyToClipboard(depositData.qr_string)}
                        className="w-12 h-12 bg-sky-200 border-3 border-slate-800 flex items-center justify-center shadow-[3px_3px_0px_#1e293b] hover:shadow-[4px_4px_0px_#1e293b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                      >
                        <Copy size={18} className="text-slate-800" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Deposit ID */}
                <div className="bg-slate-100 border-3 border-slate-800 p-3 flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-mono text-slate-500">DEPOSIT ID</p>
                    <p className="font-mono text-sm font-bold text-slate-800">
                      {depositData?.id}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(depositData?.id || "")}
                    className="p-2 hover:bg-slate-200 transition-colors text-slate-800"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => checkPaymentStatus(true)}
                    disabled={checkingStatus}
                    className="flex-1 py-4 font-black border-4 border-slate-800 bg-teal-200 text-slate-800 shadow-[4px_4px_0px_#1e293b] hover:shadow-[6px_6px_0px_#1e293b] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw
                        size={18}
                        className={checkingStatus ? "animate-spin" : ""}
                      />
                      CEK STATUS
                    </span>
                  </button>
                  <button
                    onClick={resetDeposit}
                    className="py-4 px-6 font-black border-4 border-slate-800 bg-white text-slate-800 shadow-[4px_4px_0px_#1e293b] hover:shadow-[6px_6px_0px_#1e293b] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  >
                    BATAL
                  </button>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-sky-50 border-4 border-slate-800 p-5 shadow-[6px_6px_0px_#1e293b]">
                <p className="font-black text-slate-800 mb-2">CARA BAYAR:</p>
                <ol className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                    <span>Buka aplikasi e-wallet atau mobile banking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                    <span>Pilih menu Scan QR atau QRIS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                    <span>Scan kode QRIS di atas dan selesaikan pembayaran</span>
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            /* Success / Cancel / Expired States */
            <div className="bg-white border-4 border-slate-800 p-8 shadow-[8px_8px_0px_#1e293b] text-center">
              {status === "success" ? (
                <>
                  <div className="w-20 h-20 bg-teal-200 border-4 border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#1e293b]">
                    <CheckCircle2 size={40} className="text-slate-800" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2">
                    PEMBAYARAN BERHASIL!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Saldo Anda telah ditambahkan sebesar{" "}
                    <span className="font-bold text-slate-800">
                      {formatCurrency(depositData?.diterima || 0)}
                    </span>
                  </p>
                </>
              ) : status === "cancel" ? (
                <>
                  <div className="w-20 h-20 bg-rose-200 border-4 border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#1e293b]">
                    <XCircle size={40} className="text-slate-800" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2">
                    PEMBAYARAN DIBATALKAN
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Pembayaran Anda telah dibatalkan
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-amber-100 border-4 border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#1e293b]">
                    <Clock size={40} className="text-slate-800" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2">
                    WAKTU HABIS
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Kode QRIS telah kedaluwarsa. Silakan buat pembayaran baru.
                  </p>
                </>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetDeposit}
                  className="py-4 px-8 font-black border-4 border-slate-800 bg-teal-200 text-slate-800 shadow-[4px_4px_0px_#1e293b] hover:shadow-[6px_6px_0px_#1e293b] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                >
                  DEPOSIT LAGI
                </button>
                <Link
                  href="/dashboard"
                  className="py-4 px-8 font-black border-4 border-slate-800 bg-white text-slate-800 shadow-[4px_4px_0px_#1e293b] hover:shadow-[6px_6px_0px_#1e293b] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                >
                  KE DASHBOARD
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

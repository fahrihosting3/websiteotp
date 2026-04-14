"use client";

import { useEffect, useState, useCallback } from "react";
import { getCurrentUser, updateUserBalance } from "@/lib/auth";
import { createTransaction, updateTransactionStatus } from "@/lib/externalDB";
import { useRouter } from "next/navigation";
import UserSidebar from "@/components/UserSidebar";
import {
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
        
        if (expiredAt > now) {
          setDepositData(pending.depositData);
          setAmount(pending.amount);
          setStatus("pending");
          setTimeLeft(Math.floor((expiredAt - now) / 1000));
        } else {
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
      checkPaymentStatus(false);
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
      <UserSidebar>
        <div className="min-h-full flex items-center justify-center bg-neutral-100">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-neutral-600" size={24} />
            <span className="text-neutral-600 font-medium">Memuat...</span>
          </div>
        </div>
      </UserSidebar>
    );
  }

  return (
    <UserSidebar>
      <div className="min-h-full bg-neutral-100 relative">
        {/* Pending Payment Notification */}
        {showPendingNotif && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
            <div className="bg-amber-50 border border-amber-200 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <Loader2 size={18} className="text-amber-600 animate-spin" />
              <div>
                <p className="font-semibold text-neutral-900 text-sm">Pembayaran belum selesai</p>
                <p className="text-xs text-neutral-600">Silakan selesaikan pembayaran Anda</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Deposit Saldo</h1>
            <p className="text-sm text-neutral-500 mt-1">Isi saldo untuk membeli nomor virtual OTP</p>
          </div>

          {/* Main Content */}
          {status === "idle" || status === "loading" || status === "error" ? (
            <div className="space-y-4">
              {/* Amount Input Card */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                    <Wallet size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">STEP 1</p>
                    <h2 className="text-base font-semibold text-neutral-900">Masukkan Nominal</h2>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-neutral-600 mb-2">
                    Jumlah Deposit
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="w-full pl-11 pr-4 py-3 text-xl font-bold text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all placeholder:text-neutral-400"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">Minimal deposit Rp1.000</p>
                </div>

                {/* Preset Amounts */}
                <div className="mb-5">
                  <p className="text-xs font-medium text-neutral-600 mb-2">Pilih Nominal</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset.toLocaleString("id-ID"))}
                        className={`py-2.5 px-3 text-sm font-medium rounded-lg border transition-all ${
                          amount === preset.toLocaleString("id-ID")
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                        }`}
                      >
                        {formatCurrency(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-5">
                  <p className="text-xs font-medium text-neutral-600 mb-2">Metode Pembayaran</p>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white border border-neutral-200 rounded-lg flex items-center justify-center">
                      <QrCode size={24} className="text-neutral-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">QRIS</p>
                      <p className="text-xs text-neutral-500">Bayar dengan semua e-wallet & mobile banking</p>
                    </div>
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Create Deposit Button */}
                <button
                  onClick={handleCreateDeposit}
                  disabled={status === "loading" || !amount}
                  className={`w-full py-3 text-base font-semibold rounded-lg transition-all ${
                    status === "loading" || !amount
                      ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  }`}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={18} className="animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard size={18} />
                      Buat Pembayaran
                    </span>
                  )}
                </button>
              </div>

              {/* Info Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-900 text-sm mb-1">Informasi Penting</p>
                    <ul className="text-xs text-neutral-600 space-y-0.5">
                      <li>- Maksimal 3 pembayaran pending dalam satu waktu</li>
                      <li>- QRIS berlaku selama 20 menit</li>
                      <li>- Saldo akan otomatis ditambahkan setelah pembayaran</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : status === "pending" ? (
            <div className="space-y-4">
              {/* QR Code Card */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                      <QrCode size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">STEP 2</p>
                      <h2 className="text-base font-semibold text-neutral-900">Scan QRIS</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-red-100 px-3 py-1.5 rounded-lg">
                    <Clock size={14} className="text-red-600" />
                    <span className="font-mono font-bold text-red-600">{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* QR Image */}
                <div className="flex justify-center mb-5">
                  <div className="bg-white border border-neutral-200 rounded-xl p-3">
                    {depositData?.qr_image && (
                      <Image
                        src={depositData.qr_image}
                        alt="QRIS Code"
                        width={220}
                        height={220}
                        className="w-56 h-56"
                        unoptimized
                      />
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between bg-neutral-900 text-white p-4 rounded-lg">
                    <span className="text-sm font-medium">Total Bayar</span>
                    <span className="text-xl font-bold">{formatCurrency(depositData?.total || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg">
                    <span className="text-xs text-neutral-500">Nominal</span>
                    <span className="text-sm font-semibold text-neutral-900">{formatCurrency(depositData?.diterima || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg">
                    <span className="text-xs text-neutral-500">Biaya Admin</span>
                    <span className="text-sm font-semibold text-neutral-900">{formatCurrency(depositData?.fee || 0)}</span>
                  </div>
                </div>

                {/* Copy Address (for USDT) */}
                {depositData?.method?.includes("usdt") && (
                  <div className="mb-5">
                    <p className="text-xs font-medium text-neutral-600 mb-2">Alamat Wallet</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-neutral-50 border border-neutral-200 p-3 rounded-lg font-mono text-sm text-neutral-800 truncate">
                        {depositData.qr_string}
                      </div>
                      <button
                        onClick={() => copyToClipboard(depositData.qr_string)}
                        className="p-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Deposit ID */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-neutral-500 font-medium">DEPOSIT ID</p>
                    <p className="font-mono text-sm font-medium text-neutral-900">{depositData?.id}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(depositData?.id || "")}
                    className="p-2 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-600"
                  >
                    <Copy size={14} />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => checkPaymentStatus(true)}
                    disabled={checkingStatus}
                    className="flex-1 py-3 font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className={checkingStatus ? "animate-spin" : ""} />
                      Cek Status
                    </span>
                  </button>
                  <button
                    onClick={resetDeposit}
                    className="py-3 px-5 font-semibold rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                <p className="font-medium text-neutral-900 text-sm mb-2">Cara Bayar:</p>
                <ol className="text-xs text-neutral-600 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-neutral-900 text-white flex items-center justify-center rounded text-[10px] font-bold flex-shrink-0">1</span>
                    <span>Buka aplikasi e-wallet atau mobile banking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-neutral-900 text-white flex items-center justify-center rounded text-[10px] font-bold flex-shrink-0">2</span>
                    <span>Pilih menu Scan QR atau QRIS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-neutral-900 text-white flex items-center justify-center rounded text-[10px] font-bold flex-shrink-0">3</span>
                    <span>Scan kode QRIS di atas dan selesaikan pembayaran</span>
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            /* Success / Cancel / Expired States */
            <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-sm text-center">
              {status === "success" ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-2">Pembayaran Berhasil!</h2>
                  <p className="text-neutral-600 text-sm mb-6">
                    Saldo Anda telah ditambahkan sebesar{" "}
                    <span className="font-semibold text-neutral-900">{formatCurrency(depositData?.diterima || 0)}</span>
                  </p>
                </>
              ) : status === "cancel" ? (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <XCircle size={32} className="text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-2">Pembayaran Dibatalkan</h2>
                  <p className="text-neutral-600 text-sm mb-6">Pembayaran Anda telah dibatalkan</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Clock size={32} className="text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-2">Waktu Habis</h2>
                  <p className="text-neutral-600 text-sm mb-6">Kode QRIS telah kedaluwarsa. Silakan buat pembayaran baru.</p>
                </>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetDeposit}
                  className="py-3 px-6 font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                >
                  Deposit Lagi
                </button>
                <Link
                  href="/dashboard"
                  className="py-3 px-6 font-semibold rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Ke Dashboard
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
    </UserSidebar>
  );
}

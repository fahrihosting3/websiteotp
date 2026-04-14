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

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    setUser(current);

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

  if (isRestoring) {
    return (
      <UserSidebar>
        <div className="min-h-full flex items-center justify-center">
          <div 
            className="bg-white border-4 border-black p-8 flex items-center gap-4"
            style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
          >
            <Loader2 className="animate-spin text-black" size={28} />
            <span className="font-bold text-lg">Memuat...</span>
          </div>
        </div>
      </UserSidebar>
    );
  }

  return (
    <UserSidebar>
      <div className="min-h-full relative">
        {/* Pending Payment Notification */}
        {showPendingNotif && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div 
              className="bg-white border-4 border-black px-6 py-4 flex items-center gap-4"
              style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
            >
              <Loader2 size={20} className="text-black animate-spin" />
              <div>
                <p className="font-black">PEMBAYARAN BELUM SELESAI</p>
                <p className="text-sm text-neutral-600 font-medium">Silakan selesaikan pembayaran Anda</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">DEPOSIT SALDO</h1>
            <p className="text-sm text-neutral-600 font-medium mt-1">Isi saldo untuk membeli nomor virtual OTP</p>
          </div>

          {/* Main Content */}
          {status === "idle" || status === "loading" || status === "error" ? (
            <div className="space-y-6">
              {/* Amount Input Card */}
              <div 
                className="bg-white border-4 border-black p-6 animate-slide-up"
                style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)', animationDelay: '0.1s' }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-12 h-12 bg-black flex items-center justify-center"
                    style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.3)' }}
                  >
                    <Wallet size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">STEP 1</p>
                    <h2 className="font-black text-lg">Masukkan Nominal</h2>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                    Jumlah Deposit
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="w-full pl-14 pr-4 py-4 text-2xl font-black bg-white border-4 border-black focus:outline-none placeholder:text-neutral-300"
                      style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 font-medium mt-2">Minimal deposit Rp1.000</p>
                </div>

                {/* Preset Amounts */}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">Pilih Nominal</p>
                  <div className="grid grid-cols-3 gap-3">
                    {PRESET_AMOUNTS.map((preset) => {
                      const isSelected = amount === preset.toLocaleString("id-ID");
                      return (
                        <button
                          key={preset}
                          onClick={() => setAmount(preset.toLocaleString("id-ID"))}
                          className={`py-3 px-4 font-bold border-4 border-black transition-all ${
                            isSelected
                              ? "bg-black text-white translate-x-1 translate-y-1"
                              : "bg-white text-black hover:bg-black hover:text-white"
                          }`}
                          style={{ 
                            boxShadow: isSelected ? '0px 0px 0px 0px rgba(0,0,0,1)' : '4px 4px 0px 0px rgba(0,0,0,1)'
                          }}
                        >
                          {formatCurrency(preset)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-3">Metode Pembayaran</p>
                  <div 
                    className="bg-white border-4 border-black p-4 flex items-center gap-4"
                    style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <div className="w-14 h-14 bg-black flex items-center justify-center">
                      <QrCode size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-lg">QRIS</p>
                      <p className="text-sm text-neutral-600 font-medium">Bayar dengan semua e-wallet & mobile banking</p>
                    </div>
                    <div 
                      className="w-8 h-8 bg-black flex items-center justify-center"
                    >
                      <CheckCircle2 size={18} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Create Deposit Button */}
                <button
                  onClick={handleCreateDeposit}
                  disabled={status === "loading" || !amount}
                  className={`w-full py-4 font-black uppercase tracking-wider text-lg border-4 border-black transition-all ${
                    status === "loading" || !amount
                      ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-white hover:text-black"
                  }`}
                  style={{ boxShadow: status === "loading" || !amount ? 'none' : '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-3">
                      <RefreshCw size={20} className="animate-spin" />
                      MEMPROSES...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <CreditCard size={20} />
                      BUAT PEMBAYARAN
                    </span>
                  )}
                </button>
              </div>

              {/* Info Card */}
              <div 
                className="bg-white border-4 border-black p-5 animate-slide-up"
                style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)', animationDelay: '0.2s' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black mb-2">INFORMASI PENTING</p>
                    <ul className="text-sm text-neutral-600 font-medium space-y-1">
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
              <div 
                className="bg-white border-4 border-black p-6 animate-slide-up"
                style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black flex items-center justify-center">
                      <QrCode size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">STEP 2</p>
                      <h2 className="font-black text-lg">Scan QRIS</h2>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white border-4 border-black"
                    style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.3)' }}
                  >
                    <Clock size={16} />
                    <span className="font-mono font-black text-lg">{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* QR Image */}
                <div className="flex justify-center mb-6">
                  <div 
                    className="bg-white border-4 border-black p-4"
                    style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
                  >
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
                <div className="space-y-3 mb-6">
                  <div 
                    className="flex items-center justify-between bg-black text-white p-5 border-4 border-black"
                    style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)' }}
                  >
                    <span className="font-bold uppercase">Total Bayar</span>
                    <span className="text-2xl font-black">{formatCurrency(depositData?.total || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 border-4 border-black">
                    <span className="text-sm font-bold uppercase text-neutral-600">Nominal</span>
                    <span className="font-black">{formatCurrency(depositData?.diterima || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 border-4 border-black">
                    <span className="text-sm font-bold uppercase text-neutral-600">Biaya Admin</span>
                    <span className="font-black">{formatCurrency(depositData?.fee || 0)}</span>
                  </div>
                </div>

                {/* Copy Address (for USDT) */}
                {depositData?.method?.includes("usdt") && (
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Alamat Wallet</p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex-1 bg-white border-4 border-black p-4 font-mono font-bold truncate"
                        style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                      >
                        {depositData.qr_string}
                      </div>
                      <button
                        onClick={() => copyToClipboard(depositData.qr_string)}
                        className="p-4 bg-black text-white border-4 border-black hover:bg-white hover:text-black transition-all"
                        style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Deposit ID */}
                <div 
                  className="bg-neutral-100 border-4 border-black p-4 flex items-center justify-between mb-6"
                  style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">DEPOSIT ID</p>
                    <p className="font-mono font-black">{depositData?.id}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(depositData?.id || "")}
                    className="p-2 hover:bg-black hover:text-white transition-colors border-2 border-black"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => checkPaymentStatus(true)}
                    disabled={checkingStatus}
                    className="flex-1 py-4 font-black uppercase tracking-wider bg-black text-white border-4 border-black hover:bg-white hover:text-black transition-all disabled:opacity-50"
                    style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <span className="flex items-center justify-center gap-3">
                      <RefreshCw size={18} className={checkingStatus ? "animate-spin" : ""} />
                      CEK STATUS
                    </span>
                  </button>
                  <button
                    onClick={resetDeposit}
                    className="py-4 px-6 font-black uppercase tracking-wider border-4 border-black bg-white hover:bg-black hover:text-white transition-all"
                    style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    BATAL
                  </button>
                </div>
              </div>

              {/* Tips Card */}
              <div 
                className="bg-white border-4 border-black p-5 animate-slide-up"
                style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)', animationDelay: '0.1s' }}
              >
                <p className="font-black mb-4">CARA BAYAR:</p>
                <ol className="text-sm font-medium space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-black text-white flex items-center justify-center font-black text-sm flex-shrink-0">1</span>
                    <span className="pt-1">Buka aplikasi e-wallet atau mobile banking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-black text-white flex items-center justify-center font-black text-sm flex-shrink-0">2</span>
                    <span className="pt-1">Pilih menu Scan QR atau QRIS</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-black text-white flex items-center justify-center font-black text-sm flex-shrink-0">3</span>
                    <span className="pt-1">Scan kode QRIS di atas dan selesaikan pembayaran</span>
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            /* Success / Cancel / Expired States */
            <div 
              className="bg-white border-4 border-black p-8 text-center animate-slide-up"
              style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
            >
              {status === "success" ? (
                <>
                  <div 
                    className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6"
                    style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)' }}
                  >
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">PEMBAYARAN BERHASIL!</h2>
                  <p className="text-neutral-600 font-medium mb-8">
                    Saldo Anda telah ditambahkan sebesar{" "}
                    <span className="font-black text-black">{formatCurrency(depositData?.diterima || 0)}</span>
                  </p>
                </>
              ) : status === "cancel" ? (
                <>
                  <div 
                    className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6"
                    style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)' }}
                  >
                    <XCircle size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">PEMBAYARAN DIBATALKAN</h2>
                  <p className="text-neutral-600 font-medium mb-8">Pembayaran Anda telah dibatalkan</p>
                </>
              ) : (
                <>
                  <div 
                    className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6"
                    style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)' }}
                  >
                    <Clock size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">WAKTU HABIS</h2>
                  <p className="text-neutral-600 font-medium mb-8">Kode QRIS telah kedaluwarsa. Silakan buat pembayaran baru.</p>
                </>
              )}

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetDeposit}
                  className="py-4 px-8 font-black uppercase tracking-wider bg-black text-white border-4 border-black hover:bg-white hover:text-black transition-all"
                  style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  DEPOSIT LAGI
                </button>
                <Link
                  href="/dashboard"
                  className="py-4 px-8 font-black uppercase tracking-wider border-4 border-black bg-white hover:bg-black hover:text-white transition-all"
                  style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  KE DASHBOARD
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserSidebar>
  );
}

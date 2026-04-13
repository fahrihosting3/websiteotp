"use client";

import { useEffect, useState, Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Wallet,
} from "lucide-react";

interface DepositData {
  id: string;
  status: string;
  method: string;
  total: number;
  fee: number;
  diterima: number;
  qr_string: string;
  qr_image: string;
  created_at: string;
  expired_at: string;
  expired_at_ts: number;
}

const PAYMENT_METHODS = [
  { id: "qris", name: "QRIS", description: "Semua e-wallet" },
  { id: "dana", name: "DANA", description: "Transfer via DANA" },
  { id: "ovo", name: "OVO", description: "Transfer via OVO" },
  { id: "gopay", name: "GoPay", description: "Transfer via GoPay" },
  { id: "shopeepay", name: "ShopeePay", description: "Transfer via ShopeePay" },
];

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

function DepositContent() {
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("qris");
  const [loading, setLoading] = useState(false);
  const [depositData, setDepositData] = useState<DepositData | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    setUser(current);
  }, [router]);

  useEffect(() => {
    if (!depositData || depositData.status !== "pending") return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = depositData.expired_at_ts - now;

      if (diff <= 0) {
        setTimeLeft("Kadaluarsa");
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [depositData]);

  const createDeposit = async () => {
    const parsed = parseInt(amount);
    if (!amount || isNaN(parsed) || parsed < 1000) {
      alert("Minimal deposit Rp1.000");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `/api/deposit/create?amount=${parsed}&payment_id=${selectedMethod}`
      );

      if (res.data.success) {
        setDepositData(res.data.data);
      } else {
        alert("Gagal membuat deposit: " + (res.data.message || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Terjadi kesalahan";
      alert("Error: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!depositData) return;

    setCheckingStatus(true);
    try {
      const res = await axios.get(
        `/api/deposit/status?deposit_id=${depositData.id}`
      );

      if (res.data.success) {
        setDepositData((prev) => ({
          ...prev!,
          status: res.data.data.status,
        }));
      }
    } catch (err) {
      console.error("Gagal cek status", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetDeposit = () => {
    setDepositData(null);
    setAmount("");
  };

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  if (!user) return null;

  const statusConfig = {
    success: {
      bg: "bg-emerald-500",
      text: "text-white",
      label: "PEMBAYARAN BERHASIL",
      icon: <CheckCircle size={28} className="text-white" />,
    },
    cancel: {
      bg: "bg-red-500",
      text: "text-white",
      label: "DIBATALKAN",
      icon: <XCircle size={28} className="text-white" />,
    },
    pending: {
      bg: "bg-amber-400",
      text: "text-stone-900",
      label: "MENUNGGU PEMBAYARAN",
      icon: <Clock size={28} className="text-stone-900" />,
    },
  };

  const currentStatus = statusConfig[depositData?.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800;900&display=swap');

        * { box-sizing: border-box; }

        .font-syne { font-family: 'Syne', sans-serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }

        .card {
          background: #1c1917;
          border: 1px solid #292524;
          border-radius: 16px;
        }

        .card-glow {
          background: #1c1917;
          border: 1px solid #3f3f3b;
          border-radius: 16px;
          box-shadow: 0 0 0 1px #292524, 0 4px 24px rgba(0,0,0,0.4);
        }

        .pill {
          border-radius: 999px;
        }

        .method-btn {
          border-radius: 12px;
          border: 1px solid #292524;
          background: #1c1917;
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .method-btn:hover {
          border-color: #10b981;
          background: #0d1f18;
        }

        .method-btn.active {
          border-color: #10b981;
          background: #052e1c;
          box-shadow: inset 0 0 0 1px #10b981;
        }

        .preset-btn {
          border-radius: 10px;
          border: 1px solid #292524;
          background: #1c1917;
          transition: all 0.15s ease;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
        }

        .preset-btn:hover {
          border-color: #52525b;
          background: #27272a;
        }

        .preset-btn.active {
          border-color: #10b981;
          background: #052e1c;
          color: #6ee7b7;
        }

        .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        }

        .btn-primary:disabled {
          background: #27272a;
          color: #52525b;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #1c1917;
          border-radius: 12px;
          border: 1px solid #3f3f3b;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          color: #d6d3d1;
        }

        .btn-secondary:hover {
          border-color: #52525b;
          background: #27272a;
        }

        .amount-input {
          background: #0c0a09;
          border: 1px solid #292524;
          border-radius: 12px;
          color: #f5f5f4;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 28px;
          width: 100%;
          padding: 16px 16px 16px 56px;
          outline: none;
          transition: border-color 0.15s;
        }

        .amount-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
        }

        .amount-input::placeholder { color: #44403c; }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #1c1917;
        }

        .detail-row:last-child { border-bottom: none; }

        .qr-wrapper {
          background: white;
          border-radius: 16px;
          padding: 16px;
          display: inline-block;
        }

        .back-btn {
          background: transparent;
          border: 1px solid #292524;
          border-radius: 8px;
          color: #a8a29e;
          padding: 8px 16px;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
          margin-bottom: 28px;
        }

        .back-btn:hover {
          border-color: #52525b;
          color: #f5f5f4;
        }

        .label-tag {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #57534e;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
      `}</style>

      <Navbar />

      <div className="max-w-[520px] mx-auto px-4 py-8">

        <button className="back-btn" onClick={() => router.push("/dashboard")}>
          <ArrowLeft size={12} />
          KEMBALI
        </button>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <div
            style={{
              width: 44,
              height: 44,
              background: "linear-gradient(135deg, #10b981, #059669)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Wallet size={22} className="text-white" />
          </div>
          <div>
            <div className="label-tag" style={{ marginBottom: 2 }}>Top Up Saldo</div>
            <h1
              className="font-syne"
              style={{ fontSize: 26, fontWeight: 900, color: "#f5f5f4", lineHeight: 1 }}
            >
              DEPOSIT
            </h1>
          </div>
        </div>

        {!depositData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Amount Input */}
            <div className="card" style={{ padding: 20 }}>
              <div className="label-tag">Nominal Deposit</div>
              <div style={{ position: "relative" }}>
                <span
                  className="font-mono-dm"
                  style={{
                    position: "absolute",
                    left: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#57534e",
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  Rp
                </span>
                <input
                  className="amount-input"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min={1000}
                />
              </div>

              {/* Preset Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                  marginTop: 14,
                }}
              >
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className={`preset-btn ${amount === preset.toString() ? "active" : ""}`}
                    style={{ padding: "10px 6px", fontSize: 11 }}
                  >
                    {formatRupiah(preset)}
                  </button>
                ))}
              </div>

              {amount && parseInt(amount) >= 1000 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "#052e1c",
                    borderRadius: 8,
                    border: "1px solid #065f46",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Zap size={13} className="text-emerald-400" />
                  <span
                    className="font-mono-dm"
                    style={{ fontSize: 11, color: "#6ee7b7" }}
                  >
                    Saldo masuk:{" "}
                    <strong>{formatRupiah(parseInt(amount))}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="card" style={{ padding: 20 }}>
              <div className="label-tag">Metode Pembayaran</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`method-btn ${selectedMethod === method.id ? "active" : ""}`}
                    style={{
                      padding: "13px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div
                        className="font-syne"
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: selectedMethod === method.id ? "#6ee7b7" : "#e7e5e4",
                        }}
                      >
                        {method.name}
                      </div>
                      <div
                        className="font-mono-dm"
                        style={{ fontSize: 11, color: "#78716c", marginTop: 2 }}
                      >
                        {method.description}
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle size={18} className="text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn-primary"
              onClick={createDeposit}
              disabled={loading || !amount || parseInt(amount) < 1000}
              style={{
                padding: "18px",
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  BUAT DEPOSIT
                </>
              )}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Status Banner */}
            <div
              className={`${currentStatus.bg} ${currentStatus.text}`}
              style={{
                borderRadius: 16,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {currentStatus.icon}
                <div>
                  <div
                    className="font-mono-dm"
                    style={{ fontSize: 10, letterSpacing: 2, opacity: 0.75 }}
                  >
                    STATUS
                  </div>
                  <div className="font-syne" style={{ fontWeight: 900, fontSize: 16 }}>
                    {currentStatus.label}
                  </div>
                </div>
              </div>
              {depositData.status === "pending" && timeLeft && (
                <div style={{ textAlign: "right" }}>
                  <div
                    className="font-mono-dm"
                    style={{ fontSize: 10, opacity: 0.7, letterSpacing: 1 }}
                  >
                    SISA WAKTU
                  </div>
                  <div className="font-syne" style={{ fontWeight: 900, fontSize: 22 }}>
                    {timeLeft}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code */}
            {depositData.status === "pending" && depositData.qr_image && (
              <div
                className="card"
                style={{ padding: 24, textAlign: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  <QrCode size={15} className="text-emerald-400" />
                  <span
                    className="font-mono-dm"
                    style={{ fontSize: 11, letterSpacing: 2, color: "#a8a29e" }}
                  >
                    SCAN QR CODE
                  </span>
                </div>

                <div className="qr-wrapper" style={{ marginBottom: 20 }}>
                  <img
                    src={depositData.qr_image}
                    alt="QR Code"
                    style={{ width: 200, height: 200, display: "block" }}
                  />
                </div>

                {depositData.qr_string && (
                  <>
                    <p
                      className="font-mono-dm"
                      style={{ fontSize: 11, color: "#57534e", marginBottom: 10 }}
                    >
                      Atau salin string QR:
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#0c0a09",
                        borderRadius: 10,
                        border: "1px solid #292524",
                        padding: "10px 14px",
                      }}
                    >
                      <code
                        className="font-mono-dm"
                        style={{
                          flex: 1,
                          fontSize: 11,
                          color: "#a8a29e",
                          wordBreak: "break-all",
                          textAlign: "left",
                        }}
                      >
                        {depositData.qr_string.length > 40
                          ? depositData.qr_string.slice(0, 40) + "..."
                          : depositData.qr_string}
                      </code>
                      <button
                        onClick={() => copyToClipboard(depositData.qr_string)}
                        style={{
                          background: copied ? "#052e1c" : "#1c1917",
                          border: `1px solid ${copied ? "#10b981" : "#3f3f3b"}`,
                          borderRadius: 8,
                          padding: "6px 8px",
                          cursor: "pointer",
                          color: copied ? "#10b981" : "#a8a29e",
                          flexShrink: 0,
                        }}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Detail Pembayaran */}
            <div className="card" style={{ padding: 20 }}>
              <div className="label-tag">Detail Pembayaran</div>
              <div>
                {[
                  { label: "ID Transaksi", value: depositData.id, mono: true },
                  {
                    label: "Total Bayar",
                    value: formatRupiah(depositData.total),
                    highlight: true,
                  },
                  {
                    label: "Biaya Admin",
                    value: formatRupiah(depositData.fee),
                  },
                  {
                    label: "Saldo Diterima",
                    value: formatRupiah(depositData.diterima),
                  },
                ].map((row) => (
                  <div key={row.label} className="detail-row">
                    <span
                      className="font-mono-dm"
                      style={{ fontSize: 12, color: "#78716c" }}
                    >
                      {row.label}
                    </span>
                    <span
                      className={row.mono ? "font-mono-dm" : "font-syne"}
                      style={{
                        fontSize: row.highlight ? 16 : 13,
                        fontWeight: row.highlight ? 800 : 600,
                        color: row.highlight ? "#10b981" : "#d6d3d1",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {depositData.status === "pending" && (
                <button
                  className="btn-primary"
                  onClick={checkStatus}
                  disabled={checkingStatus}
                  style={{
                    padding: "16px",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  {checkingStatus ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Mengecek Status...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      CEK STATUS PEMBAYARAN
                    </>
                  )}
                </button>
              )}

              <button
                className="btn-secondary"
                onClick={resetDeposit}
                style={{
                  padding: "14px",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                }}
              >
                {depositData.status === "success" ? "DEPOSIT LAGI" : "BUAT DEPOSIT BARU"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-emerald-500" />
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DepositContent />
    </Suspense>
  );
}

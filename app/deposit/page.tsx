"use client";

import { useEffect, useState, Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  Loader2,
  Terminal,
  CreditCard,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Wallet,
  AlertCircle,
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
  { id: "qris", name: "QRIS", icon: "https://assets.cindigital.id/h2h/brand/qris.webp" },
  { id: "dana", name: "DANA", icon: "https://assets.cindigital.id/h2h/brand/dana.webp" },
  { id: "ovo", name: "OVO", icon: "https://assets.cindigital.id/h2h/brand/ovo.webp" },
  { id: "gopay", name: "GoPay", icon: "https://assets.cindigital.id/h2h/brand/gopay.webp" },
  { id: "shopeepay", name: "ShopeePay", icon: "https://assets.cindigital.id/h2h/brand/shopeepay.webp" },
];

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

function DepositContent() {
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState<string>("10000");
  const [selectedMethod, setSelectedMethod] = useState<string>("qris");
  const [loading, setLoading] = useState(false);
  const [depositData, setDepositData] = useState<DepositData | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    setUser(current);
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (!depositData || depositData.status !== "pending") return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expiry = depositData.expired_at_ts;
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
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
    if (!amount || parseInt(amount) < 1000) {
      setError("Minimal deposit Rp1.000");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/deposit/create?amount=${amount}&payment_id=${selectedMethod}`);
      const data = await res.json();

      if (data.success && data.data) {
        setDepositData(data.data);
        setError(null);
      } else {
        setError(data.message || "Gagal membuat deposit");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!depositData) return;

    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/deposit/status?deposit_id=${depositData.id}`);
      const data = await res.json();

      if (data.success && data.data) {
        setDepositData((prev) => ({
          ...prev!,
          status: data.data.status,
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
    setError(null);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: "#FFFEF0" }}>
      <Navbar />

      <div style={{ fontFamily: "'Space Mono', 'Courier New', monospace" }}>
        {/* Header */}
        <div
          style={{
            background: "#0A0A0A",
            borderBottom: "4px solid #10B981",
            padding: "20px 16px",
          }}
        >
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                background: "transparent",
                border: "2px solid #10B981",
                color: "#10B981",
                padding: "6px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "'Space Mono', monospace",
                fontWeight: "700",
                fontSize: "11px",
                marginBottom: "16px",
              }}
            >
              <ArrowLeft size={12} />
              KEMBALI
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wallet size={22} style={{ color: "#0A0A0A" }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <Terminal size={8} style={{ color: "#10B981" }} />
                  <span style={{ color: "#10B981", fontSize: "9px", letterSpacing: "2px", fontWeight: "700" }}>
                    TOP UP
                  </span>
                </div>
                <h1 style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: "900" }}>DEPOSIT SALDO</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 16px", maxWidth: "600px", margin: "0 auto" }}>
          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#FEE2E2",
                border: "3px solid #EF4444",
                padding: "12px 16px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <AlertCircle size={18} style={{ color: "#EF4444", flexShrink: 0 }} />
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#B91C1C" }}>{error}</span>
            </div>
          )}

          {!depositData ? (
            /* ============ FORM CREATE DEPOSIT ============ */
            <div>
              {/* Amount Section */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "3px solid #0A0A0A",
                  padding: "20px",
                  marginBottom: "16px",
                  boxShadow: "4px 4px 0 #0A0A0A",
                }}
              >
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", fontWeight: "900", marginBottom: "10px" }}>
                  NOMINAL DEPOSIT
                </label>
                
                {/* Input */}
                <div style={{ position: "relative", marginBottom: "12px" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "#666", fontSize: "14px" }}>
                    Rp
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10000"
                    style={{
                      width: "100%",
                      padding: "12px 12px 12px 40px",
                      border: "3px solid #0A0A0A",
                      fontSize: "20px",
                      fontWeight: "900",
                      fontFamily: "'Space Mono', monospace",
                      background: "#FFFEF0",
                    }}
                  />
                </div>

                {/* Preset Amounts */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      style={{
                        padding: "8px 4px",
                        border: "2px solid #0A0A0A",
                        background: amount === preset.toString() ? "#10B981" : "#FFFFFF",
                        color: amount === preset.toString() ? "#FFFFFF" : "#0A0A0A",
                        fontWeight: "700",
                        fontSize: "10px",
                        cursor: "pointer",
                        fontFamily: "'Space Mono', monospace",
                        transition: "all 0.1s",
                      }}
                    >
                      {preset >= 1000 ? `${preset / 1000}K` : preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "3px solid #0A0A0A",
                  padding: "20px",
                  marginBottom: "16px",
                  boxShadow: "4px 4px 0 #0A0A0A",
                }}
              >
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", fontWeight: "900", marginBottom: "10px" }}>
                  METODE PEMBAYARAN
                </label>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }} className="sm:grid-cols-5">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      style={{
                        padding: "12px 8px",
                        border: selectedMethod === method.id ? "3px solid #10B981" : "2px solid #E5E5E5",
                        background: selectedMethod === method.id ? "#ECFDF5" : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.1s",
                      }}
                    >
                      <img
                        src={method.icon}
                        alt={method.name}
                        style={{ width: "32px", height: "32px", objectFit: "contain" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span style={{ fontSize: "9px", fontWeight: "700", color: "#0A0A0A" }}>{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={createDeposit}
                disabled={loading || !amount}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: loading || !amount ? "#CCC" : "#10B981",
                  border: "3px solid #0A0A0A",
                  color: "#FFFFFF",
                  fontWeight: "900",
                  fontSize: "14px",
                  cursor: loading || !amount ? "not-allowed" : "pointer",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "1px",
                  boxShadow: "4px 4px 0 #0A0A0A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    MEMPROSES...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    BUAT DEPOSIT
                  </>
                )}
              </button>
            </div>
          ) : (
            /* ============ DEPOSIT RESULT ============ */
            <div>
              {/* Status Banner */}
              <div
                style={{
                  background: depositData.status === "success" ? "#10B981" : depositData.status === "cancel" ? "#EF4444" : "#FFD600",
                  border: "3px solid #0A0A0A",
                  padding: "16px",
                  marginBottom: "16px",
                  boxShadow: "4px 4px 0 #0A0A0A",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {depositData.status === "success" ? (
                      <CheckCircle size={28} style={{ color: "#FFFFFF" }} />
                    ) : depositData.status === "cancel" ? (
                      <XCircle size={28} style={{ color: "#FFFFFF" }} />
                    ) : (
                      <Clock size={28} style={{ color: "#0A0A0A" }} />
                    )}
                    <div>
                      <div style={{ fontSize: "9px", letterSpacing: "1px", fontWeight: "700", opacity: 0.7, color: depositData.status === "pending" ? "#0A0A0A" : "#FFFFFF" }}>
                        STATUS
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "900", color: depositData.status === "pending" ? "#0A0A0A" : "#FFFFFF" }}>
                        {depositData.status === "success" ? "BERHASIL" : depositData.status === "cancel" ? "DIBATALKAN" : "MENUNGGU"}
                      </div>
                    </div>
                  </div>
                  {depositData.status === "pending" && timeLeft && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "9px", letterSpacing: "1px", fontWeight: "700" }}>SISA WAKTU</div>
                      <div style={{ fontSize: "20px", fontWeight: "900", fontFamily: "monospace" }}>{timeLeft}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Display */}
              {depositData.status === "pending" && depositData.qr_image && (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "3px solid #0A0A0A",
                    padding: "20px",
                    marginBottom: "16px",
                    boxShadow: "4px 4px 0 #0A0A0A",
                    textAlign: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "12px" }}>
                    <QrCode size={14} />
                    <span style={{ fontSize: "10px", letterSpacing: "2px", fontWeight: "900" }}>SCAN QR CODE</span>
                  </div>
                  
                  {/* QR Image from API */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                    <img
                      src={depositData.qr_image}
                      alt="QR Code Pembayaran"
                      style={{
                        width: "200px",
                        height: "200px",
                        border: "4px solid #0A0A0A",
                        background: "#FFFFFF",
                      }}
                    />
                  </div>

                  {/* Copy Address */}
                  {depositData.qr_string && (
                    <div>
                      <div style={{ fontSize: "10px", color: "#666", marginBottom: "6px" }}>Atau salin alamat:</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                        <code
                          style={{
                            background: "#FFFEF0",
                            padding: "8px 10px",
                            border: "2px solid #0A0A0A",
                            fontSize: "10px",
                            wordBreak: "break-all",
                            maxWidth: "180px",
                            display: "block",
                          }}
                        >
                          {depositData.qr_string}
                        </code>
                        <button
                          onClick={() => copyToClipboard(depositData.qr_string)}
                          style={{
                            padding: "8px",
                            border: "2px solid #0A0A0A",
                            background: copied ? "#10B981" : "#FFD600",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          {copied ? <Check size={14} style={{ color: "#FFF" }} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "3px solid #0A0A0A",
                  padding: "16px",
                  marginBottom: "16px",
                  boxShadow: "4px 4px 0 #0A0A0A",
                }}
              >
                <div style={{ fontSize: "10px", letterSpacing: "2px", fontWeight: "900", marginBottom: "12px" }}>
                  DETAIL PEMBAYARAN
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#FFFEF0", border: "2px solid #E8E8D0" }}>
                    <span style={{ fontSize: "11px", color: "#666" }}>ID Deposit</span>
                    <span style={{ fontWeight: "700", fontSize: "11px" }}>{depositData.id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#FFFEF0", border: "2px solid #E8E8D0" }}>
                    <span style={{ fontSize: "11px", color: "#666" }}>Total Bayar</span>
                    <span style={{ fontWeight: "900", fontSize: "14px", color: "#10B981" }}>{formatRupiah(depositData.total)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#FFFEF0", border: "2px solid #E8E8D0" }}>
                    <span style={{ fontSize: "11px", color: "#666" }}>Biaya Admin</span>
                    <span style={{ fontWeight: "700", fontSize: "11px" }}>{formatRupiah(depositData.fee)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#FFFEF0", border: "2px solid #E8E8D0" }}>
                    <span style={{ fontSize: "11px", color: "#666" }}>Saldo Diterima</span>
                    <span style={{ fontWeight: "700", fontSize: "11px" }}>{formatRupiah(depositData.diterima)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {depositData.status === "pending" && (
                  <button
                    onClick={checkStatus}
                    disabled={checkingStatus}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "#0A0A0A",
                      border: "3px solid #0A0A0A",
                      color: "#FFFFFF",
                      fontWeight: "900",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "'Space Mono', monospace",
                      letterSpacing: "1px",
                      boxShadow: "3px 3px 0 #666",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {checkingStatus ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        MENGECEK...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        CEK STATUS
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={resetDeposit}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#FFFFFF",
                    border: "3px solid #0A0A0A",
                    color: "#0A0A0A",
                    fontWeight: "900",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "1px",
                    boxShadow: "3px 3px 0 #0A0A0A",
                  }}
                >
                  {depositData.status === "success" ? "DEPOSIT LAGI" : "BUAT DEPOSIT BARU"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen w-full" style={{ background: "#FFFEF0" }}>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 80px)" }}>
        <Loader2 size={40} className="animate-spin" style={{ color: "#0A0A0A" }} />
      </div>
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

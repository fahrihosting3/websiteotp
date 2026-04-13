"use client";

import { useEffect, useState, Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import axios from "axios";
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
  { id: "qris", name: "QRIS", description: "Scan dengan e-wallet apapun" },
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
      alert("Minimal deposit Rp1.000");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `/api/deposit/create?amount=${amount}&payment_id=${selectedMethod}`
      );

      if (res.data.success) {
        setDepositData(res.data.data);
      } else {
        alert("Gagal membuat deposit: " + (res.data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error: " + (err.response?.data?.message || err.message));
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

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: "#FFFEF0" }}
    >
      <Navbar />

      <div
        style={{
          fontFamily: "'Space Mono', 'Courier New', monospace",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#0A0A0A",
            borderBottom: "4px solid #10B981",
            padding: "24px 16px 20px",
          }}
          className="sm:px-10 sm:py-8"
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                background: "transparent",
                border: "2px solid #10B981",
                color: "#10B981",
                padding: "8px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Space Mono', monospace",
                fontWeight: "700",
                fontSize: "12px",
                marginBottom: "20px",
              }}
            >
              <ArrowLeft size={14} />
              KEMBALI
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "#10B981",
                  border: "3px solid #10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CreditCard size={24} style={{ color: "#0A0A0A" }} />
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <Terminal size={10} style={{ color: "#10B981" }} />
                  <span
                    style={{
                      color: "#10B981",
                      fontSize: "10px",
                      letterSpacing: "3px",
                      fontWeight: "700",
                    }}
                  >
                    TOP UP SALDO
                  </span>
                </div>
                <h1
                  style={{
                    color: "#FFFFFF",
                    fontSize: "24px",
                    fontWeight: "900",
                    letterSpacing: "-0.5px",
                  }}
                >
                  DEPOSIT
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          style={{ padding: "24px 16px", maxWidth: "800px", margin: "0 auto" }}
          className="sm:px-10 sm:py-8"
        >
          {!depositData ? (
            // Form Create Deposit
            <div>
              {/* Amount Input */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "4px solid #0A0A0A",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "6px 6px 0 #0A0A0A",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    fontWeight: "900",
                    color: "#0A0A0A",
                    marginBottom: "12px",
                  }}
                >
                  NOMINAL DEPOSIT
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontWeight: "700",
                      color: "#666",
                    }}
                  >
                    Rp
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10000"
                    style={{
                      width: "100%",
                      padding: "16px 16px 16px 48px",
                      border: "3px solid #0A0A0A",
                      fontSize: "24px",
                      fontWeight: "900",
                      fontFamily: "'Space Mono', monospace",
                      background: "#FFFEF0",
                    }}
                  />
                </div>

                {/* Preset Amounts */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                  className="sm:grid-cols-6"
                >
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      style={{
                        padding: "10px",
                        border: "2px solid #0A0A0A",
                        background:
                          amount === preset.toString() ? "#10B981" : "#FFFFFF",
                        color:
                          amount === preset.toString() ? "#FFFFFF" : "#0A0A0A",
                        fontWeight: "700",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontFamily: "'Space Mono', monospace",
                        boxShadow:
                          amount === preset.toString()
                            ? "3px 3px 0 #0A0A0A"
                            : "none",
                      }}
                    >
                      {formatRupiah(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "4px solid #0A0A0A",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "6px 6px 0 #0A0A0A",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    fontWeight: "900",
                    color: "#0A0A0A",
                    marginBottom: "12px",
                  }}
                >
                  METODE PEMBAYARAN
                </label>
                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      style={{
                        padding: "16px",
                        border: "3px solid #0A0A0A",
                        background:
                          selectedMethod === method.id ? "#10B981" : "#FFFFFF",
                        color:
                          selectedMethod === method.id ? "#FFFFFF" : "#0A0A0A",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow:
                          selectedMethod === method.id
                            ? "4px 4px 0 #0A0A0A"
                            : "none",
                        transform:
                          selectedMethod === method.id
                            ? "translate(-2px, -2px)"
                            : "none",
                        transition: "all 0.1s",
                      }}
                    >
                      <div style={{ textAlign: "left" }}>
                        <div
                          style={{
                            fontWeight: "900",
                            fontSize: "14px",
                            fontFamily: "'Space Mono', monospace",
                          }}
                        >
                          {method.name}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            opacity: 0.8,
                            marginTop: "2px",
                          }}
                        >
                          {method.description}
                        </div>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle size={20} />
                      )}
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
                  padding: "20px",
                  background: loading || !amount ? "#CCC" : "#10B981",
                  border: "4px solid #0A0A0A",
                  color: "#FFFFFF",
                  fontWeight: "900",
                  fontSize: "16px",
                  cursor: loading || !amount ? "not-allowed" : "pointer",
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: "2px",
                  boxShadow: "6px 6px 0 #0A0A0A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    MEMPROSES...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    BUAT DEPOSIT
                  </>
                )}
              </button>
            </div>
          ) : (
            // Deposit Created - Show QR/Payment Info
            <div>
              {/* Status Card */}
              <div
                style={{
                  background:
                    depositData.status === "success"
                      ? "#10B981"
                      : depositData.status === "cancel"
                      ? "#EF4444"
                      : "#FFD600",
                  border: "4px solid #0A0A0A",
                  padding: "20px",
                  marginBottom: "24px",
                  boxShadow: "6px 6px 0 #0A0A0A",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {depositData.status === "success" ? (
                      <CheckCircle size={32} style={{ color: "#FFFFFF" }} />
                    ) : depositData.status === "cancel" ? (
                      <XCircle size={32} style={{ color: "#FFFFFF" }} />
                    ) : (
                      <Clock size={32} style={{ color: "#0A0A0A" }} />
                    )}
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "2px",
                          fontWeight: "700",
                          color:
                            depositData.status === "pending"
                              ? "#0A0A0A"
                              : "#FFFFFF",
                          opacity: 0.8,
                        }}
                      >
                        STATUS
                      </div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "900",
                          color:
                            depositData.status === "pending"
                              ? "#0A0A0A"
                              : "#FFFFFF",
                        }}
                      >
                        {depositData.status === "success"
                          ? "BERHASIL"
                          : depositData.status === "cancel"
                          ? "DIBATALKAN"
                          : "MENUNGGU PEMBAYARAN"}
                      </div>
                    </div>
                  </div>
                  {depositData.status === "pending" && (
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "10px",
                          letterSpacing: "1px",
                          fontWeight: "700",
                        }}
                      >
                        SISA WAKTU
                      </div>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "900",
                          fontFamily: "monospace",
                        }}
                      >
                        {timeLeft}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "4px solid #0A0A0A",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "6px 6px 0 #0A0A0A",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "2px",
                    fontWeight: "900",
                    marginBottom: "16px",
                  }}
                >
                  DETAIL PEMBAYARAN
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "#FFFEF0",
                      border: "2px solid #E8E8D0",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      ID Deposit
                    </span>
                    <span style={{ fontWeight: "700", fontSize: "12px" }}>
                      {depositData.id}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "#FFFEF0",
                      border: "2px solid #E8E8D0",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Total Bayar
                    </span>
                    <span
                      style={{
                        fontWeight: "900",
                        fontSize: "16px",
                        color: "#10B981",
                      }}
                    >
                      {formatRupiah(depositData.total)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "#FFFEF0",
                      border: "2px solid #E8E8D0",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Biaya Admin
                    </span>
                    <span style={{ fontWeight: "700", fontSize: "12px" }}>
                      {formatRupiah(depositData.fee)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "#FFFEF0",
                      border: "2px solid #E8E8D0",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Saldo Diterima
                    </span>
                    <span style={{ fontWeight: "700", fontSize: "12px" }}>
                      {formatRupiah(depositData.diterima)}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {depositData.status === "pending" && depositData.qr_image && (
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "4px solid #0A0A0A",
                    padding: "24px",
                    marginBottom: "24px",
                    boxShadow: "6px 6px 0 #0A0A0A",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <QrCode size={16} />
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "2px",
                        fontWeight: "900",
                      }}
                    >
                      SCAN QR CODE
                    </span>
                  </div>
                  <img
                    src={depositData.qr_image}
                    alt="QR Code"
                    style={{
                      width: "200px",
                      height: "200px",
                      margin: "0 auto",
                      border: "4px solid #0A0A0A",
                    }}
                  />
                  {depositData.qr_string && (
                    <div style={{ marginTop: "16px" }}>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        Atau salin alamat:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <code
                          style={{
                            background: "#FFFEF0",
                            padding: "8px 12px",
                            border: "2px solid #0A0A0A",
                            fontSize: "11px",
                            wordBreak: "break-all",
                            maxWidth: "200px",
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
                          }}
                        >
                          {copied ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "grid", gap: "12px" }}>
                {depositData.status === "pending" && (
                  <button
                    onClick={checkStatus}
                    disabled={checkingStatus}
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "#0A0A0A",
                      border: "4px solid #0A0A0A",
                      color: "#FFFFFF",
                      fontWeight: "900",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "'Space Mono', monospace",
                      letterSpacing: "1px",
                      boxShadow: "4px 4px 0 #666",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {checkingStatus ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        MENGECEK...
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
                  onClick={resetDeposit}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "#FFFFFF",
                    border: "4px solid #0A0A0A",
                    color: "#0A0A0A",
                    fontWeight: "900",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: "1px",
                    boxShadow: "4px 4px 0 #0A0A0A",
                  }}
                >
                  {depositData.status === "success"
                    ? "DEPOSIT LAGI"
                    : "BUAT DEPOSIT BARU"}
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <Loader2
          size={48}
          className="animate-spin"
          style={{ color: "#0A0A0A" }}
        />
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

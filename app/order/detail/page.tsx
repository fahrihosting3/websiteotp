"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  Terminal,
  Globe,
  Phone,
  Signal,
  ShoppingCart,
  Zap,
} from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY || "";
const BASE_URL = "https://www.rumahotp.io/api/v2";

interface Operator {
  id: number;
  name: string;
  image: string;
}

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // Get params from URL
  const countryId = searchParams.get("country_id");
  const countryName = searchParams.get("country_name");
  const countryImg = searchParams.get("country_img");
  const prefix = searchParams.get("prefix");
  const stock = searchParams.get("stock");
  const priceFormat = searchParams.get("price_format");
  const price = searchParams.get("price");
  const providerId = searchParams.get("provider_id");
  const serviceCode = searchParams.get("service_code");
  const serviceName = searchParams.get("service_name");

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    setUser(current);
  }, [router]);

  useEffect(() => {
    const fetchOperators = async () => {
      if (!countryName || !providerId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/operators`, {
          params: {
            country: countryName,
            provider_id: providerId,
          },
          headers: {
            "x-apikey": API_KEY,
            Accept: "application/json",
          },
        });

        if (response.data.success) {
          setOperators(response.data.data);
          // Auto-select first operator (usually "any")
          if (response.data.data.length > 0) {
            setSelectedOperator(response.data.data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch operators:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, [countryName, providerId]);

  const handlePurchase = async () => {
    if (!selectedOperator || !user) return;

    setPurchasing(true);
    // TODO: Implement actual purchase API call
    // For now, simulate purchase
    setTimeout(() => {
      setPurchasing(false);
      alert(`Pembelian berhasil! Nomor untuk ${serviceName} (${countryName}) akan segera dikirim.`);
      router.push("/dashboard");
    }, 2000);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: "#FFFEF0" }}>
      <Navbar />
      <div
        style={{
          fontFamily: "'Space Mono', 'Courier New', monospace",
          minHeight: "calc(100vh - 80px)",
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#0A0A0A",
            borderBottom: "4px solid #FFD600",
            padding: "20px 16px",
            position: "relative",
            overflow: "hidden",
          }}
          className="sm:px-10 sm:py-6"
        >
          {/* Grid Pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,214,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,214,0,0.1) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 10, maxWidth: "1100px", margin: "0 auto" }}>
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "2px solid #FFD600",
                padding: "8px 16px",
                color: "#FFD600",
                fontFamily: "'Space Mono', monospace",
                fontWeight: "700",
                fontSize: "12px",
                letterSpacing: "1px",
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              <ArrowLeft size={16} />
              KEMBALI
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Terminal size={14} style={{ color: "#FFD600" }} />
              <span
                style={{
                  color: "#FFD600",
                  fontSize: "10px",
                  fontWeight: "900",
                  letterSpacing: "3px",
                }}
              >
                RUMAHOTP.IO // DETAIL ORDER
              </span>
            </div>

            <h1
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(20px, 4vw, 28px)",
                fontWeight: "900",
                letterSpacing: "-1px",
                lineHeight: 1.2,
              }}
            >
              PILIH OPERATOR
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: "24px 16px", maxWidth: "1100px", margin: "0 auto" }} className="sm:px-10 sm:py-8">
          {/* Order Info Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "4px solid #0A0A0A",
              boxShadow: "6px 6px 0 #0A0A0A",
              marginBottom: "24px",
            }}
          >
            {/* Card Header */}
            <div
              style={{
                background: "#0A0A0A",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Globe size={14} style={{ color: "#FFD600" }} />
              <span
                style={{
                  color: "#FFD600",
                  fontSize: "10px",
                  fontWeight: "900",
                  letterSpacing: "2px",
                }}
              >
                DETAIL PESANAN
              </span>
            </div>

            {/* Card Content */}
            <div style={{ padding: "20px" }}>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                {/* Country Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {countryImg && (
                    <img
                      src={countryImg}
                      alt={countryName || ""}
                      style={{
                        width: "48px",
                        height: "36px",
                        objectFit: "cover",
                        border: "3px solid #0A0A0A",
                      }}
                    />
                  )}
                  <div>
                    <p style={{ fontWeight: "900", fontSize: "16px", color: "#0A0A0A" }}>
                      {countryName}
                    </p>
                    <p style={{ fontSize: "12px", color: "#666", fontFamily: "monospace" }}>
                      {prefix}
                    </p>
                  </div>
                </div>

                {/* Service Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#FFD600",
                      border: "3px solid #0A0A0A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Phone size={18} />
                  </div>
                  <div>
                    <p style={{ fontWeight: "900", fontSize: "14px", color: "#0A0A0A" }}>
                      {serviceName}
                    </p>
                    <p style={{ fontSize: "12px", color: "#666" }}>Service Code: {serviceCode}</p>
                  </div>
                </div>

                {/* Stock & Price */}
                <div className="flex gap-6">
                  <div>
                    <p style={{ fontSize: "10px", color: "#666", letterSpacing: "1px", marginBottom: "2px" }}>
                      STOK
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          background: Number(stock) > 0 ? "#00C851" : "#333333",
                          border: "2px solid #0A0A0A",
                        }}
                      />
                      <span style={{ fontWeight: "900", fontSize: "14px" }}>{stock}</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", color: "#666", letterSpacing: "1px", marginBottom: "2px" }}>
                      HARGA
                    </p>
                    <span
                      style={{
                        fontWeight: "900",
                        fontSize: "16px",
                        color: "#0A0A0A",
                        background: "#FFD600",
                        padding: "2px 8px",
                        border: "2px solid #0A0A0A",
                      }}
                    >
                      {priceFormat}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operators Section */}
          <div
            style={{
              background: "#FFFFFF",
              border: "4px solid #0A0A0A",
              boxShadow: "6px 6px 0 #0A0A0A",
              marginBottom: "24px",
            }}
          >
            {/* Section Header */}
            <div
              style={{
                background: "#0A0A0A",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Signal size={14} style={{ color: "#FFD600" }} />
              <span
                style={{
                  color: "#FFD600",
                  fontSize: "10px",
                  fontWeight: "900",
                  letterSpacing: "2px",
                }}
              >
                PILIH OPERATOR
              </span>
            </div>

            {/* Operators Grid */}
            <div style={{ padding: "20px" }}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: "#0A0A0A" }} />
                </div>
              ) : operators.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                  Tidak ada operator tersedia
                </p>
              ) : (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                  style={{ gap: "12px" }}
                >
                  {operators.map((operator) => (
                    <button
                      key={operator.id}
                      onClick={() => setSelectedOperator(operator)}
                      style={{
                        background:
                          selectedOperator?.id === operator.id ? "#FFD600" : "#FFFEF0",
                        border:
                          selectedOperator?.id === operator.id
                            ? "4px solid #0A0A0A"
                            : "3px solid #0A0A0A",
                        padding: "16px 12px",
                        cursor: "pointer",
                        boxShadow:
                          selectedOperator?.id === operator.id
                            ? "4px 4px 0 #0A0A0A"
                            : "3px 3px 0 #0A0A0A",
                        transition: "all 0.1s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <img
                        src={operator.image}
                        alt={operator.name}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "contain",
                          border: "2px solid #0A0A0A",
                          background: "#FFFFFF",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/40?text=" + operator.name.charAt(0).toUpperCase();
                        }}
                      />
                      <span
                        style={{
                          fontWeight: "900",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: "#0A0A0A",
                        }}
                      >
                        {operator.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!selectedOperator || purchasing}
            style={{
              width: "100%",
              background: selectedOperator && !purchasing ? "#FFD600" : "#CCCCCC",
              border: "4px solid #0A0A0A",
              padding: "20px",
              cursor: selectedOperator && !purchasing ? "pointer" : "not-allowed",
              boxShadow: "6px 6px 0 #0A0A0A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              fontFamily: "'Space Mono', monospace",
              fontWeight: "900",
              fontSize: "16px",
              letterSpacing: "2px",
              color: "#0A0A0A",
              transition: "all 0.15s",
            }}
          >
            {purchasing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                MEMPROSES...
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                BELI SEKARANG - {priceFormat}
              </>
            )}
          </button>

          {/* Info Note */}
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "#F5F4E0",
              border: "3px solid #0A0A0A",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <Zap size={18} style={{ color: "#0A0A0A", flexShrink: 0 }} />
            <p style={{ fontSize: "12px", color: "#0A0A0A", lineHeight: 1.5 }}>
              Setelah pembelian, nomor virtual akan langsung aktif dan siap menerima OTP.
              Pastikan saldo Anda mencukupi sebelum melakukan pembelian.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense
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
        <Loader2 size={48} className="animate-spin" style={{ color: "#0A0A0A" }} />
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function OrderDetailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderDetailContent />
    </Suspense>
  );
}

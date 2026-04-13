"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Loader2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
  Globe,
  Terminal,
} from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY || "";
const BASE_URL = "https://www.rumahotp.io/api/v2";

interface Service {
  service_code: number;
  service_name: string;
  service_img: string;
}

interface Country {
  number_id: number;
  name: string;
  img: string;
  prefix: string;
  rate: number;
  stock_total: number;
  pricelist: Array<{
    provider_id: string;
    server_id: number;
    stock: number;
    price: number;
    price_format: string;
    available: boolean;
  }>;
}

const ITEMS_PER_SLIDE = 8;

export default function BuyNumber() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = Math.ceil(services.length / ITEMS_PER_SLIDE);

  // Load Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/services`, {
          headers: { "x-apikey": API_KEY, Accept: "application/json" },
        });
        if (res.data.success) setServices(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Load Countries ketika service dipilih
  useEffect(() => {
    if (!selectedService) return;
    const fetchCountries = async () => {
      setLoadingCountries(true);
      setCountries([]);
      try {
        const res = await axios.get(
          `${BASE_URL}/countries?service_id=${selectedService.service_code}`,
          { headers: { "x-apikey": API_KEY, Accept: "application/json" } }
        );
        if (res.data.success) setCountries(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, [selectedService]);

  const visibleServices = services.slice(
    currentSlide * ITEMS_PER_SLIDE,
    (currentSlide + 1) * ITEMS_PER_SLIDE
  );

  const goToDetail = (country: Country) => {
    const params = new URLSearchParams({
      country_id: String(country.number_id),
      country_name: country.name,
      country_img: country.img,
      prefix: country.prefix,
      stock: String(country.stock_total),
      price_format: country.pricelist[0]?.price_format || "",
      price: String(country.pricelist[0]?.price || 0),
      provider_id: country.pricelist[0]?.provider_id || "",
      service_code: String(selectedService?.service_code || ""),
      service_name: selectedService?.service_name || "",
    });
    router.push(`/order/detail?${params.toString()}`);
  };

  return (
    <div
      style={{
        fontFamily: "'Space Mono', 'Courier New', monospace",
        background: "#FFFEF0",
        minHeight: "calc(100vh - 80px)",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
      {/* ===== HERO HEADER ===== */}
      <div
        style={{
          background: "#0A0A0A",
          borderBottom: "4px solid #FFD600",
          padding: "24px 16px 20px",
          position: "relative",
          overflow: "hidden",
        }}
        className="sm:px-10 sm:py-8"
      >
        {/* Retro dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,214,0,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}
          >
            <div
              style={{
                background: "#FFD600",
                border: "3px solid #FFD600",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "5px 5px 0px rgba(255,214,0,0.3)",
              }}
            >
              <ShoppingCart size={22} color="#0A0A0A" />
            </div>
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}
              >
                <Terminal size={10} color="#FFD600" />
                <span
                  style={{ color: "#FFD600", fontSize: "10px", letterSpacing: "3px" }}
                >
                  RUMAHOTP.IO // ORDER_NUMBER
                </span>
              </div>
              <h1
                style={{
                  color: "#FFFEF0",
                  fontSize: "26px",
                  fontWeight: "900",
                  letterSpacing: "-1px",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                BELI NOMOR VIRTUAL
              </h1>
            </div>
          </div>
          <p style={{ color: "#666", fontSize: "11px", margin: 0, letterSpacing: "2px" }}>
            [01] PILIH APP → [02] PILIH NEGARA → [03] DETAIL & BELI
          </p>
        </div>
      </div>

      <div style={{ padding: "24px 16px", maxWidth: "1100px", margin: "0 auto" }} className="sm:px-10 sm:py-8">

        {/* ===== SECTION 01: SLIDER APLIKASI ===== */}
        <div style={{ marginBottom: "40px" }}>

          {/* Label + Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  background: "#FFD600",
                  border: "3px solid #0A0A0A",
                  padding: "5px 14px",
                  boxShadow: "3px 3px 0 #0A0A0A",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    letterSpacing: "2px",
                    color: "#0A0A0A",
                  }}
                >
                  01 / PILIH APLIKASI
                </span>
              </div>
              {selectedService && (
                <div
                  style={{
                    background: "#0A0A0A",
                    border: "2px solid #FFD600",
                    padding: "4px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Zap size={10} color="#FFD600" />
                  <span style={{ color: "#FFD600", fontSize: "10px", letterSpacing: "1px" }}>
                    {selectedService.service_name.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Prev/Next Buttons */}
            {totalSlides > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{ color: "#888", fontSize: "11px", letterSpacing: "1px" }}
                >
                  {currentSlide + 1} / {totalSlides}
                </span>
                <button
                  onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                  disabled={currentSlide === 0}
                  style={{
                    background: currentSlide === 0 ? "#D0D0C0" : "#0A0A0A",
                    border: "3px solid #0A0A0A",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: currentSlide === 0 ? "not-allowed" : "pointer",
                    boxShadow: currentSlide === 0 ? "none" : "3px 3px 0 #FFD600",
                  }}
                >
                  <ChevronLeft size={16} color={currentSlide === 0 ? "#999" : "#FFFEF0"} />
                </button>
                <button
                  onClick={() =>
                    setCurrentSlide((p) => Math.min(totalSlides - 1, p + 1))
                  }
                  disabled={currentSlide === totalSlides - 1}
                  style={{
                    background:
                      currentSlide === totalSlides - 1 ? "#D0D0C0" : "#0A0A0A",
                    border: "3px solid #0A0A0A",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor:
                      currentSlide === totalSlides - 1 ? "not-allowed" : "pointer",
                    boxShadow:
                      currentSlide === totalSlides - 1
                        ? "none"
                        : "3px 3px 0 #FFD600",
                  }}
                >
                  <ChevronRight
                    size={16}
                    color={
                      currentSlide === totalSlides - 1 ? "#999" : "#FFFEF0"
                    }
                  />
                </button>
              </div>
            )}
          </div>

          {/* Dot Indicators */}
          {totalSlides > 1 && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: i === currentSlide ? "28px" : "8px",
                    height: "8px",
                    background: i === currentSlide ? "#FFD600" : "#0A0A0A",
                    border: "2px solid #0A0A0A",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}

          {/* Services Box */}
          <div
            style={{
              border: "4px solid #0A0A0A",
              background: "#FFFEF0",
              boxShadow: "7px 7px 0 #0A0A0A",
              padding: "20px",
            }}
          >
            {loadingServices ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "60px",
                  gap: "12px",
                }}
              >
                <Loader2
                  size={24}
                  color="#0A0A0A"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                <span style={{ fontSize: "12px", letterSpacing: "2px" }}>
                  MEMUAT LAYANAN...
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
                className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              >
                {visibleServices.map((service) => {
                  const isSelected =
                    selectedService?.service_code === service.service_code;
                  return (
                    <button
                      key={service.service_code}
                      onClick={() => setSelectedService(service)}
                      style={{
                        background: isSelected ? "#FFD600" : "#FFFEF0",
                        border: "3px solid #0A0A0A",
                        padding: "16px 10px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: isSelected
                          ? "4px 4px 0 #0A0A0A"
                          : "3px 3px 0 #B0B0A0",
                        transform: isSelected
                          ? "translate(-1px, -1px)"
                          : "none",
                        transition: "all 0.1s ease",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.transform = "translate(-2px, -2px)";
                          el.style.boxShadow = "5px 5px 0 #0A0A0A";
                          el.style.background = "#FFF9CC";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.transform = "none";
                          el.style.boxShadow = "3px 3px 0 #B0B0A0";
                          el.style.background = "#FFFEF0";
                        }
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-3px",
                            right: "-3px",
                            background: "#0A0A0A",
                            width: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Zap size={10} color="#FFD600" />
                        </div>
                      )}
                      <img
                        src={service.service_img}
                        alt={service.service_name}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "contain",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          letterSpacing: "0.5px",
                          textAlign: "center",
                          color: "#0A0A0A",
                          lineHeight: 1.3,
                        }}
                      >
                        {service.service_name.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ===== SECTION 02: TABEL NEGARA ===== */}
        {selectedService && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  background: "#0A0A0A",
                  border: "3px solid #0A0A0A",
                  padding: "5px 14px",
                  boxShadow: "3px 3px 0 #FFD600",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    letterSpacing: "2px",
                    color: "#FFFEF0",
                  }}
                >
                  02 / PILIH NEGARA
                </span>
              </div>
              <Globe size={14} color="#888" />
              <span style={{ color: "#888", fontSize: "11px", letterSpacing: "1px" }}>
                KLIK HARGA → BUKA HALAMAN DETAIL
              </span>
              {loadingCountries && (
                <Loader2
                  size={16}
                  color="#0A0A0A"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              )}
            </div>

            {loadingCountries ? (
              <div
                style={{
                  border: "4px solid #0A0A0A",
                  boxShadow: "7px 7px 0 #0A0A0A",
                  padding: "60px",
                  textAlign: "center",
                  background: "#FFFEF0",
                }}
              >
                <span style={{ fontSize: "12px", letterSpacing: "2px" }}>
                  MEMUAT NEGARA...
                </span>
              </div>
            ) : (
              <div
                style={{
                  border: "4px solid #0A0A0A",
                  boxShadow: "7px 7px 0 #0A0A0A",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    background: "#0A0A0A",
                    padding: "12px 16px",
                    borderBottom: "3px solid #FFD600",
                    gap: "12px",
                  }}
                  className="sm:hidden"
                >
                  <span style={{ color: "#FFD600", fontSize: "10px", letterSpacing: "2px", fontWeight: "900" }}>NEGARA</span>
                  <span style={{ color: "#FFD600", fontSize: "10px", letterSpacing: "2px", fontWeight: "900" }}>HARGA</span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr auto",
                    background: "#0A0A0A",
                    padding: "12px 20px",
                    borderBottom: "3px solid #FFD600",
                    gap: "12px",
                  }}
                  className="hidden sm:grid"
                >
                  {["NEGARA", "PREFIX", "STOK", "HARGA / AKSI"].map((h) => (
                    <span
                      key={h}
                      style={{
                        color: "#FFD600",
                        fontSize: "10px",
                        letterSpacing: "2px",
                        fontWeight: "900",
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                {countries.map((country, idx) => {
                  const priceInfo = country.pricelist[0];
                  return (
                    <div
                      key={country.number_id}
                      style={{
                        borderBottom:
                          idx < countries.length - 1
                            ? "2px solid #E8E8D0"
                            : "none",
                        background: idx % 2 === 0 ? "#FFFEF0" : "#F5F4E0",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background =
                          "#FFF9CC";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background =
                          idx % 2 === 0 ? "#FFFEF0" : "#F5F4E0";
                      }}
                    >
                      {/* Mobile Layout */}
                      <div 
                        className="sm:hidden"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                          <img
                            src={country.img}
                            alt={country.name}
                            style={{
                              width: "30px",
                              height: "22px",
                              objectFit: "cover",
                              border: "2px solid #0A0A0A",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontWeight: "700", fontSize: "12px", color: "#0A0A0A", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {country.name}
                            </span>
                            <span style={{ fontSize: "10px", color: "#666" }}>{country.prefix} | Stok: {country.stock_total}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => goToDetail(country)}
                          style={{
                            background: "#FFD600",
                            border: "2px solid #0A0A0A",
                            padding: "6px 10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            boxShadow: "2px 2px 0 #0A0A0A",
                            fontFamily: "'Space Mono', monospace",
                            fontWeight: "900",
                            fontSize: "10px",
                            color: "#0A0A0A",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          <span>{priceInfo?.price_format || "LIHAT"}</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>

                      {/* Desktop Layout */}
                      <div
                        className="hidden sm:grid"
                        style={{
                          gridTemplateColumns: "2fr 1fr 1fr auto",
                          alignItems: "center",
                          padding: "12px 20px",
                          gap: "12px",
                        }}
                      >
                        {/* Nama Negara */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <img
                            src={country.img}
                            alt={country.name}
                            style={{
                              width: "34px",
                              height: "24px",
                              objectFit: "cover",
                              border: "2px solid #0A0A0A",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "13px",
                              color: "#0A0A0A",
                            }}
                          >
                            {country.name}
                          </span>
                        </div>

                        {/* Prefix */}
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "#555",
                            letterSpacing: "1px",
                          }}
                        >
                          {country.prefix}
                        </span>

                        {/* Stok */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              background:
                                country.stock_total > 0 ? "#00C851" : "#FF4444",
                              border: "2px solid #0A0A0A",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{ fontSize: "12px", fontWeight: "700" }}
                          >
                            {country.stock_total}
                          </span>
                        </div>

                        {/* Tombol → Halaman Baru */}
                        <button
                          onClick={() => goToDetail(country)}
                          style={{
                            background: "#FFD600",
                            border: "3px solid #0A0A0A",
                            padding: "7px 16px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "3px 3px 0 #0A0A0A",
                            fontFamily: "'Space Mono', monospace",
                            fontWeight: "900",
                            fontSize: "11px",
                            letterSpacing: "0.5px",
                            color: "#0A0A0A",
                            whiteSpace: "nowrap",
                            transition: "all 0.1s",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.transform = "translate(-2px, -2px)";
                            el.style.boxShadow = "5px 5px 0 #0A0A0A";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.transform = "none";
                            el.style.boxShadow = "3px 3px 0 #0A0A0A";
                          }}
                        >
                          <span>{priceInfo?.price_format || "LIHAT"}</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {countries.length === 0 && !loadingCountries && (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#888",
                      fontSize: "12px",
                      letterSpacing: "2px",
                    }}
                  >
                    TIDAK ADA NEGARA TERSEDIA
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Placeholder kalau belum pilih service */}
        {!selectedService && !loadingServices && (
          <div
            style={{
              border: "4px dashed #0A0A0A",
              padding: "48px",
              textAlign: "center",
              background: "transparent",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "14px" }}>☝️</div>
            <p
              style={{
                color: "#0A0A0A",
                fontSize: "13px",
                fontWeight: "900",
                letterSpacing: "3px",
                margin: "0 0 8px",
              }}
            >
              PILIH APLIKASI DULU BROK
            </p>
            <p
              style={{
                color: "#888",
                fontSize: "11px",
                letterSpacing: "2px",
                margin: 0,
              }}
            >
              KLIK SALAH SATU IKON DI ATAS
            </p>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

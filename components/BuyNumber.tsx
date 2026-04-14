"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Loader2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  Globe,
  Search,
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
            <ShoppingCart size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Beli Nomor Virtual</h1>
          </div>
        </div>
        <p className="text-sm text-neutral-500">Pilih aplikasi, lalu pilih negara untuk membeli nomor OTP</p>
      </div>

      {/* Step 1: Pilih Aplikasi */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">STEP 1</span>
            <span className="text-sm font-medium text-neutral-700">Pilih Aplikasi</span>
            {selectedService && (
              <span className="text-xs font-medium text-white bg-neutral-900 px-2.5 py-1 rounded-md">
                {selectedService.service_name}
              </span>
            )}
          </div>

          {/* Pagination Controls */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                disabled={currentSlide === 0}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                  currentSlide === 0
                    ? "bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed"
                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentSlide((p) => Math.min(totalSlides - 1, p + 1))}
                disabled={currentSlide === totalSlides - 1}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                  currentSlide === totalSlides - 1
                    ? "bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed"
                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Dot Indicators */}
        {totalSlides > 1 && (
          <div className="flex gap-1.5 mb-4">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentSlide ? "w-6 bg-neutral-900" : "w-1.5 bg-neutral-300"
                }`}
              />
            ))}
          </div>
        )}

        {/* Services Grid */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
          {loadingServices ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 size={20} className="animate-spin text-neutral-400" />
              <span className="text-sm text-neutral-500">Memuat layanan...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleServices.map((service) => {
                const isSelected = selectedService?.service_code === service.service_code;
                return (
                  <button
                    key={service.service_code}
                    onClick={() => setSelectedService(service)}
                    className={`relative p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-50"
                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-neutral-900 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <img
                      src={service.service_img}
                      alt={service.service_name}
                      className="w-10 h-10 object-contain"
                    />
                    <span className="text-xs font-medium text-neutral-700 text-center leading-tight">
                      {service.service_name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Pilih Negara */}
      {selectedService && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">STEP 2</span>
              <span className="text-sm font-medium text-neutral-700">Pilih Negara</span>
              <Globe size={14} className="text-neutral-400" />
            </div>
            {loadingCountries && (
              <Loader2 size={16} className="animate-spin text-neutral-400" />
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari negara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          {loadingCountries ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-sm">
              <Loader2 size={24} className="animate-spin mx-auto mb-3 text-neutral-400" />
              <span className="text-sm text-neutral-500">Memuat negara...</span>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-neutral-900 text-white text-xs font-semibold">
                <span>Negara</span>
                <span>Prefix</span>
                <span>Stok</span>
                <span>Harga / Aksi</span>
              </div>

              {/* Table Header - Mobile */}
              <div className="sm:hidden grid grid-cols-2 gap-4 px-4 py-3 bg-neutral-900 text-white text-xs font-semibold">
                <span>Negara</span>
                <span className="text-right">Harga</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-neutral-100">
                {filteredCountries.map((country) => {
                  const priceInfo = country.pricelist[0];
                  return (
                    <div key={country.number_id} className="hover:bg-neutral-50 transition-colors">
                      {/* Mobile Layout */}
                      <div className="sm:hidden flex items-center justify-between px-4 py-3 gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={country.img}
                            alt={country.name}
                            className="w-8 h-6 object-cover rounded border border-neutral-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{country.name}</p>
                            <p className="text-xs text-neutral-500">{country.prefix} | Stok: {country.stock_total}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => goToDetail(country)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex-shrink-0"
                        >
                          <span>{priceInfo?.price_format || "Lihat"}</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={country.img}
                            alt={country.name}
                            className="w-9 h-6 object-cover rounded border border-neutral-200"
                          />
                          <span className="text-sm font-medium text-neutral-900">{country.name}</span>
                        </div>
                        <span className="text-sm text-neutral-600 font-mono">{country.prefix}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${country.stock_total > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
                          <span className="text-sm font-medium text-neutral-900">{country.stock_total}</span>
                        </div>
                        <button
                          onClick={() => goToDetail(country)}
                          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                          <span>{priceInfo?.price_format || "Lihat"}</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredCountries.length === 0 && !loadingCountries && (
                  <div className="px-5 py-12 text-center">
                    <Globe size={32} className="mx-auto mb-3 text-neutral-300" />
                    <p className="text-neutral-500 font-medium">Tidak ada negara ditemukan</p>
                    {searchQuery && (
                      <p className="text-sm text-neutral-400 mt-1">Coba kata kunci lain</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placeholder kalau belum pilih service */}
      {!selectedService && !loadingServices && (
        <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center">
          <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={24} className="text-neutral-400" />
          </div>
          <p className="text-neutral-900 font-semibold mb-1">Pilih Aplikasi Dulu</p>
          <p className="text-sm text-neutral-500">Klik salah satu aplikasi di atas untuk melihat daftar negara</p>
        </div>
      )}
    </div>
  );
}

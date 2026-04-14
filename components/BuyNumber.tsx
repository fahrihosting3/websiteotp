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
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-4 mb-2">
          <div 
            className="w-12 h-12 bg-black flex items-center justify-center border-4 border-black"
            style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)' }}
          >
            <ShoppingCart size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">BELI NOMOR VIRTUAL</h1>
            <p className="text-sm text-neutral-600 font-medium">Pilih aplikasi, lalu pilih negara untuk membeli nomor OTP</p>
          </div>
        </div>
      </div>

      {/* Step 1: Pilih Aplikasi */}
      <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span 
              className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-black text-white border-2 border-black"
              style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
            >
              STEP 1
            </span>
            <span className="font-bold">Pilih Aplikasi</span>
            {selectedService && (
              <span 
                className="text-xs font-bold px-3 py-1 bg-white border-2 border-black"
                style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
              >
                {selectedService.service_name}
              </span>
            )}
          </div>

          {totalSlides > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                disabled={currentSlide === 0}
                className={`w-10 h-10 flex items-center justify-center border-4 border-black transition-all ${
                  currentSlide === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-white text-black hover:bg-black hover:text-white"
                }`}
                style={{ boxShadow: currentSlide === 0 ? 'none' : '3px 3px 0px 0px rgba(0,0,0,1)' }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentSlide((p) => Math.min(totalSlides - 1, p + 1))}
                disabled={currentSlide === totalSlides - 1}
                className={`w-10 h-10 flex items-center justify-center border-4 border-black transition-all ${
                  currentSlide === totalSlides - 1
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-white text-black hover:bg-black hover:text-white"
                }`}
                style={{ boxShadow: currentSlide === totalSlides - 1 ? 'none' : '3px 3px 0px 0px rgba(0,0,0,1)' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {totalSlides > 1 && (
          <div className="flex gap-2 mb-4">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 border-2 border-black transition-all ${
                  i === currentSlide ? "w-8 bg-black" : "w-2 bg-white"
                }`}
              />
            ))}
          </div>
        )}

        {/* Services Grid */}
        <div 
          className="bg-white border-4 border-black p-4"
          style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
        >
          {loadingServices ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 size={24} className="animate-spin text-black" />
              <span className="font-bold">Memuat layanan...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleServices.map((service) => {
                const isSelected = selectedService?.service_code === service.service_code;
                return (
                  <button
                    key={service.service_code}
                    onClick={() => setSelectedService(service)}
                    className={`relative p-4 border-4 border-black transition-all flex flex-col items-center gap-2 ${
                      isSelected
                        ? "bg-black text-white translate-x-1 translate-y-1"
                        : "bg-white hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    }`}
                    style={{ 
                      boxShadow: isSelected ? '0px 0px 0px 0px rgba(0,0,0,1)' : '4px 4px 0px 0px rgba(0,0,0,1)'
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white flex items-center justify-center border-2 border-black">
                        <Check size={14} className="text-black" />
                      </div>
                    )}
                    <img
                      src={service.service_img}
                      alt={service.service_name}
                      className="w-10 h-10 object-contain"
                    />
                    <span className={`text-xs font-bold text-center leading-tight uppercase ${isSelected ? 'text-white' : 'text-black'}`}>
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
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span 
                className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-black text-white border-2 border-black"
                style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
              >
                STEP 2
              </span>
              <span className="font-bold">Pilih Negara</span>
              <Globe size={16} className="text-neutral-500" />
            </div>
            {loadingCountries && (
              <Loader2 size={18} className="animate-spin text-black" />
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Cari negara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-4 border-black font-medium focus:outline-none"
              style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
            />
          </div>

          {loadingCountries ? (
            <div 
              className="bg-white border-4 border-black p-12 text-center"
              style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
            >
              <Loader2 size={32} className="animate-spin mx-auto mb-3 text-black" />
              <span className="font-bold">Memuat negara...</span>
            </div>
          ) : (
            <div 
              className="bg-white border-4 border-black overflow-hidden"
              style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
            >
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-black text-white text-xs font-black uppercase tracking-wider">
                <span>Negara</span>
                <span>Prefix</span>
                <span>Stok</span>
                <span>Harga / Aksi</span>
              </div>

              <div className="sm:hidden grid grid-cols-2 gap-4 px-4 py-3 bg-black text-white text-xs font-black uppercase tracking-wider">
                <span>Negara</span>
                <span className="text-right">Harga</span>
              </div>

              {/* Rows */}
              <div className="divide-y-4 divide-black">
                {filteredCountries.map((country) => {
                  const priceInfo = country.pricelist[0];
                  return (
                    <div key={country.number_id} className="hover:bg-neutral-100 transition-colors">
                      {/* Mobile */}
                      <div className="sm:hidden flex items-center justify-between px-4 py-3 gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={country.img}
                            alt={country.name}
                            className="w-8 h-6 object-cover border-2 border-black flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{country.name}</p>
                            <p className="text-xs text-neutral-600 font-medium">{country.prefix} | Stok: {country.stock_total}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => goToDetail(country)}
                          className="flex items-center gap-2 px-3 py-2 bg-black text-white text-xs font-bold uppercase border-2 border-black hover:bg-white hover:text-black transition-all"
                          style={{ boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
                        >
                          <span>{priceInfo?.price_format || "Lihat"}</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>

                      {/* Desktop */}
                      <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={country.img}
                            alt={country.name}
                            className="w-10 h-7 object-cover border-2 border-black"
                          />
                          <span className="font-bold">{country.name}</span>
                        </div>
                        <span className="font-mono font-bold">{country.prefix}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 border-2 border-black ${country.stock_total > 0 ? "bg-black" : "bg-white"}`} />
                          <span className="font-bold">{country.stock_total}</span>
                        </div>
                        <button
                          onClick={() => goToDetail(country)}
                          className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold uppercase text-sm border-4 border-black hover:bg-white hover:text-black transition-all"
                          style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
                        >
                          <span>{priceInfo?.price_format || "Lihat"}</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredCountries.length === 0 && !loadingCountries && (
                  <div className="px-5 py-12 text-center">
                    <Globe size={40} className="mx-auto mb-3 text-neutral-300" />
                    <p className="font-bold text-lg">Tidak ada negara ditemukan</p>
                    {searchQuery && (
                      <p className="text-sm text-neutral-500 mt-1">Coba kata kunci lain</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Placeholder */}
      {!selectedService && !loadingServices && (
        <div 
          className="border-4 border-dashed border-black p-12 text-center animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div 
            className="w-16 h-16 bg-neutral-100 flex items-center justify-center mx-auto mb-4 border-4 border-black"
            style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
          >
            <ShoppingCart size={28} className="text-neutral-400" />
          </div>
          <p className="font-black text-xl mb-1">PILIH APLIKASI DULU</p>
          <p className="text-sm text-neutral-600 font-medium">Klik salah satu aplikasi di atas untuk melihat daftar negara</p>
        </div>
      )}
    </div>
  );
}

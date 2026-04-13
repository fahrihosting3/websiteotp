// components/BuyNumber.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, ShoppingCart, RefreshCw } from "lucide-react";

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

interface Operator {
  id: number;
  name: string;
  image: string;
}

export default function BuyNumber() {
  const [services, setServices] = useState<Service[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);

  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<number | null>(null);

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [buying, setBuying] = useState(false);

  const [message, setMessage] = useState("");

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
        setMessage("Gagal memuat daftar layanan");
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
      setSelectedCountry(null);

      try {
        const res = await axios.get(`${BASE_URL}/countries?service_id=${selectedService}`, {
          headers: { "x-apikey": API_KEY, Accept: "application/json" },
        });
        if (res.data.success) setCountries(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [selectedService]);

  // Load Operators ketika negara dipilih
  useEffect(() => {
    if (!selectedCountry) return;

    const fetchOperators = async () => {
      setLoadingOperators(true);
      setOperators([]);

      try {
        const res = await axios.get(
          `${BASE_URL}/operators?country=${selectedCountry.name}&provider_id=${selectedCountry.pricelist[0]?.provider_id || ""}`,
          {
            headers: { "x-apikey": API_KEY, Accept: "application/json" },
          }
        );
        if (res.data.success) setOperators(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOperators(false);
      }
    };

    fetchOperators();
  }, [selectedCountry]);

  const handleBuy = async () => {
    if (!selectedService || !selectedCountry || !selectedOperator) {
      setMessage("Pilih layanan, negara, dan operator terlebih dahulu!");
      return;
    }

    setBuying(true);
    setMessage("");

    try {
      // Sesuaikan parameter sesuai dokumentasi resmi RumahOTP
      const res = await axios.get(`${BASE_URL}/orders`, {
        headers: { "x-apikey": API_KEY },
        params: {
          service_id: selectedService,
          number_id: selectedCountry.number_id,
          operator_id: selectedOperator,
          provider_id: selectedCountry.pricelist[0]?.provider_id,
        },
      });

      if (res.data.success) {
        setMessage(`✅ Berhasil! Nomor: ${res.data.data.number || "Sedang diproses"}`);
      } else {
        setMessage("Gagal membeli nomor. Coba lagi.");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Terjadi kesalahan saat membeli nomor");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-8 h-8 text-violet-600" />
        <h2 className="text-3xl font-bold">Beli Nomor Virtual OTP</h2>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-2xl ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* Pilih Layanan */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Layanan</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loadingServices ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : (
            services.map((service) => (
              <button
                key={service.service_code}
                onClick={() => setSelectedService(service.service_code)}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all hover:scale-105 ${
                  selectedService === service.service_code
                    ? "border-violet-600 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img src={service.service_img} alt={service.service_name} className="w-12 h-12 object-contain" />
                <span className="font-medium text-center">{service.service_name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Pilih Negara */}
      {selectedService && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Pilih Negara</label>
            {loadingCountries && <RefreshCw className="w-5 h-5 animate-spin" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {countries.map((country) => {
              const priceInfo = country.pricelist[0];
              return (
                <button
                  key={country.number_id}
                  onClick={() => setSelectedCountry(country)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                    selectedCountry?.number_id === country.number_id
                      ? "border-violet-600 bg-violet-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img src={country.img} alt={country.name} className="w-10 h-7 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{country.name}</p>
                      <p className="text-sm text-gray-500">{country.prefix}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{priceInfo?.price_format}</p>
                      <p className="text-xs text-green-600">Stok: {country.stock_total}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pilih Operator */}
      {selectedCountry && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Operator</label>
          <div className="flex flex-wrap gap-3">
            {loadingOperators ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              operators.map((op) => (
                <button
                  key={op.id}
                  onClick={() => setSelectedOperator(op.id)}
                  className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all hover:scale-105 ${
                    selectedOperator === op.id ? "border-violet-600 bg-violet-50" : "border-gray-200"
                  }`}
                >
                  <img src={op.image} alt={op.name} className="w-6 h-6" />
                  <span className="capitalize">{op.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tombol Beli */}
      {selectedService && selectedCountry && selectedOperator && (
        <button
          onClick={handleBuy}
          disabled={buying}
          className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xl rounded-3xl hover:scale-[1.02] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
        >
          {buying ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" /> Memproses...
            </>
          ) : (
            "Beli Nomor Sekarang"
          )}
        </button>
      )}
    </div>
  );
}
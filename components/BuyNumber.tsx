// components/BuyNumber.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, ShoppingCart, RefreshCw, Terminal, CheckCircle, XCircle } from "lucide-react";

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
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

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
        setMessageType("error");
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
      setMessageType("error");
      return;
    }

    setBuying(true);
    setMessage("");
    setMessageType("");

    try {
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
        setMessage(`Berhasil! Nomor: ${res.data.data.number || "Sedang diproses"}`);
        setMessageType("success");
      } else {
        setMessage("Gagal membeli nomor. Coba lagi.");
        setMessageType("error");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Terjadi kesalahan saat membeli nomor");
      setMessageType("error");
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <ShoppingCart size={18} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Beli Nomor Virtual</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Terminal size={10} className="text-gray-400" />
              <span className="text-[10px] font-mono text-gray-400 tracking-wide">ORDER_NUMBER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${
          messageType === "success" 
            ? "bg-green-50 border border-green-100 text-green-700" 
            : "bg-red-50 border border-red-100 text-red-700"
        }`}>
          {messageType === "success" ? (
            <CheckCircle size={14} />
          ) : (
            <XCircle size={14} />
          )}
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* Pilih Layanan */}
      <div className="mb-8">
        <label className="block text-xs font-mono text-gray-500 tracking-wider mb-3">PILIH LAYANAN</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {loadingServices ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            services.map((service) => (
              <button
                key={service.service_code}
                onClick={() => setSelectedService(service.service_code)}
                className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                  selectedService === service.service_code
                    ? "border-gray-400 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <img src={service.service_img} alt={service.service_name} className="w-10 h-10 object-contain" />
                <span className="text-xs font-medium text-gray-700 text-center">{service.service_name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Pilih Negara */}
      {selectedService && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-xs font-mono text-gray-500 tracking-wider">PILIH NEGARA</label>
            {loadingCountries && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {countries.map((country) => {
              const priceInfo = country.pricelist[0];
              return (
                <button
                  key={country.number_id}
                  onClick={() => setSelectedCountry(country)}
                  className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                    selectedCountry?.number_id === country.number_id
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={country.img} alt={country.name} className="w-8 h-6 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{country.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{country.prefix}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{priceInfo?.price_format}</p>
                      <p className="text-[10px] text-gray-500">Stok: {country.stock_total}</p>
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
          <label className="block text-xs font-mono text-gray-500 tracking-wider mb-3">PILIH OPERATOR</label>
          <div className="flex flex-wrap gap-2">
            {loadingOperators ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              operators.map((op) => (
                <button
                  key={op.id}
                  onClick={() => setSelectedOperator(op.id)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-300 flex items-center gap-2 ${
                    selectedOperator === op.id
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <img src={op.image} alt={op.name} className="w-5 h-5" />
                  <span className="text-sm text-gray-700 capitalize">{op.name}</span>
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
          className="w-full py-3 bg-gray-900 text-white font-medium text-base rounded-xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {buying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
            </>
          ) : (
            "Beli Nomor Sekarang"
          )}
        </button>
      )}
    </div>
  );
}
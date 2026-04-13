// app/buy/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, ShoppingCart, Terminal, ChevronLeft, ChevronRight, Search } from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY || "";
const BASE_URL = "[rumahotp.io](https://www.rumahotp.io/api/v2)";

const ITEMS_PER_PAGE = 12;

interface Service {
  service_code: number;
  service_name: string;
  service_img: string;
}

export default function BuyPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

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
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Filter services berdasarkan search
  const filteredServices = services.filter((s) =>
    s.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page ketika search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSelectService = (serviceCode: number) => {
    router.push(`/buy/${serviceCode}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Beli Nomor Virtual</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Terminal size={10} className="text-gray-400" />
                <span className="text-[10px] font-mono text-gray-400 tracking-wide">STEP 1: PILIH LAYANAN</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari layanan... (WhatsApp, Telegram, dll)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {paginatedServices.map((service) => (
                  <button
                    key={service.service_code}
                    onClick={() => handleSelectService(service.service_code)}
                    className="group p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-300 flex flex-col items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <img
                        src={service.service_img}
                        alt={service.service_name}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center line-clamp-2">
                      {service.service_name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Empty State */}
              {paginatedServices.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <p>Layanan tidak ditemukan</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first, last, current, and neighbors
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => (
                        <div key={page} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                              currentPage === page
                                ? "bg-gray-900 text-white"
                                : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {/* Info */}
              <div className="text-center mt-4 text-xs text-gray-400">
                Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredServices.length)} dari {filteredServices.length} layanan
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

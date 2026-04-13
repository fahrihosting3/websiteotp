// components/Features.tsx
"use client";
import { Zap, Shield, Clock, Globe, Smartphone, Cpu, Terminal } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: "Instant OTP",
      desc: "Dapatkan OTP dalam hitungan detik dengan kecepatan maksimal",
    },
    {
      icon: Shield,
      title: "Aman & Terpercaya",
      desc: "Nomor baru setiap transaksi untuk keamanan maksimal",
    },
    {
      icon: Clock,
      title: "Real-time Notifications",
      desc: "Notifikasi instan langsung ke dashboard Anda",
    },
    {
      icon: Globe,
      title: "85+ Negara",
      desc: "Jangkauan global untuk semua kebutuhan verifikasi",
    },
    {
      icon: Smartphone,
      title: "API Mudah",
      desc: "Integrasi seamless dengan dokumentasi lengkap",
    },
    {
      icon: Cpu,
      title: "99.9% Uptime",
      desc: "Infrastruktur enterprise dengan reliabilitas tinggi",
    },
  ];

  return (
    <section id="fitur" className="relative overflow-hidden bg-gray-50 py-20 sm:py-28">
      {/* Retro Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>
      
      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,_#d1d5db_1px,_transparent_1px),linear-gradient(90deg,_#d1d5db_1px,_transparent_1px)] bg-[length:40px_40px] opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal size={16} className="text-gray-400" />
            <span className="text-xs font-mono text-gray-500 tracking-wide">WHY CHOOSE US</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4 tracking-tight">
            Mengapa Pilih RUMA OTP?
          </h2>
          <div className="w-12 h-px bg-gray-300 mx-auto my-4"></div>
          <p className="text-base text-gray-500 leading-relaxed max-w-xl mx-auto">
            Kami menyediakan solusi OTP terpercaya dengan teknologi terdepan untuk keamanan akun Anda
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const IconComponent = f.icon;
            return (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-200"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-5 group-hover:bg-gray-200 transition-colors duration-300">
                  <IconComponent size={20} className="text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
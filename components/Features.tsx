// components/Features.tsx
import { Zap, Shield, Clock, Globe, Smartphone, Cpu } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: "Instant OTP",
      desc: "Dapatkan OTP dalam hitungan detik dengan kecepatan maksimal",
      color: "text-[var(--color-primary)]",
    },
    {
      icon: Shield,
      title: "Aman & Terpercaya",
      desc: "Nomor baru setiap transaksi untuk keamanan maksimal",
      color: "text-[var(--color-secondary)]",
    },
    {
      icon: Clock,
      title: "Real-time Notifications",
      desc: "Notifikasi instan langsung ke dashboard Anda",
      color: "text-[var(--color-accent)]",
    },
    {
      icon: Globe,
      title: "85+ Negara",
      desc: "Jangkauan global untuk semua kebutuhan verifikasi",
      color: "text-[var(--color-info)]",
    },
    {
      icon: Smartphone,
      title: "API Mudah",
      desc: "Integrasi seamless dengan dokumentasi lengkap",
      color: "text-[var(--color-primary)]",
    },
    {
      icon: Cpu,
      title: "99.9% Uptime",
      desc: "Infrastruktur enterprise dengan reliabilitas tinggi",
      color: "text-[var(--color-secondary)]",
    },
  ];

  return (
    <section id="fitur" className="section-spacing bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-background)] to-[var(--color-surface)]">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-[var(--color-text-primary)]">
            Mengapa Pilih RUMA OTP?
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
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
                className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-8 card-shadow hover:border-[var(--color-primary)] transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow duration-300`}>
                  <IconComponent size={28} className={f.color} />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                  {f.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
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

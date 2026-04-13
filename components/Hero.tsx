"use client";
import { ArrowRight, Zap, Lock, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="section-spacing bg-gradient-to-br from-[var(--color-background)] to-[var(--color-surface)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-[var(--color-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] px-5 py-2.5 rounded-full text-sm font-medium mb-8">
            <Zap size={16} className="text-[var(--color-accent)]" />
            <span className="text-[var(--color-text-secondary)]">OTP Instant • Harga Kompetitif</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8 text-balance">
            Nomor Virtual OTP
            <br />
            <span className="text-gradient">Tercepat & Termurah</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-12 text-balance leading-relaxed">
            Akses ribuan nomor virtual untuk WhatsApp, Telegram, Instagram, TikTok, Shopee dan lebih dari 100 platform lainnya. OTP diterima dalam hitungan detik.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => router.push("/auth/register")}
              className="btn-primary flex items-center justify-center gap-3 group"
            >
              Daftar Gratis
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push("/auth/login")}
              className="btn-secondary flex items-center justify-center gap-3"
            >
              <Lock size={20} />
              Login ke Panel
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="text-[var(--color-primary)]" size={24} />
                <div className="text-3xl font-bold text-[var(--color-text-primary)]">1.2M+</div>
              </div>
              <div className="text-[var(--color-text-secondary)] text-sm font-medium">Saldo Aktif</div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="text-[var(--color-secondary)]" size={24} />
                <div className="text-3xl font-bold text-[var(--color-text-primary)]">487K</div>
              </div>
              <div className="text-[var(--color-text-secondary)] text-sm font-medium">Nomor Terjual</div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="text-[var(--color-accent)]" size={24} />
                <div className="text-3xl font-bold text-[var(--color-text-primary)]">4.9s</div>
              </div>
              <div className="text-[var(--color-text-secondary)] text-sm font-medium">Rata-rata OTP</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

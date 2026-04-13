// components/Footer.tsx
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)] border-t border-[var(--color-border)]">
      <div className="container-custom py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md">
                ✨
              </div>
              <span className="font-bold text-xl text-[var(--color-text-primary)]">RUMA OTP</span>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
              Platform nomor virtual OTP tercepat dan termurah di Indonesia dengan jangkauan 85+ negara
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Menu</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/#fitur" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  Fitur
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  Daftar
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  Masuk
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Layanan</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  Telegram
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  TikTok & Lainnya
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <a href="mailto:support@rumahotp.com" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  support@rumahotp.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <a href="tel:+6281234567890" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm">
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <span className="text-[var(--color-text-secondary)] text-sm">
                  Jakarta, Indonesia
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--color-border)] my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--color-text-secondary)]">
          <p>© 2026 RUMA OTP. Semua hak cipta dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Hubungi Kami</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

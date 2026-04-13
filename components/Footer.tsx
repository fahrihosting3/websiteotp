// components/Footer.tsx
"use client";
import Link from "next/link";
import { Mail, MapPin, Phone, Terminal, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gray-100 border-t border-gray-200 overflow-hidden">
      {/* Retro Pattern Background */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <Terminal size={16} className="text-gray-600" />
              </div>
              <span className="font-semibold text-lg text-gray-800 tracking-tight">RUMA OTP</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Platform nomor virtual OTP tercepat dan termurah di Indonesia dengan jangkauan 85+ negara
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 text-sm mb-4 tracking-wide">Menu</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/#fitur" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  Fitur
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  Daftar
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  Masuk
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-gray-800 text-sm mb-4 tracking-wide">Layanan</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  Telegram
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  TikTok & Lainnya
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-800 text-sm mb-4 tracking-wide">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@rumahotp.com" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  support@rumahotp.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <a href="tel:+6281234567890" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-500 text-sm">
                  Jakarta, Indonesia
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links - Optional */}
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
            <Github size={18} />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
            <Twitter size={18} />
          </a>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-6"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p className="font-mono tracking-wide">© 2026 RUMA OTP. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors font-mono tracking-wide">PRIVACY POLICY</a>
            <a href="#" className="hover:text-gray-600 transition-colors font-mono tracking-wide">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-gray-600 transition-colors font-mono tracking-wide">CONTACT US</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
// components/Footer.tsx
"use client";
import Link from "next/link";
import { Mail, MapPin, Phone, Terminal, Github, Twitter, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 border-t border-gray-800 overflow-hidden">
      {/* Retro Pattern Background - Dark */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content - Grid lebih rapi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <Terminal size={16} className="text-gray-400" />
              </div>
              <span className="font-semibold text-lg text-white tracking-tight">RUMA OTP</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Platform nomor virtual OTP tercepat dan termurah di Indonesia.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                <Github size={16} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors">
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-400 text-xs font-mono tracking-wider mb-4">MENU</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/#fitur" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  Fitur
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  Daftar
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  Masuk
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gray-400 text-xs font-mono tracking-wider mb-4">LAYANAN</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  Telegram
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  TikTok
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  Shopee
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-400 text-xs font-mono tracking-wider mb-4">KONTAK</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail size={12} className="text-gray-500 flex-shrink-0" />
                <a href="mailto:support@rumahotp.com" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  support@rumahotp.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-gray-500 flex-shrink-0" />
                <a href="tel:+6281234567890" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  +62 812-3456-7890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={12} className="text-gray-500 flex-shrink-0" />
                <span className="text-gray-500 text-sm">
                  Jakarta, Indonesia
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800 my-6"></div>

        {/* Bottom Footer - Rapi & Simple */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs">
            © 2026 RUMA OTP. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors text-xs">
              Privacy Policy
            </a>
            <span className="text-gray-700 text-xs">•</span>
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors text-xs">
              Terms of Service
            </a>
            <span className="text-gray-700 text-xs">•</span>
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors text-xs">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
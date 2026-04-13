// app/auth/register/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/auth";
import SuccessPopup from "@/components/SuccessPopup";
import Navbar from "@/components/Navbar";
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser(email, password, name);
      setShowSuccess(true);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2200);
    } catch (err: any) {
      setError(err.message || "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-white">
        {/* Retro Pattern Background - Elegan */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,_#e5e7eb_1px,_transparent_1px),linear-gradient(90deg,_#e5e7eb_1px,_transparent_1px)] bg-[length:40px_40px] opacity-20"></div>

        {/* Content */}
        <div className="relative z-10 max-w-md w-full">
          {/* Retro Card - Clean & Elegant */}
          <div className="transform transition-all duration-700 animate-fade-in-up">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
              
              {/* Header dengan sentuhan retro - tanpa logo */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">
                  Buat Akun Baru
                </h1>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-8 h-px bg-gray-300"></div>
                  <p className="text-gray-500 font-mono text-xs tracking-wider">
                    RETRO TERMINAL v1.0
                  </p>
                  <div className="w-8 h-px bg-gray-300"></div>
                </div>
                <p className="text-gray-400 text-sm mt-3 font-light">
                  Bergabunglah dengan ribuan pengguna
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Name Field */}
                <div className="group">
                  <label className="block text-gray-600 text-xs font-mono mb-2 tracking-wide">
                    NAMA LENGKAP
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={16} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="group">
                  <label className="block text-gray-600 text-xs font-mono mb-2 tracking-wide">
                    EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-300"
                      placeholder="hello@retro.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className="block text-gray-600 text-xs font-mono mb-2 tracking-wide">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={16} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-mono text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-300"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-2.5 bg-gray-900 text-white rounded-lg font-mono text-sm tracking-wide hover:bg-gray-800 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <span className="group-hover:translate-x-[-2px] transition-transform">→</span>
                        DAFTAR
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-mono">ATAU</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-3 font-mono">
                  SUDAH PUNYA AKUN?
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-gray-600 font-mono text-sm border border-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                >
                  MASUK KE AKUN ANDA
                </Link>
              </div>

              {/* Features - with retro style */}
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500 font-mono tracking-wide">Akses 85+ negara</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500 font-mono tracking-wide">OTP instant dalam 5 detik</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500 font-mono tracking-wide">Support 24/7 responsif</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-center text-[10px] text-gray-400 font-mono tracking-wide">
                  © 2024 RETRO TERMINAL — ALL RIGHTS RESERVED
                </p>
              </div>

              {/* Retro decorative elements - subtle */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-l border-t border-gray-200"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 border-r border-t border-gray-200"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l border-b border-gray-200"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r border-b border-gray-200"></div>
            </div>
          </div>
        </div>
      </div>

      <SuccessPopup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Akun Berhasil Dibuat!"
        message="Selamat datang di RETRO TERMINAL. Anda akan diarahkan ke dashboard..."
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}
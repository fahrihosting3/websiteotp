// app/auth/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Lock, Mail, ArrowRight, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden flex items-center justify-center py-12 px-4">
        {/* Background dengan blur iOS style */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
          {/* Animated gradient circles */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-md w-full">
          {/* Card dengan blur iOS */}
          <div 
            className={`transform transition-all duration-700 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="backdrop-blur-xl bg-white/10 dark:bg-black/30 rounded-3xl p-8 shadow-2xl border border-white/20">
              {/* Header dengan animasi */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-70 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-2xl animate-bounce-slow">
                    <Sparkles className="w-10 h-10" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Selamat Datang
                </h1>
                <p className="text-purple-100 text-lg font-medium">
                  Masuk ke akun RUMA OTP Anda
                </p>
              </div>

              {/* Error Message dengan animasi */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl animate-shake">
                  <p className="text-sm text-red-100 font-medium text-center">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-purple-100 mb-2 ml-1">
                    Email Address
                  </label>
                  <div className="relative transform transition-all duration-300 group-focus-within:scale-[1.02]">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-white transition-colors duration-300" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-purple-300/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-purple-100 mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative transform transition-all duration-300 group-focus-within:scale-[1.02]">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-white transition-colors duration-300" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-purple-300/30 rounded-xl text-white placeholder-purple-300/70 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-purple-200 hover:text-white transition-colors duration-300"
                  >
                    Lupa password?
                  </Link>
                </div>

                {/* Submit Button dengan animasi */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Masuk Sekarang
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider dengan teks */}
              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                <span className="text-sm text-purple-200 font-medium">atau</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
              </div>

              {/* Register Button */}
              <div className="text-center">
                <p className="text-sm text-purple-200 mb-4">
                  Belum punya akun?
                </p>
                <Link
                  href="/auth/register"
                  className="block w-full py-3.5 bg-white/10 backdrop-blur-sm border border-purple-300/30 rounded-xl text-purple-100 font-semibold hover:bg-white/20 transform hover:scale-[1.02] transition-all duration-300"
                >
                  Buat Akun Baru
                </Link>
              </div>

              {/* Footer */}
              <p className="text-center text-xs text-purple-300/80 mt-6">
                Dengan masuk, Anda setuju dengan <Link href="/terms" className="underline hover:text-white transition-colors">Syarat & Ketentuan</Link> kami
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS untuk animasi tambahan */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out 0s 2;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}
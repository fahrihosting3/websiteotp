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
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[var(--color-background)] to-[var(--color-surface)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {/* Card */}
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-3xl p-8 card-shadow">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-6 shadow-lg">
                ✨
              </div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                Buat Akun Baru
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                Bergabunglah dengan ribuan pengguna RUMA OTP
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-[var(--color-error)] font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-field pl-12"
                    placeholder="Masukkan nama Anda"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-12"
                    placeholder="Masukkan email Anda"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pl-12"
                    placeholder="Buat password yang kuat"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Membuat Akun...
                  </>
                ) : (
                  <>
                    Daftar Sekarang
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-[var(--color-border)]"></div>
              <span className="text-sm text-[var(--color-text-tertiary)]">atau</span>
              <div className="flex-1 h-px bg-[var(--color-border)]"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Sudah punya akun?
              </p>
              <Link
                href="/auth/login"
                className="btn-secondary w-full"
              >
                Masuk ke Akun Anda
              </Link>
            </div>

            {/* Features */}
            <div className="mt-8 pt-8 border-t border-[var(--color-border)] space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[var(--color-secondary)] flex-shrink-0" />
                <span className="text-sm text-[var(--color-text-secondary)]">Akses 85+ negara</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[var(--color-secondary)] flex-shrink-0" />
                <span className="text-sm text-[var(--color-text-secondary)]">OTP instant dalam 5 detik</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-[var(--color-secondary)] flex-shrink-0" />
                <span className="text-sm text-[var(--color-text-secondary)]">Support 24/7 responsif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessPopup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Akun Berhasil Dibuat!"
        message="Selamat datang di RUMA OTP. Anda akan diarahkan ke dashboard..."
      />
    </>
  );
}

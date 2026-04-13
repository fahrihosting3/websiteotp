// app/auth/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
                Masuk ke Panel
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                Selamat datang kembali ke RUMA OTP
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-[var(--color-error)] font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
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
                    placeholder="Masukkan password Anda"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sedang masuk...
                  </>
                ) : (
                  <>
                    Masuk
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

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Belum punya akun?
              </p>
              <Link
                href="/auth/register"
                className="btn-secondary w-full"
              >
                Buat Akun Baru
              </Link>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-[var(--color-text-tertiary)] mt-6">
              Dengan masuk, Anda setuju dengan Syarat & Ketentuan kami
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

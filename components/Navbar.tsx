// components/Navbar.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--color-background)] border-b border-[var(--color-border)] backdrop-blur-sm">
      <div className="container-custom">
        <div className="flex justify-between items-center py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow duration-200">
              ✨
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--color-text-primary)] hidden sm:inline">
              RUMA OTP
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[var(--color-text-secondary)] font-medium hover:text-[var(--color-primary)] transition-colors duration-200">
              Beranda
            </Link>
            <Link href="/#fitur" className="text-[var(--color-text-secondary)] font-medium hover:text-[var(--color-primary)] transition-colors duration-200">
              Fitur
            </Link>

            {user ? (
              <>
                <Link href="/dashboard" className="text-[var(--color-text-secondary)] font-medium hover:text-[var(--color-primary)] transition-colors duration-200">
                  Dashboard
                </Link>
                <div className="flex items-center gap-4 border-l border-[var(--color-border)] pl-8">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    Halo, <strong className="text-[var(--color-text-primary)]">{user.name}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-[var(--color-error)] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 font-medium"
                  >
                    <LogOut size={18} />
                    Keluar
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="px-6 py-2.5 text-[var(--color-primary)] font-medium border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-surface)] transition-colors duration-200"
                >
                  Masuk
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="btn-primary"
                >
                  Daftar Gratis
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors duration-200"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-[var(--color-text-primary)]" />
            ) : (
              <Menu size={24} className="text-[var(--color-text-primary)]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] py-4 space-y-4">
            <Link
              href="/"
              className="block text-[var(--color-text-secondary)] font-medium hover:text-[var(--color-primary)] transition-colors duration-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link
              href="/#fitur"
              className="block text-[var(--color-text-secondary)] font-medium hover:text-[var(--color-primary)] transition-colors duration-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fitur
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-[var(--color-text-secondary)] font-medium hover:text-[var(--color-primary)] transition-colors duration-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
                  <span className="block text-sm text-[var(--color-text-secondary)]">
                    Halo, <strong className="text-[var(--color-text-primary)]">{user.name}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[var(--color-error)] bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors duration-200 font-medium"
                  >
                    <LogOut size={18} />
                    Keluar
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                <button
                  onClick={() => {
                    router.push("/auth/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 text-[var(--color-primary)] font-medium border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-surface)] transition-colors duration-200"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    router.push("/auth/register");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 bg-gradient-primary text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Daftar Gratis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// components/Navbar.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { LogOut, Menu, X, Terminal } from "lucide-react";

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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo - Clean & Simple */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
              <Terminal size={16} className="text-gray-600" />
            </div>
            <span className="font-semibold text-lg text-gray-800 tracking-tight hidden sm:inline">
              RUMA OTP
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200"
            >
              Beranda
            </Link>
            <Link 
              href="/#fitur" 
              className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200"
            >
              Fitur
            </Link>

            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <span className="text-sm text-gray-600">
                    Halo, <span className="font-semibold text-gray-800">{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    <LogOut size={14} />
                    Keluar
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="px-4 py-1.5 text-gray-700 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  Masuk
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-gray-600" />
            ) : (
              <Menu size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link
              href="/#fitur"
              className="block text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fitur
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors duration-200 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <span className="block text-sm text-gray-600">
                    Halo, <span className="font-semibold text-gray-800">{user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <LogOut size={14} />
                    Keluar
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    router.push("/auth/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-gray-700 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    router.push("/auth/register");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
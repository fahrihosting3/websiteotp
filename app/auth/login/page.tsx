// app/auth/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Lock, Mail, ArrowRight, Loader2, Gamepad2, Volume2, VolumeX } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(true);
  const [glitch, setGlitch] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Glitch effect random
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "LOGIN FAILED! CHECK YOUR CREDENTIALS!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden flex items-center justify-center py-12 px-4 bg-black">
        {/* Retro Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,_transparent_95%,_rgba(0,255,255,0.1)_95%),_linear-gradient(90deg,transparent_0%,_transparent_95%,_rgba(0,255,255,0.1)_95%)] bg-[length:30px_30px]"></div>
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,_rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] animate-scan"></div>
        
        {/* VHS Glitch Effect */}
        <div className={`absolute inset-0 pointer-events-none ${glitch ? 'opacity-30' : 'opacity-0'} transition-opacity duration-100`}>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,_cyan_50%,_transparent_100%)] animate-glitch-1"></div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,_magenta_50%,_transparent_100%)] animate-glitch-2"></div>
        </div>

        {/* Neon Lights */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500 rounded-full filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500 rounded-full filter blur-[100px] opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500 rounded-full filter blur-[120px] opacity-10"></div>

        {/* Content */}
        <div className="relative z-10 max-w-md w-full">
          {/* Retro Card */}
          <div className="relative transform transition-all duration-500 hover:scale-[1.02]">
            {/* CRT Border Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            
            {/* Card Content */}
            <div className="relative bg-black/90 border-2 border-cyan-500 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
              
              {/* Header Retro */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl animate-ping opacity-30"></div>
                  <div className="relative w-24 h-24 bg-black border-2 border-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_cyan]">
                    <Gamepad2 className="w-12 h-12 text-cyan-500" />
                  </div>
                </div>
                
                <h1 className={`text-5xl font-bold mb-3 font-mono ${glitch ? 'animate-glitch-text' : ''}`}>
                  <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    LOGIN
                  </span>
                </h1>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-cyan-500 animate-pulse">▶</span>
                  <p className="text-cyan-400 font-mono text-sm tracking-wider">
                    ACCESS TERMINAL v2.0
                  </p>
                  <span className="text-pink-500 animate-pulse">◀</span>
                </div>
                <div className="mt-3 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              </div>

              {/* Error Message Retro Style */}
              {error && (
                <div className="mb-6 p-3 bg-red-950/80 border-l-4 border-red-500 rounded animate-shake">
                  <p className="text-red-400 font-mono text-xs tracking-wider">
                    ⚠ {error} ⚠
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div className="group">
                  <label className="block text-cyan-400 font-mono text-xs mb-2 tracking-wider">
                    USER_IDENTIFICATION
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 bg-black border-2 border-cyan-500/50 rounded text-cyan-400 font-mono text-sm placeholder-cyan-700 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_cyan] transition-all duration-300"
                      placeholder="neon@cyberspace.com"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className="block text-pink-400 font-mono text-xs mb-2 tracking-wider">
                    ACCESS_KEY
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" size={16} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-3 bg-black border-2 border-pink-500/50 rounded text-pink-400 font-mono text-sm placeholder-pink-700 focus:outline-none focus:border-pink-400 focus:shadow-[0_0_10px_pink] transition-all duration-300"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3.5 bg-black border-2 border-cyan-500 rounded font-mono font-bold text-cyan-500 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_cyan] transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                >
                  <span className="relative flex items-center justify-center gap-2 text-sm tracking-wider">
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <span className="group-hover:translate-x-[-4px] transition-transform">▶</span>
                        INITIATE LOGIN
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                <span className="text-xs text-cyan-500 font-mono">[ OR ]</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-cyan-500/70 font-mono text-xs mb-4 tracking-wider">
                  NO ACCOUNT FOUND?
                </p>
                <Link
                  href="/auth/register"
                  className="block w-full py-3 bg-black border border-pink-500/50 rounded text-pink-500 font-mono text-sm hover:border-pink-500 hover:shadow-[0_0_15px_pink] transform hover:scale-[1.02] transition-all duration-300"
                >
                  ✦ CREATE NEW ACCOUNT ✦
                </Link>
              </div>

              {/* Footer dengan efek typing */}
              <div className="mt-6 pt-4 border-t border-cyan-500/30">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span className="text-cyan-500 font-mono text-[10px] tracking-wider">
                      SYSTEM ONLINE
                    </span>
                  </div>
                  <button
                    onClick={() => setMuted(!muted)}
                    className="text-cyan-500 hover:text-pink-500 transition-colors"
                  >
                    {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
                <p className="text-center text-[10px] text-cyan-700 font-mono mt-3 tracking-wider">
                  BY ACCESSING TERMINAL YOU AGREE TO THE PROTOCOL
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-cyan-500"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 border-r-2 border-t-2 border-pink-500"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 border-l-2 border-b-2 border-pink-500"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-cyan-500"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes glitch-1 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); opacity: 0.3; }
          20%, 40%, 60%, 80% { transform: translateX(5px); opacity: 0.3; }
        }
        
        @keyframes glitch-2 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          10%, 30%, 50%, 70%, 90% { transform: translateX(5px); opacity: 0.3; }
          20%, 40%, 60%, 80% { transform: translateX(-5px); opacity: 0.3; }
        }
        
        @keyframes glitch-text {
          0%, 100% { transform: skew(0deg); opacity: 1; }
          20% { transform: skew(2deg); opacity: 0.8; text-shadow: -2px 0 cyan; }
          40% { transform: skew(-2deg); opacity: 0.9; text-shadow: 2px 0 magenta; }
          60% { transform: skew(1deg); opacity: 0.85; }
          80% { transform: skew(-1deg); opacity: 0.95; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-scan {
          animation: scan 8s linear infinite;
        }
        
        .animate-glitch-1 {
          animation: glitch-1 0.3s linear infinite;
        }
        
        .animate-glitch-2 {
          animation: glitch-2 0.3s linear infinite;
        }
        
        .animate-glitch-text {
          animation: glitch-text 0.2s linear;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Save, RefreshCw, CheckCircle2, AlertCircle, Globe, Server, Shield, Terminal } from "lucide-react";
import { toast } from "sonner";

interface APISettings {
  apiKey: string;
  baseUrl: string;
  webhookUrl: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  
  const [settings, setSettings] = useState<APISettings>({
    apiKey: "",
    baseUrl: "https://www.rumahotp.io/api/v1",
    webhookUrl: "",
    isActive: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setLoading(true);
    // Load from localStorage (in production, this would be from database)
    const saved = localStorage.getItem("rumahotp-settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    } else {
      // Try to get from env
      setSettings(prev => ({
        ...prev,
        apiKey: process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY || "",
      }));
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, save to database via API)
      localStorage.setItem("rumahotp-settings", JSON.stringify(settings));
      toast.success("Settings berhasil disimpan!");
    } catch (error) {
      toast.error("Gagal menyimpan settings");
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!settings.apiKey) {
      toast.error("API Key tidak boleh kosong");
      return;
    }

    setTestingConnection(true);
    setConnectionStatus("idle");
    
    try {
      const res = await fetch(`${settings.baseUrl}/user/balance`, {
        headers: {
          "x-apikey": settings.apiKey,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      
      if (data.success) {
        setConnectionStatus("success");
        toast.success(`Koneksi berhasil! Saldo: ${data.data?.formated || "N/A"}`);
      } else {
        setConnectionStatus("error");
        toast.error(data.message || "Gagal terhubung ke API");
      }
    } catch (error) {
      setConnectionStatus("error");
      toast.error("Gagal terhubung ke server RumahOTP");
    } finally {
      setTestingConnection(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin text-[rgb(var(--primary))]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Terminal size={14} className="text-[rgb(var(--muted-foreground))]" />
          <span className="text-[10px] font-mono text-[rgb(var(--muted-foreground))] tracking-wider">SETTINGS</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[rgb(var(--primary))] rounded-full"></div>
          <h1 className="text-3xl font-black text-[rgb(var(--foreground))] tracking-tight">
            Settings API
          </h1>
        </div>
        <p className="text-[rgb(var(--muted-foreground))] mt-2 ml-4">
          Konfigurasi koneksi ke RumahOTP API
        </p>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* API Status Card */}
        <div 
          className="bg-[rgb(var(--card))] border-4 border-[rgb(var(--foreground))] p-6 shadow-[6px_6px_0_rgb(var(--foreground)/0.1)] animate-slide-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] border-3 border-[rgb(var(--foreground))] flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-black text-lg text-[rgb(var(--foreground))]">RumahOTP API</h2>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Status koneksi API</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 border-3 border-[rgb(var(--foreground))] font-bold text-sm ${
              settings.isActive 
                ? "bg-[rgb(var(--success)/0.2)] text-[rgb(var(--success))]" 
                : "bg-[rgb(var(--destructive)/0.2)] text-[rgb(var(--destructive))]"
            }`}>
              <div className={`w-2 h-2 rounded-full ${settings.isActive ? "bg-[rgb(var(--success))] animate-pulse" : "bg-[rgb(var(--destructive))]"}`}></div>
              {settings.isActive ? "AKTIF" : "NONAKTIF"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div 
                onClick={() => setSettings(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`w-14 h-8 border-3 border-[rgb(var(--foreground))] transition-all duration-200 relative ${
                  settings.isActive ? "bg-[rgb(var(--success))]" : "bg-[rgb(var(--muted))]"
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white border-2 border-[rgb(var(--foreground))] transition-all duration-200 ${
                  settings.isActive ? "left-7" : "left-1"
                }`}></div>
              </div>
              <span className="font-bold text-[rgb(var(--foreground))]">
                {settings.isActive ? "API Aktif" : "API Nonaktif"}
              </span>
            </label>
          </div>
        </div>

        {/* API Key */}
        <div 
          className="bg-[rgb(var(--card))] border-4 border-[rgb(var(--foreground))] p-6 shadow-[6px_6px_0_rgb(var(--foreground)/0.1)] animate-slide-in"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[rgb(var(--primary))] border-3 border-[rgb(var(--foreground))] flex items-center justify-center">
              <Key size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-[rgb(var(--foreground))]">API Key</h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Kunci autentikasi RumahOTP</p>
            </div>
          </div>
          
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Masukkan API Key..."
              className="w-full px-4 py-3 pr-12 bg-[rgb(var(--muted))] border-3 border-[rgb(var(--foreground))] text-[rgb(var(--foreground))] font-mono text-sm placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:shadow-[4px_4px_0_rgb(var(--foreground)/0.15)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
            Dapatkan API Key dari dashboard RumahOTP.io
          </p>
        </div>

        {/* Base URL */}
        <div 
          className="bg-[rgb(var(--card))] border-4 border-[rgb(var(--foreground))] p-6 shadow-[6px_6px_0_rgb(var(--foreground)/0.1)] animate-slide-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[rgb(var(--secondary))] border-3 border-[rgb(var(--foreground))] flex items-center justify-center">
              <Server size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-[rgb(var(--foreground))]">Base URL</h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Endpoint API RumahOTP</p>
            </div>
          </div>
          
          <input
            type="url"
            value={settings.baseUrl}
            onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="https://www.rumahotp.io/api/v1"
            className="w-full px-4 py-3 bg-[rgb(var(--muted))] border-3 border-[rgb(var(--foreground))] text-[rgb(var(--foreground))] font-mono text-sm placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:shadow-[4px_4px_0_rgb(var(--foreground)/0.15)] transition-all"
          />
        </div>

        {/* Webhook URL */}
        <div 
          className="bg-[rgb(var(--card))] border-4 border-[rgb(var(--foreground))] p-6 shadow-[6px_6px_0_rgb(var(--foreground)/0.1)] animate-slide-in"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[rgb(var(--accent))] border-3 border-[rgb(var(--foreground))] flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-[rgb(var(--foreground))]">Webhook URL</h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">URL untuk menerima notifikasi (opsional)</p>
            </div>
          </div>
          
          <input
            type="url"
            value={settings.webhookUrl}
            onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
            placeholder="https://yoursite.com/api/webhook"
            className="w-full px-4 py-3 bg-[rgb(var(--muted))] border-3 border-[rgb(var(--foreground))] text-[rgb(var(--foreground))] font-mono text-sm placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:shadow-[4px_4px_0_rgb(var(--foreground)/0.15)] transition-all"
          />
        </div>

        {/* Actions */}
        <div 
          className="flex flex-col sm:flex-row gap-4 animate-slide-in"
          style={{ animationDelay: "0.3s" }}
        >
          <button
            onClick={testConnection}
            disabled={testingConnection || !settings.apiKey}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[rgb(var(--card))] border-4 border-[rgb(var(--foreground))] text-[rgb(var(--foreground))] font-black text-sm shadow-[5px_5px_0_rgb(var(--foreground)/0.15)] hover:shadow-[6px_6px_0_rgb(var(--foreground)/0.2)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[5px_5px_0_rgb(var(--foreground)/0.15)]"
          >
            {testingConnection ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : connectionStatus === "success" ? (
              <CheckCircle2 size={18} className="text-[rgb(var(--success))]" />
            ) : connectionStatus === "error" ? (
              <AlertCircle size={18} className="text-[rgb(var(--destructive))]" />
            ) : (
              <Globe size={18} />
            )}
            TEST KONEKSI
          </button>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[rgb(var(--primary))] border-4 border-[rgb(var(--foreground))] text-white font-black text-sm shadow-[5px_5px_0_rgb(var(--foreground)/0.15)] hover:shadow-[6px_6px_0_rgb(var(--foreground)/0.2)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            SIMPAN SETTINGS
          </button>
        </div>

        {/* Info Card */}
        <div 
          className="bg-[rgb(var(--info)/0.1)] border-4 border-[rgb(var(--info))] p-4 animate-slide-in"
          style={{ animationDelay: "0.35s" }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-[rgb(var(--info))] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[rgb(var(--info))] text-sm">Informasi</p>
              <p className="text-sm text-[rgb(var(--foreground))] mt-1">
                Pastikan API Key yang dimasukkan valid dan akun RumahOTP dalam keadaan aktif. 
                Settings ini akan digunakan untuk semua transaksi OTP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Save, RefreshCw, CheckCircle2, AlertCircle, Globe, Server, Shield } from "lucide-react";
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
    const saved = localStorage.getItem("rumahotp-settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    } else {
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
        <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <RefreshCw className="animate-spin text-black" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <p className="text-neutral-500 text-xs font-mono tracking-[0.2em] mb-2">// SETTINGS</p>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">API Config</h1>
        <p className="text-neutral-400 text-sm mt-2 font-mono">Konfigurasi koneksi ke RumahOTP API</p>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        {/* API Status Card */}
        <div className="bg-black border-4 border-white p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white flex items-center justify-center border-2 border-black">
                <Shield size={28} className="text-black" />
              </div>
              <div>
                <h2 className="font-black text-white text-xl uppercase">RumahOTP API</h2>
                <p className="text-xs text-neutral-500 font-mono">Status koneksi API</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase ${
              settings.isActive 
                ? "bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                : "bg-neutral-800 text-white border-2 border-neutral-600"
            }`}>
              <div className={`w-2 h-2 ${settings.isActive ? "bg-black" : "bg-neutral-500"}`}></div>
              {settings.isActive ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>

          <label className="flex items-center gap-4 cursor-pointer">
            <div 
              onClick={() => setSettings(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`w-14 h-8 border-4 transition-all relative ${
                settings.isActive 
                  ? "bg-white border-black" 
                  : "bg-neutral-800 border-neutral-600"
              }`}
            >
              <div className={`absolute top-0 w-6 h-6 transition-all ${
                settings.isActive ? "left-6 bg-black" : "left-0 bg-white"
              }`}></div>
            </div>
            <span className="text-sm text-white font-bold uppercase">
              {settings.isActive ? "API Aktif" : "API Nonaktif"}
            </span>
          </label>
        </div>

        {/* API Key */}
        <div className="bg-black border-4 border-white p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-neutral-900 border-2 border-white flex items-center justify-center">
              <Key size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase">API Key</h3>
              <p className="text-xs text-neutral-500 font-mono">Kunci autentikasi RumahOTP</p>
            </div>
          </div>
          
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Masukkan API Key..."
              className="w-full px-4 py-3 pr-12 bg-neutral-900 border-4 border-white text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-neutral-400 transition-colors"
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-neutral-500 font-mono mt-3">
            Dapatkan API Key dari dashboard RumahOTP.io
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-black border-4 border-white p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-neutral-900 border-2 border-white flex items-center justify-center">
              <Server size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase">Base URL</h3>
              <p className="text-xs text-neutral-500 font-mono">Endpoint API RumahOTP</p>
            </div>
          </div>
          
          <input
            type="url"
            value={settings.baseUrl}
            onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="https://www.rumahotp.io/api/v1"
            className="w-full px-4 py-3 bg-neutral-900 border-4 border-white text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
          />
        </div>

        {/* Webhook URL */}
        <div className="bg-black border-4 border-white p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-neutral-900 border-2 border-white flex items-center justify-center">
              <Globe size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-white uppercase">Webhook URL</h3>
              <p className="text-xs text-neutral-500 font-mono">URL untuk notifikasi (opsional)</p>
            </div>
          </div>
          
          <input
            type="url"
            value={settings.webhookUrl}
            onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
            placeholder="https://yoursite.com/api/webhook"
            className="w-full px-4 py-3 bg-neutral-900 border-4 border-white text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={testConnection}
            disabled={testingConnection || !settings.apiKey}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-black text-white font-black uppercase text-sm border-4 border-white hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingConnection ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : connectionStatus === "success" ? (
              <CheckCircle2 size={18} />
            ) : connectionStatus === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <Globe size={18} />
            )}
            Test Koneksi
          </button>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-black uppercase text-sm border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Simpan
          </button>
        </div>

        {/* Info */}
        <div className="bg-neutral-900 border-4 border-neutral-700 p-5">
          <div className="flex items-start gap-4">
            <AlertCircle size={20} className="text-neutral-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-white uppercase text-sm">Informasi</p>
              <p className="text-sm text-neutral-500 mt-2 font-mono leading-relaxed">
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

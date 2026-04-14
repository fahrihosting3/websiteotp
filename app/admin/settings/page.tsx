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
        <RefreshCw className="animate-spin text-neutral-400" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-neutral-500 text-xs font-mono mb-1">SETTINGS</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings API</h1>
        <p className="text-neutral-400 text-sm mt-1">Konfigurasi koneksi ke RumahOTP API</p>
      </div>

      {/* Settings Form */}
      <div className="space-y-5">
        {/* API Status Card */}
        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white flex items-center justify-center">
                <Shield size={18} className="text-neutral-950" />
              </div>
              <div>
                <h2 className="font-bold text-white">RumahOTP API</h2>
                <p className="text-xs text-neutral-500">Status koneksi API</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium ${
              settings.isActive 
                ? "bg-emerald-950 border border-emerald-800 text-emerald-400" 
                : "bg-red-950 border border-red-800 text-red-400"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${settings.isActive ? "bg-emerald-400" : "bg-red-400"}`}></div>
              {settings.isActive ? "AKTIF" : "NONAKTIF"}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div 
              onClick={() => setSettings(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`w-11 h-6 border transition-all relative ${
                settings.isActive 
                  ? "bg-emerald-600 border-emerald-500" 
                  : "bg-neutral-700 border-neutral-600"
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white transition-all ${
                settings.isActive ? "left-5" : "left-0.5"
              }`}></div>
            </div>
            <span className="text-sm text-neutral-300">
              {settings.isActive ? "API Aktif" : "API Nonaktif"}
            </span>
          </label>
        </div>

        {/* API Key */}
        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-neutral-800 flex items-center justify-center">
              <Key size={16} className="text-neutral-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">API Key</h3>
              <p className="text-xs text-neutral-500">Kunci autentikasi RumahOTP</p>
            </div>
          </div>
          
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Masukkan API Key..."
              className="w-full px-4 py-2.5 pr-11 bg-neutral-800 border border-neutral-700 text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Dapatkan API Key dari dashboard RumahOTP.io
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-neutral-800 flex items-center justify-center">
              <Server size={16} className="text-neutral-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Base URL</h3>
              <p className="text-xs text-neutral-500">Endpoint API RumahOTP</p>
            </div>
          </div>
          
          <input
            type="url"
            value={settings.baseUrl}
            onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="https://www.rumahotp.io/api/v1"
            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        {/* Webhook URL */}
        <div className="bg-neutral-900 border border-neutral-800 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-neutral-800 flex items-center justify-center">
              <Globe size={16} className="text-neutral-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Webhook URL</h3>
              <p className="text-xs text-neutral-500">URL untuk menerima notifikasi (opsional)</p>
            </div>
          </div>
          
          <input
            type="url"
            value={settings.webhookUrl}
            onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
            placeholder="https://yoursite.com/api/webhook"
            className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 text-white font-mono text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={testConnection}
            disabled={testingConnection || !settings.apiKey}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingConnection ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : connectionStatus === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : connectionStatus === "error" ? (
              <AlertCircle size={16} className="text-red-400" />
            ) : (
              <Globe size={16} />
            )}
            Test Koneksi
          </button>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white text-neutral-950 hover:bg-neutral-200 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Simpan Settings
          </button>
        </div>

        {/* Info */}
        <div className="bg-neutral-900 border border-neutral-700 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neutral-300 text-sm">Informasi</p>
              <p className="text-sm text-neutral-500 mt-1">
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

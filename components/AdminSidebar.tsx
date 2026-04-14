"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  Receipt,
  Clock,
  LogOut,
  RefreshCw,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  activeTab: "overview" | "users" | "transactions" | "pending";
  onTabChange: (tab: "overview" | "users" | "transactions" | "pending") => void;
  onRefresh: () => void;
  onLogout: () => void;
  refreshing: boolean;
  stats: {
    totalUsers: number;
    totalTransactions: number;
    pendingTransactions: number;
  };
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  onRefresh,
  onLogout,
  refreshing,
  stats,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "users" as const,
      label: "Users",
      icon: Users,
      badge: stats.totalUsers,
    },
    {
      id: "transactions" as const,
      label: "Semua TRX",
      icon: Receipt,
      badge: stats.totalTransactions,
    },
    {
      id: "pending" as const,
      label: "Pending",
      icon: Clock,
      badge: stats.pendingTransactions,
      highlight: stats.pendingTransactions > 0,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-slate-900 border-r-4 border-slate-700 z-40 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b-4 border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 border-2 border-slate-600 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-white font-black text-sm tracking-tight">ADMIN</p>
                <p className="text-slate-400 text-[10px] font-mono tracking-wider">PANEL</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 font-bold text-sm transition-all ${
                activeTab === item.id
                  ? "bg-white text-slate-900 shadow-[4px_4px_0px_#475569]"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`px-2 py-0.5 text-xs font-bold ${
                        item.highlight
                          ? "bg-amber-400 text-slate-900"
                          : activeTab === item.id
                          ? "bg-slate-200 text-slate-800"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge !== null && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="p-3 border-t-4 border-slate-700 space-y-2">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={`w-full flex items-center gap-3 px-3 py-3 text-slate-300 hover:bg-slate-800 hover:text-white font-bold text-sm transition-all ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Refresh" : undefined}
          >
            <RefreshCw size={18} className={`shrink-0 ${refreshing ? "animate-spin" : ""}`} />
            {!collapsed && <span>Refresh Data</span>}
          </button>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 font-bold text-sm transition-all ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Keluar" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-slate-700 border-2 border-slate-600 flex items-center justify-center hover:bg-slate-600 transition-colors"
        >
          {collapsed ? (
            <ChevronRight size={14} className="text-white" />
          ) : (
            <ChevronLeft size={14} className="text-white" />
          )}
        </button>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t-4 border-slate-700 z-40 px-2 py-2">
        <div className="flex items-center justify-around">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 font-bold text-xs transition-all ${
                activeTab === item.id
                  ? "text-white"
                  : "text-slate-400"
              }`}
            >
              <div className="relative">
                <item.icon size={20} />
                {item.badge !== null && item.badge > 0 && item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-rose-500"></div>
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

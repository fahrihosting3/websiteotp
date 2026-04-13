// components/SuccessPopup.tsx
"use client";
import { CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function SuccessPopup({ isOpen, onClose, title = "Berhasil!", message = "Akun Anda telah dibuat" }: SuccessPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => onClose(), 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/40 backdrop-blur-sm">
      <div className="bg-[var(--color-background)] rounded-3xl shadow-2xl p-10 max-w-sm w-full mx-4 text-center animate-in fade-in zoom-in duration-300 border border-[var(--color-border)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors duration-200"
        >
          <X size={20} className="text-[var(--color-text-secondary)]" />
        </button>

        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[var(--color-success)]/20 to-[var(--color-success)]/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-[var(--color-success)]" />
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">{title}</h3>
        <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">{message}</p>

        {/* Button */}
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

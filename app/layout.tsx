import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "RUMA OTP - Nomor Virtual OTP Tercepat & Termurah",
  description: "Dapatkan nomor virtual OTP untuk WhatsApp, Telegram, Instagram, TikTok, Shopee dan 85+ platform lainnya. OTP diterima dalam hitungan detik dengan harga paling kompetitif.",
  keywords: "OTP, nomor virtual, WhatsApp, Telegram, Instagram, verifikasi SMS",
  authors: [{ name: "RUMA OTP" }],
  openGraph: {
    title: "RUMA OTP - Nomor Virtual OTP Tercepat & Termurah",
    description: "Platform nomor virtual OTP dengan teknologi terdepan dan harga kompetitif",
    type: "website",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} bg-[rgb(var(--background))]`}>
      <body className="font-sans bg-[rgb(var(--background))] text-[rgb(var(--foreground))] transition-colors duration-300">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

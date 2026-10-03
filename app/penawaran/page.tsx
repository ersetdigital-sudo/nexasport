import type { Metadata } from "next";
import Landing from "@/components/penawaran/Landing";
import { PENAWARAN } from "@/lib/penawaran-config";

/**
 * Landing penjualan /penawaran — publik, terpisah dari app admin.
 * Halaman "/" yang asli (beranda customer) TIDAK disentuh.
 */
export const metadata: Metadata = {
  title: "Nexa Sport - Sistem Tracking Produksi dan Kalkulator HPP Jersey Custom",
  description:
    "Hitung HPP otomatis, pantau 11 tahap produksi, dan dapat pengingat deadline lewat WhatsApp. Bayar sekali, tanpa langganan bulanan. Coba demo gratis.",
  keywords: [
    "tracking produksi jersey",
    "kalkulator HPP konveksi",
    "aplikasi konveksi",
    "manajemen produksi jersey custom",
    "software konveksi Indonesia",
  ],
  alternates: { canonical: "/penawaran" },
  openGraph: {
    title: "Nexa Sport - Sistem Tracking Produksi dan Kalkulator HPP Jersey Custom",
    description:
      "Hitung HPP otomatis, pantau 11 tahap produksi, dan dapat pengingat deadline lewat WhatsApp. Bayar sekali, tanpa langganan bulanan. Coba demo gratis.",
    type: "website",
    locale: "id_ID",
  },
};

export default function PenawaranPage() {
  // Font Plus Jakarta Sans dimuat khusus untuk landing (link runtime, tanpa
  // menyentuh layout global app asli).
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      />
      <Landing />
    </>
  );
}

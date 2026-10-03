/**
 * Konfigurasi landing penjualan (/penawaran).
 * Semua nilai yang sering berubah cukup diedit di file ini — teks
 * "dipakai di TNT Sport", nomor WhatsApp, dan daftar paket harga.
 */
export const PENAWARAN = {
  /** Selling point utama — gampang diganti kapan saja. */
  tntSport: "Dipakai untuk tracking produksi TNT Sport",
  brand: "NEXA SPORT",
  tagline: "Tracking produksi jersey custom, dari order sampai kirim.",
  wa: {
    /** Nomor WhatsApp penjualan — format internasional tanpa "+" dan tanpa spasi. */
    nomor: "6281234567890",
    pesanAwal:
      "Halo Nexa Sport, saya tertarik dengan aplikasi tracking produksi & kalkulator HPP. Boleh minta info lebih lanjut?",
    pesanDemo: "Halo Nexa Sport, saya sudah coba demo-nya. Mau tanya soal penawaran.",
  },
  /** Harga placeholder — tinggal edit di sini. */
  paket: [
    {
      nama: "Starter",
      harga: "Rp499rb",
      periode: "/bulan",
      desc: "Untuk konveksi kecil yang baru mulai ingin rapi.",
      fitur: [
        "Tracking pesanan & 11 tahap produksi",
        "Kalkulator HPP otomatis",
        "1 admin",
        "Support via WhatsApp",
      ],
      highlight: false,
    },
    {
      nama: "Pro",
      harga: "Rp899rb",
      periode: "/bulan",
      desc: "Buat tim produksi yang mulai rame orderannya.",
      fitur: [
        "Semua fitur Starter",
        "Maklon, Jadwal Produksi, Pengiriman",
        "Notifikasi deadline via WhatsApp",
        "Multi user (hingga 5 orang)",
        "Laporan omzet & profit",
      ],
      highlight: true,
    },
    {
      nama: "Custom",
      harga: "Nego",
      periode: "",
      desc: "Kebutuhan khusus atau skala besar.",
      fitur: [
        "Semua fitur Pro",
        "Jumlah user tanpa batas",
        "Kustomisasi alur kerja & laporan",
        "Onboarding + pelatihan tim",
      ],
      highlight: false,
    },
  ],
};

/** Link WhatsApp dengan pesan awal yang bisa ditimpa. */
export const waLink = (pesan?: string) =>
  `https://wa.me/${PENAWARAN.wa.nomor}?text=${encodeURIComponent(pesan ?? PENAWARAN.wa.pesanAwal)}`;

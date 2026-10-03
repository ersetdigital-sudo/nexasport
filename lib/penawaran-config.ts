/**
 * Konfigurasi landing penjualan (/penawaran).
 * SEMUA teks landing live di file ini — judul, sub-judul, tombol, FAQ,
 * pesan WhatsApp, dan daftar paket harga. Edit di sini, landing ikut.
 */
export const PENAWARAN = {
  brand: "NEXA SPORT",

  wa: {
    /** Nomor WhatsApp penjualan — format internasional tanpa "+" dan tanpa spasi. */
    nomor: "6287780881117",
    pesanAwal:
      "Halo, saya tertarik dengan Nexa Sport. Boleh minta info paket dan jadwal demo?",
    pesanDemo: "Halo Nexa Sport, saya sudah coba demo-nya. Mau tanya soal penawaran.",
  },

  navbar: {
    menu: [
      { label: "Fitur", href: "#fitur" },
      { label: "Demo", href: "/penawaran/demo" },
      { label: "Harga", href: "#harga" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: "Coba Demo",
  },

  hero: {
    badge: "◉ Dibangun dari alur kerja nyata TNT Sport",
    headline: "Order makin banyak. Produksi tetap terkendali.",
    subheadline:
      "Nexa Sport membantu konveksi menghitung HPP, memantau produksi, dan mengontrol deadline dalam satu sistem. Tanpa spreadsheet yang berantakan, tanpa harus buka banyak aplikasi.",
    ctaUtama: "Coba Demo Gratis",
    ctaKedua: "Tanya via WhatsApp",
    /** Poin manfaat di bawah tombol. */
    poin: [
      "Harga jual ketemu tanpa hitung manual",
      "Pantau progres pesanan dari awal sampai kirim",
      "Deadline produksi lebih mudah terkontrol",
      "Bayar sekali, tanpa langganan bulanan",
    ],
    catatan: "Demo langsung terbuka. Tanpa daftar.",
  },

  pain: {
    judul: "Empat bocor kecil yang diam-diam makan untung konveksi",
    kartu: [
      {
        judul: "HPP dihitung kira-kira",
        teks: "Salah pilih kain saja bisa selisih ribuan rupiah per pcs, dan kamu baru sadar saat margin sudah tipis.",
      },
      {
        judul: "Status order tercecer di chat",
        teks: "Tim tanya terus, kamu jawab terus. Padahal semua itu seharusnya terlihat di satu layar.",
      },
      {
        judul: "Deadline baru ketahuan mepet saat customer nagih",
        teks: "Tanpa pengingat, semuanya bergantung ingatan satu orang.",
      },
      {
        judul: "Excel rawan rusak",
        teks: "Satu rumus tertimpa atau file versi lama terkirim, hitungan langsung salah.",
      },
    ],
  },

  fitur: {
    judul: "Semua yang dipakai tim produksi, dalam satu tempat",
    sub: "Dari order masuk sampai barang terkirim.",
    kartu: [
      { judul: "Pesanan", teks: "Pantau tiap order lewat 11 tahap, dari Desain sampai Kirim." },
      { judul: "Maklon", teks: "Kelola order maklon dengan progres yang jelas." },
      { judul: "Kalkulator HPP", teks: "Total HPP, margin, dan harga jual keluar otomatis." },
      { judul: "Jadwal Produksi", teks: "Lihat beban kerja minggu ini sebelum menerima order baru." },
      { judul: "Pengiriman", teks: "Resi dan status kirim tercatat rapi." },
      { judul: "Laporan", teks: "Omzet, profit, dan rata-rata HPP dalam sekali lihat." },
      { judul: "Notifikasi Deadline", teks: "Pengingat WhatsApp otomatis untuk penanggung jawab produksi." },
    ],
  },

  hpp: {
    badge: "Fitur Baru",
    judul: "Tahu harga jual yang pas dalam hitungan detik",
    sub: "Pilih kain dan variasi, total HPP, margin, dan harga jual langsung terhitung. Ubah harga kain sekali, semua hitungan ikut berubah.",
    poin: [
      "Kain dikelompokkan per kelas: Basic, Premium, Pro",
      "Margin nominal rupiah, harga jual langsung jadi",
      "Ubah harga sekali di Database HPP, semua hitungan ikut",
    ],
    cta: "Coba Kalkulatornya",
  },

  excel: {
    judul: "Masih hitung HPP pakai Excel? Satu rumus tertimpa, satu order bisa rugi.",
    sub: "Pindah ke sistem yang rumusnya terkunci dan datanya tersambung ke produksi.",
    cta: "Bandingkan di Demo",
  },

  notif: {
    judul: "Deadline tidak lagi bergantung ingatan",
    sub: "Penanggung jawab produksi menerima WhatsApp otomatis di H-3, H-2, dan H-1, tepat jam 08:00 WIB.",
    poin: [
      "Tahu order mana yang mepet tanpa buka app",
      "Tidak perlu catatan manual",
      "Bisa dinyalakan atau dimatikan kapan saja",
    ],
    cta: "Lihat Notifikasinya di Demo",
  },

  caraKerja: {
    judul: "Mulai dalam 3 langkah",
    langkah: [
      { judul: "1. Coba demo 2 menit", teks: "Demo interaktif langsung terbuka — tanpa daftar, tanpa install." },
      { judul: "2. Kita sesuaikan dengan alur dan harga kainmu", teks: "Nama tahap, harga kain, dan variasi HPP dirapikan bareng kamu." },
      { judul: "3. Tim mulai pakai, kamu pantau dari HP", teks: "Semua order dan progres terlihat dari satu layar." },
    ],
  },

  demoBand: {
    judul: "Jangan percaya kata-kata. Coba sendiri 2 menit.",
    sub: "Tanpa daftar, tanpa kartu kredit. Semua data di demo hanya contoh.",
    cta: "Buka Demo Sekarang",
  },

  harga: {
    judul: "Bayar sekali, tanpa langganan bulanan",
    sub: "Harga spesial untuk anggota komunitas.",
    badgeHighlight: "Paling Dipilih",
    /** Catatan kecil di bawah kartu harga. */
    catatan:
      "Biaya hosting, domain, dan layanan WhatsApp (jika upgrade) ditanggung pemilik brand. Support dan perbaikan bug gratis sesuai paket.",
  },

  /**
   * Contoh kartu pengalaman — BELUM testimoni nyata, ditampilkan dengan
   * label "Contoh". Ganti isi + set label jadi "" saat sudah ada asli.
   */
  testimoni: {
    judul: "Dibangun dari dapur produksi jersey",
    label: "Contoh",
    items: [
      {
        nama: "Owner konveksi",
        usaha: "Jersey setelan & kaos tim",
        kutip:
          "Sebelumnya status order tersebar di chat dan catatan manual. Sekarang 11 tahap produksinya kelihatan dari satu layar.",
      },
      {
        nama: "Brand jersey lokal",
        usaha: "Jersey printing custom",
        kutip:
          "Harga jual keluar dari kalkulator HPP, bukan tebak-tebakan. Contoh di app: HPP Rp65.250 jadi harga jual Rp115.250.",
      },
      {
        nama: "Penanggung jawab produksi",
        usaha: "Maklon & konveksi",
        kutip:
          "Pengingat H-3, H-2, dan H-1 masuk WhatsApp jam 08:00 WIB. Deadline tidak lagi bergantung ingatan.",
      },
    ],
  },

  faq: [
    ["Perlu install?", "Tidak. Dibuka lewat browser di laptop atau HP."],
    ["Datanya aman?", "Data tiap brand terpisah dan dilindungi login. Detail keamanan kami jelaskan saat konsultasi."],
    ["Bisa disesuaikan dengan alur produksi saya?", "Bisa. Nama tahap, harga kain, dan variasi HPP disesuaikan dengan bisnismu."],
    ["Ada pelatihan?", "Ada sesi pengenalan agar tim cepat terbiasa."],
    ["Bisa dipakai banyak orang?", "Bisa, sesuai paket."],
    ["Cara bayarnya?", "Bayar sekali sesuai paket. Detail pembayaran dijelaskan lewat WhatsApp."],
  ] as [string, string][],

  ctaAkhir: {
    judul: "Siap berhenti menebak HPP?",
    sub: "Coba demonya, lalu ngobrol dengan kami kalau cocok.",
    ctaUtama: "Coba Demo Gratis",
    ctaKedua: "Tanya via WhatsApp",
  },

  /** Harga placeholder — tinggal edit di sini. Skema bayar sekali, bukan langganan. */
  paket: [
    {
      nama: "Starter",
      harga: "Rp499rb",
      periode: "bayar sekali",
      desc: "Untuk konveksi kecil yang baru mulai ingin rapi.",
      fitur: [
        "Tracking pesanan & 11 tahap produksi",
        "Kalkulator HPP otomatis",
        "1 admin",
        "Support via WhatsApp",
      ],
      cta: "Pilih Starter",
      highlight: false,
    },
    {
      nama: "Pro",
      harga: "Rp899rb",
      periode: "bayar sekali",
      desc: "Buat tim produksi yang mulai rame orderannya.",
      fitur: [
        "Semua fitur Starter",
        "Maklon, Jadwal Produksi, Pengiriman",
        "Notifikasi deadline via WhatsApp",
        "Multi user (hingga 5 orang)",
        "Laporan omzet & profit",
      ],
      cta: "Pilih Pro",
      highlight: true,
    },
    {
      nama: "Custom",
      harga: "Nego",
      periode: "bayar sekali",
      desc: "Kebutuhan khusus atau skala besar.",
      fitur: [
        "Semua fitur Pro",
        "Jumlah user tanpa batas",
        "Kustomisasi alur kerja & laporan",
        "Onboarding + pelatihan tim",
      ],
      cta: "Konsultasi Custom",
      highlight: false,
    },
  ],
};

/** Link WhatsApp dengan pesan awal yang bisa ditimpa. */
export const waLink = (pesan?: string) =>
  `https://wa.me/${PENAWARAN.wa.nomor}?text=${encodeURIComponent(pesan ?? PENAWARAN.wa.pesanAwal)}`;

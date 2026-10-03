/**
 * Seed data demo /penawaran — SEMUA DUMMY, in-memory saja (tanpa database,
 * tanpa localStorage). Reset Demo mengembalikan hasil fungsi ini.
 *
 * Angka contoh Kalkulator HPP sengaja disamakan dengan landing page:
 * Kain Atasan Premium 21.250 + Print 25.000 + Jahit 9.000 + DTF 5.000 +
 * Lain-lain 5.000 = Total HPP 65.250, Margin 50.000, Harga Jual 115.250.
 */

export const TAHAPAN_DEFAULT = [
  "Desain",
  "Layout",
  "Profing Warna",
  "Cetak / Print",
  "Press / Transfer Sublime",
  "Potong Pola / Cutting Panel",
  "Jahit / Sewing",
  "Finishing",
  "Quality Control",
  "Packing",
  "Kirim",
] as const;

export type Order = {
  id: number;
  kode: string;
  customer: string;
  /** Nomor HP customer (opsional — order seed lama belum punya). */
  phone?: string;
  /** Ukuran manual khas maklon (opsional). */
  sizes?: string;
  produk: string;
  qty: number;
  /** Jumlah tahap yang sudah SELESAI (0–11). Tahap berjalan = tahapSelesai + 1. */
  tahapSelesai: number;
  deadline: string; // YYYY-MM-DD
  mulai: string; // tanggal mulai produksi (untuk Jadwal)
  total: number;
  maklon?: boolean;
};

export type HppItem = {
  id: number;
  kategori: string;
  item: string;
  variasi: string;
  harga: number;
  satuan: string;
};

export type Kain = {
  id: number;
  grup: string;
  nama: string;
  hargaPerKg: number;
  stok: number;
};

export type Kirim = {
  id: number;
  resi: string;
  order: string;
  ekspedisi: string;
  status: string;
  tanggal: string;
};

export type CustomerRow = {
  nama: string;
  kontak: string;
  omzet: number;
  totalOrder: number;
};

export type NotifRiwayat = {
  kode: string;
  tahap: string;
  hke: number;
  jam: string;
  status: string;
};

export type DemoState = {
  tahapan: string[];
  orders: Order[];
  hppItems: HppItem[];
  kains: Kain[];
  kirim: Kirim[];
  customers: CustomerRow[];
  notifAktif: boolean;
  notifRiwayat: NotifRiwayat[];
};

const hari = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/** Konversi harga/kg → per pcs, sama dengan app asli (1 kg = 4 atasan / 5 celana, bulat Rp50). */
export const konversiAtasan = (kg: number) => Math.round(kg / 4 / 50) * 50;
export const konversiCelana = (kg: number) => Math.round(kg / 5 / 50) * 50;

export function seedDemo(): DemoState {
  return {
    tahapan: [...TAHAPAN_DEFAULT],
    orders: [
      { id: 1, kode: "NSP261002K7RD", customer: "TNT Sport", produk: "Jersey Setelan — Manggarai", qty: 36, tahapSelesai: 7, deadline: hari(3), mulai: hari(-4), total: 4_140_000 },
      { id: 2, kode: "NSP261001M4XA", customer: "FC Garuda Muda", produk: "Jersey Atasan — Grade Ori", qty: 22, tahapSelesai: 4, deadline: hari(12), mulai: hari(-1), total: 2_420_000, maklon: true },
      { id: 3, kode: "NSP260918T2WC", customer: "Komunitas Grid", produk: "Jersey Atasan — Toraja", qty: 18, tahapSelesai: 11, deadline: hari(-2), mulai: hari(-14), total: 1_980_000 },
      { id: 4, kode: "NSP260926H3VE", customer: "Squad Bikers ID", produk: "Jersey Setelan — Custom Nama", qty: 30, tahapSelesai: 9, deadline: hari(8), mulai: hari(-2), total: 3_600_000, maklon: true },
      { id: 5, kode: "NSP260929A5XG", customer: "Toko Sepatu Andalan", produk: "Kaos Tim — Basic Cotton", qty: 50, tahapSelesai: 2, deadline: hari(15), mulai: hari(1), total: 3_250_000 },
      { id: 6, kode: "NSP261003DFR7", customer: "Panitia Porseni UNM", produk: "Jersey Atasan — Voting", qty: 40, tahapSelesai: 0, deadline: hari(20), mulai: hari(2), total: 4_400_000 },
    ],
    hppItems: [
      { id: 1, kategori: "Kain", item: "Kain Atasan", variasi: "PUMA", harga: 21_250, satuan: "pcs" },
      { id: 2, kategori: "Kain", item: "Kain Atasan", variasi: "JARUM", harga: 18_750, satuan: "pcs" },
      { id: 3, kategori: "Print/Press", item: "Print Atasan", variasi: "Atasan", harga: 25_000, satuan: "pcs" },
      { id: 4, kategori: "Print/Press", item: "Print Celana", variasi: "A3", harga: 20_000, satuan: "pcs" },
      { id: 5, kategori: "Print/Press", item: "Print Celana", variasi: "A4", harga: 15_000, satuan: "pcs" },
      { id: 6, kategori: "Jahit Atasan", item: "Jahit Atasan", variasi: "Basic", harga: 9_000, satuan: "pcs" },
      { id: 7, kategori: "Jahit Atasan", item: "Jahit Atasan", variasi: "Premium", harga: 12_000, satuan: "pcs" },
      { id: 8, kategori: "Jahit Celana", item: "Jahit Celana", variasi: "Basic", harga: 8_500, satuan: "pcs" },
      { id: 9, kategori: "Jahit Celana", item: "Jahit Celana", variasi: "Premium", harga: 11_000, satuan: "pcs" },
      { id: 10, kategori: "Logo", item: "Logo", variasi: "Rubber", harga: 3_000, satuan: "pcs" },
      { id: 11, kategori: "Logo", item: "Logo", variasi: "Silikon", harga: 4_000, satuan: "pcs" },
      { id: 12, kategori: "Logo", item: "Logo", variasi: "Bordir", harga: 6_000, satuan: "pcs" },
      { id: 13, kategori: "Collar", item: "Rib Collar", variasi: "Polly", harga: 6_000, satuan: "pcs" },
      { id: 14, kategori: "Rib Collar", item: "Rib Collar", variasi: "Kasmilon", harga: 8_000, satuan: "pcs" },
      { id: 15, kategori: "Rib Collar", item: "Rib Collar", variasi: "Jaquard", harga: 15_000, satuan: "pcs" },
      { id: 16, kategori: "Cuff", item: "Rib Cuff", variasi: "Polly", harga: 8_000, satuan: "set" },
      { id: 17, kategori: "Rib Cuff", item: "Rib Cuff", variasi: "Kasmilon", harga: 12_000, satuan: "set" },
      { id: 18, kategori: "Rib Cuff", item: "Rib Cuff", variasi: "Jaquard", harga: 15_000, satuan: "set" },
      { id: 19, kategori: "Namset", item: "Namset", variasi: "DTF", harga: 8_000, satuan: "set" },
      { id: 20, kategori: "Namset", item: "Namset", variasi: "Poliflek", harga: 25_000, satuan: "set" },
      { id: 21, kategori: "Namset", item: "Namset", variasi: "Printable", harga: 50_000, satuan: "set" },
      { id: 22, kategori: "DTF", item: "DTF", variasi: "DTF", harga: 5_000, satuan: "pcs" },
      { id: 23, kategori: "Operasional", item: "Lain-lain", variasi: "Biaya Tak Terduga", harga: 5_000, satuan: "set" },
    ],
    kains: [
      { id: 1, grup: "Kain Basic", nama: "JARUM", hargaPerKg: 75_000, stok: 14 },
      { id: 2, grup: "Kain Basic", nama: "MILANO", hargaPerKg: 75_000, stok: 9 },
      { id: 3, grup: "Kain Basic", nama: "SMASH", hargaPerKg: 75_000, stok: 6 },
      { id: 4, grup: "Kain Basic", nama: "RHABIT", hargaPerKg: 75_000, stok: 11 },
      { id: 5, grup: "Kain Basic", nama: "DEMO KAIN", hargaPerKg: 105_000, stok: 3 },
      { id: 6, grup: "Kain Premium", nama: "PUMA", hargaPerKg: 85_000, stok: 8 },
      { id: 7, grup: "Kain Premium", nama: "AIRWALK", hargaPerKg: 85_000, stok: 5 },
      { id: 8, grup: "Kain Premium", nama: "EMBOSS", hargaPerKg: 85_000, stok: 4 },
      { id: 9, grup: "Kain Premium", nama: "RHABIT", hargaPerKg: 85_000, stok: 7 },
      { id: 10, grup: "Kain Pro", nama: "JAQUARD", hargaPerKg: 120_000, stok: 2 },
      { id: 11, grup: "Kain Pro", nama: "UV", hargaPerKg: 100_000, stok: 4 },
    ],
    kirim: [
      { id: 1, resi: "JNT-8812345671", order: "NS-2403", ekspedisi: "JNT", status: "Diterima", tanggal: hari(-4) },
      { id: 2, resi: "JNE-7712981034", order: "NS-2404", ekspedisi: "JNE", status: "Dalam Pengiriman", tanggal: hari(-1) },
      { id: 3, resi: "SC-5510876412", order: "NS-2408", ekspedisi: "SiCepat", status: "Dititip Ekspedisi", tanggal: hari(0) },
      { id: 4, resi: "JNT-8812900455", order: "NS-2409", ekspedisi: "JNT", status: "Dikemas", tanggal: hari(2) },
    ],
    customers: [
      { nama: "TNT Sport", kontak: "0812-xxxx-001", omzet: 41_250_000, totalOrder: 12 },
      { nama: "FC Garuda Muda", kontak: "0813-xxxx-002", omzet: 18_700_000, totalOrder: 7 },
      { nama: "Komunitas Grid", kontak: "0852-xxxx-003", omzet: 9_980_000, totalOrder: 4 },
      { nama: "Squad Bikers ID", kontak: "0857-xxxx-004", omzet: 12_600_000, totalOrder: 5 },
      { nama: "Toko Sepatu Andalan", kontak: "0819-xxxx-005", omzet: 6_450_000, totalOrder: 3 },
    ],
    notifAktif: true,
    notifRiwayat: [
      { kode: "NSP261002K7RD", tahap: "Jahit / Sewing", hke: 3, jam: "08:00 WIB", status: "Terkirim" },
      { kode: "NSP260926H3VE", tahap: "Quality Control", hke: 3, jam: "08:00 WIB", status: "Terkirim" },
      { kode: "NSP261002K7RD", tahap: "Jahit / Sewing", hke: 2, jam: "08:00 WIB", status: "Terkirim" },
      { kode: "NSP261002K7RD", tahap: "Jahit / Sewing", hke: 1, jam: "08:00 WIB", status: "Terjadwal" },
    ],
  };
}

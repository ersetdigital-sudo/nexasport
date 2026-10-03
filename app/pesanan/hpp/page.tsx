import HppCalculator from "@/components/admin/HppCalculator";
import { loadHppItems } from "@/lib/hpp-server";

export const metadata = {
  // absolute: judul template root mengikuti nama brand di database, sesuai
  // keputusan pemilik toko (lihat catatan yang sama di app/pesanan/orders).
  title: { absolute: "Kalkulator HPP · Nexa Sport" },
  description: "Kalkulator HPP jersey custom — pilih variasi, total otomatis",
};

/**
 * Data HPP dibaca di server (lib/hpp-server.ts) supaya kalkulator sudah
 * berisi harga di HTML pertama, bukan kosong dulu sampai JS selesai memanggil
 * API — pola yang sama dengan /pesanan/orders.
 *
 * `force-dynamic`: halaman ini membaca cookie login, jadi tidak boleh
 * di-prerender (lihat catatan yang sama di app/pesanan/orders).
 */
export const dynamic = "force-dynamic";
export default async function HppPage() {
  const items = await loadHppItems();
  return <HppCalculator initialItems={items} />;
}

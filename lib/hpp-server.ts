/**
 * Pembacaan database HPP untuk halaman Kalkulator (/pesanan/hpp).
 *
 * Polanya sama dengan lib/pesanan-server.ts dan lib/maklon-server.ts: data
 * dibaca di server lewat service role SETELAH cookie login `pesanan_auth`
 * diverifikasi (getAdminDb) — hak bacanya tidak berubah dari endpoint lain.
 * Belum login / gagal baca → `null`, dan halaman tetap tampil dengan
 * pesan error, bukan crash.
 */
import { getAdminDb } from "@/lib/admin-auth";

export type HppItem = {
  id: number;
  kategori: string;
  item: string;
  variasi: string;
  harga: number;
  satuan: string;
  urutan: number;
};

/** `null` = belum login / gagal baca database. */
export async function loadHppItems(): Promise<HppItem[] | null> {
  try {
    const db = await getAdminDb();
    if (!db) return null;

    const res = await db
      .from("hpp_items")
      .select("id, kategori, item, variasi, harga, satuan, urutan")
      .order("urutan", { ascending: true });

    if (res.error || !res.data) return null;

    return (res.data as Record<string, unknown>[]).map((row) => ({
      id: Number(row.id),
      kategori: String(row.kategori),
      item: String(row.item),
      variasi: String(row.variasi),
      harga: Number(row.harga),
      satuan: String(row.satuan ?? "pcs"),
      urutan: Number(row.urutan ?? 0),
    }));
  } catch {
    return null;
  }
}

/**
 * Pembacaan database "DAFTAR KAIN" (sheet Excel yang sama) untuk tab
 * Daftar Kain di /pesanan/hpp. Polanya sama dengan lib/hpp-server.ts:
 * dibaca di server lewat service role SETELAH cookie login `pesanan_auth`
 * diverifikasi (getAdminDb). Belum login / gagal baca → `null`.
 */
import { getAdminDb } from "@/lib/admin-auth";

export type KainFabric = {
  id: number;
  grup: string;
  nama: string;
  hargaPerKg: number;
  hargaAtasan: number | null;
  hargaCelana: number | null;
};

/** `null` = belum login / gagal baca database. */
export async function loadKainFabrics(): Promise<KainFabric[] | null> {
  try {
    const db = await getAdminDb();
    if (!db) return null;

    const res = await db
      .from("kain_fabrics")
      .select("id, grup, nama, harga_per_kg, harga_atasan, harga_celana")
      .order("position", { ascending: true });

    if (res.error || !res.data) return null;

    return (res.data as Record<string, unknown>[]).map((row) => ({
      id: Number(row.id),
      grup: String(row.grup),
      nama: String(row.nama),
      hargaPerKg: Number(row.harga_per_kg),
      hargaAtasan: row.harga_atasan == null ? null : Number(row.harga_atasan),
      hargaCelana: row.harga_celana == null ? null : Number(row.harga_celana),
    }));
  } catch {
    return null;
  }
}

import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/admin-auth";
import { loadHppItems } from "@/lib/hpp-server";

/**
 * Endpoint database HPP untuk halaman Kalkulator (/pesanan/hpp).
 *
 * - GET  : daftar harga (dipakai client untuk refresh setelah simpan harga).
 * - PATCH: ubah harga satu baris ({ id, harga }). Satu-satunya perubahan yang
 *   dibuka — kategori/item/variasi tidak bisa diedit dari sini supaya pasangan
 *   (item, variasi) yang dipakai kalkulator untuk lookup tidak rusak.
 *
 * Dua-duanya butuh cookie login `pesanan_auth=true` (getAdminDb), sama seperti
 * endpoint dashboard lain. Belum login → 401.
 */
export async function GET() {
  const items = await loadHppItems();
  if (!items) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ items });
}

export async function PATCH(request: Request) {
  const db = await getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { id?: unknown; harga?: unknown }
    | null;

  const id = Number(body?.id);
  const harga = Number(body?.harga);
  if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(harga) || harga < 0) {
    return NextResponse.json(
      { error: "id dan harga (>= 0) wajib angka yang valid" },
      { status: 400 }
    );
  }

  const res = await db
    .from("hpp_items")
    .update({ harga, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (res.error || !res.data?.length) {
    console.error("[hpp] gagal update harga:", res.error);
    return NextResponse.json(
      { error: res.error?.message ?? "Baris tidak ditemukan" },
      { status: 500 }
    );
  }

  const row = res.data[0] as Record<string, unknown>;
  return NextResponse.json({
    item: { ...row, harga: Number(row.harga) },
  });
}

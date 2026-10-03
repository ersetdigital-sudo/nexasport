import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/admin-auth";
import { loadHppItems } from "@/lib/hpp-server";

/**
 * Endpoint database HPP untuk halaman Kalkulator (/pesanan/hpp).
 *
 * - GET  : daftar harga (dipakai client untuk refresh setelah simpan harga).
 * - POST : tambah baris baru ({ kategori, item, variasi, harga, satuan? }) —
 *   dipakai form "Tambah Item" di tab Database HPP.
 * - PATCH: ubah harga satu baris ({ id, harga }). Kategori/item/variasi baris
 *   lama tidak bisa diedit supaya pasangan (item, variasi) yang dipakai
 *   kalkulator untuk lookup tidak rusak.
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

/** Bentuk baris yang sama seperti loadHppItems (lib/hpp-server.ts). */
function mapItem(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    kategori: String(row.kategori),
    item: String(row.item),
    variasi: String(row.variasi),
    harga: Number(row.harga),
    satuan: String(row.satuan ?? "pcs"),
    urutan: Number(row.position ?? 0),
  };
}

export async function POST(request: Request) {
  const db = await getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { kategori?: unknown; item?: unknown; variasi?: unknown; harga?: unknown; satuan?: unknown }
    | null;

  const kategori = String(body?.kategori ?? "").trim();
  const item = String(body?.item ?? "").trim();
  const variasi = String(body?.variasi ?? "").trim();
  const harga = Number(body?.harga);
  const satuan = String(body?.satuan ?? "pcs").trim() || "pcs";
  if (!kategori || !item || !variasi || !Number.isFinite(harga) || harga < 0) {
    return NextResponse.json(
      { error: "kategori, item, variasi, dan harga (>= 0) wajib diisi" },
      { status: 400 }
    );
  }

  // Tolak duplikat (item, variasi) — pasangan ini kunci lookup kalkulator
  // dan dibatasi unique di database.
  const existing = await db
    .from("hpp_items")
    .select("id")
    .eq("item", item)
    .eq("variasi", variasi)
    .limit(1);
  if (!existing.error && (existing.data?.length ?? 0) > 0) {
    return NextResponse.json(
      { error: `"${item}" variasi "${variasi}" sudah ada di database HPP` },
      { status: 409 }
    );
  }

  // Lanjutkan urutan `position` dari baris terakhir.
  const last = await db
    .from("hpp_items")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  const position = Number(last.data?.[0]?.position ?? 0) + 1;

  const res = await db
    .from("hpp_items")
    .insert({ kategori, item, variasi, harga, satuan, position })
    .select();

  if (res.error || !res.data?.length) {
    console.error("[hpp] gagal tambah item:", res.error);
    return NextResponse.json(
      { error: res.error?.message ?? "Gagal menambah item" },
      { status: 500 }
    );
  }

  return NextResponse.json({ item: mapItem(res.data[0] as Record<string, unknown>) });
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

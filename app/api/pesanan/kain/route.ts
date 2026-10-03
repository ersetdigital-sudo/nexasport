import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/admin-auth";
import { konversiHargaPcs } from "@/lib/kain-konversi";

/**
 * Endpoint tabel `kain_fabrics` untuk tab Daftar Kain (/pesanan/hpp).
 *
 * - POST : tambah jenis kain baru ({ grup, nama, hargaPerKg }). Harga per pcs
 *   TIDAK diketik manual — dihitung otomatis dari harga per kg
 *   (1 kg = 4 pcs atasan / 5 pcs celana, lihat lib/kain-konversi.ts).
 * - PATCH: ubah harga per kg ({ id, hargaPerKg }) — harga per pcs di baris
 *   yang sama ikut dihitung ulang otomatis.
 *
 * Keduanya butuh cookie login `pesanan_auth=true` (getAdminDb), sama seperti
 * endpoint /api/pesanan/hpp. Belum login → 401.
 */

function mapRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    grup: String(row.grup),
    nama: String(row.nama),
    hargaPerKg: Number(row.harga_per_kg),
    hargaAtasan: row.harga_atasan == null ? null : Number(row.harga_atasan),
    hargaCelana: row.harga_celana == null ? null : Number(row.harga_celana),
  };
}

export async function POST(request: Request) {
  const db = await getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { grup?: unknown; nama?: unknown; hargaPerKg?: unknown }
    | null;

  const grup = String(body?.grup ?? "").trim();
  const nama = String(body?.nama ?? "").trim().toUpperCase();
  const hargaPerKg = Number(body?.hargaPerKg);
  if (!grup || !nama || !Number.isFinite(hargaPerKg) || hargaPerKg < 0) {
    return NextResponse.json(
      { error: "grup, nama, dan hargaPerKg (>= 0) wajib diisi" },
      { status: 400 }
    );
  }

  // Tolak duplikat grup + nama (padanan aturan seed di migrasi 0014).
  const existing = await db
    .from("kain_fabrics")
    .select("id")
    .eq("grup", grup)
    .eq("nama", nama)
    .limit(1);
  if (!existing.error && (existing.data?.length ?? 0) > 0) {
    return NextResponse.json(
      { error: `Kain "${nama}" sudah ada di grup ${grup}` },
      { status: 409 }
    );
  }

  // Lanjutkan urutan `position` dari baris terakhir.
  const last = await db
    .from("kain_fabrics")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  const position = Number(last.data?.[0]?.position ?? 0) + 1;

  const { hargaAtasan, hargaCelana } = konversiHargaPcs(hargaPerKg);
  const res = await db
    .from("kain_fabrics")
    .insert({
      grup,
      nama,
      harga_per_kg: hargaPerKg,
      harga_atasan: hargaAtasan,
      harga_celana: hargaCelana,
      position,
    })
    .select();

  if (res.error || !res.data?.length) {
    console.error("[kain] gagal tambah kain:", res.error);
    return NextResponse.json(
      { error: res.error?.message ?? "Gagal menambah kain" },
      { status: 500 }
    );
  }

  return NextResponse.json({ fabric: mapRow(res.data[0] as Record<string, unknown>) });
}

export async function PATCH(request: Request) {
  const db = await getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { id?: unknown; hargaPerKg?: unknown }
    | null;

  const id = Number(body?.id);
  const hargaPerKg = Number(body?.hargaPerKg);
  if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(hargaPerKg) || hargaPerKg < 0) {
    return NextResponse.json(
      { error: "id dan hargaPerKg (>= 0) wajib angka yang valid" },
      { status: 400 }
    );
  }

  const { hargaAtasan, hargaCelana } = konversiHargaPcs(hargaPerKg);
  const res = await db
    .from("kain_fabrics")
    .update({
      harga_per_kg: hargaPerKg,
      harga_atasan: hargaAtasan,
      harga_celana: hargaCelana,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (res.error || !res.data?.length) {
    console.error("[kain] gagal update harga per kg:", res.error);
    return NextResponse.json(
      { error: res.error?.message ?? "Baris tidak ditemukan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ fabric: mapRow(res.data[0] as Record<string, unknown>) });
}

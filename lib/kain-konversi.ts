/**
 * Konversi satuan kain — padanan rumus sheet DAFTAR KAIN di Excel:
 * 1 kg kain jadi 4 pcs atasan / 5 pcs celana, jadi harga per pcs =
 * harga per kg dibagi jumlah pcs. Dibulatkan ke Rp50 terdekat supaya
 * harganya rapi.
 *
 * Dipisah dari lib/kain-server.ts karena file itu hanya boleh jalan di
 * server (pakai getAdminDb), sedangkan fungsi ini juga dipakai komponen
 * client untuk menampilkan pratinjau konversi.
 */

/** Jumlah pcs hasil jadi per 1 kg kain. */
export const PCS_ATASAN_PER_KG = 4;
export const PCS_CELANA_PER_KG = 5;

/** Bulatkan ke Rp50 terdekat (18750, 21250, dst — seperti seed Excel). */
function bulatkan50(n: number): number {
  return Math.round(n / 50) * 50;
}

/** Harga per pcs atasan & celana dari harga per kg. */
export function konversiHargaPcs(hargaPerKg: number): {
  hargaAtasan: number;
  hargaCelana: number;
} {
  return {
    hargaAtasan: bulatkan50(hargaPerKg / PCS_ATASAN_PER_KG),
    hargaCelana: bulatkan50(hargaPerKg / PCS_CELANA_PER_KG),
  };
}

"use client";

/**
 * Demo Pengiriman — DISAMAKAN dengan ViewKirim admin asli
 * (components/admin/PesananDashboard.tsx): antrian "siap kirim" = tahap
 * sebelum terakhir (Packing) yang belum tuntas, kartu pas-card dengan pill
 * status, isi paket, ekspedisi, dan tombol "Buka Detail Pesanan".
 * Data tetap dummy in-memory (demo store) — tidak ada call ke API/Supabase.
 */
import { useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { pcsLabel } from "@/lib/utils";
import { PageHead } from "@/components/penawaran/demo/ui";
import { DetailSheet } from "@/components/penawaran/demo/DetailSheet";

type FilterKey = "all" | "baru" | "produksi" | "kirim" | "selesai";
const FILTER_LABEL: Record<FilterKey, string> = {
  all: "Semua", baru: "Baru", produksi: "Produksi", kirim: "Siap Dikirim", selesai: "Selesai",
};

/** Status bucket — sama seperti bucket pesanan demo/admin asli. */
function statusOf(tahapSelesai: number, total: number): FilterKey {
  if (tahapSelesai >= total) return "selesai";
  if (tahapSelesai >= total - 1) return "kirim";
  if (tahapSelesai <= 1) return "baru";
  return "produksi";
}

export default function DemoPengiriman() {
  const s = useDemo();
  const [detailId, setDetailId] = useState<number | null>(null);
  const total = s.tahapan.length;

  // Antrian "siap kirim" = tahap sebelum terakhir (Packing) yang belum tuntas.
  const siap = s.orders.filter((o) => {
    const berjalan = Math.min(o.tahapSelesai + 1, total);
    return o.tahapSelesai < total && berjalan >= total - 1;
  });

  const detail = s.orders.find((o) => o.id === detailId) ?? null;

  return (
    <div>
      <PageHead title="Pengiriman" />
      <p className="text-[13.5px] text-[#64748B] mb-4">
        Pesanan tahap {total - 1} (siap dikirim) — klik tahap Kirim untuk menandai pesanan selesai. Nomor resi opsional.
      </p>
      {siap.length === 0 ? (
        <p className="text-[13.5px] text-[#64748B]">
          Belum ada pesanan yang siap dikirim.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {siap.map((o) => {
            const st = statusOf(o.tahapSelesai, total);
            return (
              <div key={o.id} className="pas-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold pas-num">{o.kode}</p>
                    <p className="text-[13px] text-[var(--pas-muted)] mt-0.5">
                      {o.customer} - {o.phone || "-"}
                    </p>
                  </div>
                  <span className={`pas-pill ${st}`}>
                    {FILTER_LABEL[st]}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mt-4 text-[13.5px]">
                  <div>
                    <p className="text-[12px] text-[var(--pas-muted)]">Isi Paket</p>
                    <p className="mt-1">
                      {o.produk} - {pcsLabel(o.qty)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[var(--pas-muted)]">Ekspedisi</p>
                    <p className="mt-1">
                      {o.courier || (
                        <span className="text-[var(--pas-muted)]">belum diisi</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    className="pas-btn-ghost px-4 py-2 text-[13.5px]"
                    onClick={() => setDetailId(o.id)}
                  >
                    Buka Detail Pesanan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail — sheet sama seperti DetailSheet admin asli */}
      <DetailSheet
        open={!!detail}
        order={detail}
        tahapan={s.tahapan}
        st={detail ? statusOf(detail.tahapSelesai, total) : "baru"}
        stLabel={detail ? FILTER_LABEL[statusOf(detail.tahapSelesai, total)] : ""}
        onClose={() => setDetailId(null)}
        onSimpan={(tahapSelesai) => {
          setDemo({
            orders: s.orders.map((o) => (o.id === detailId ? { ...o, tahapSelesai } : o)),
          });
          setDetailId(null);
          demoToast("Perubahan disimpan (mode demo)");
        }}
        onSelesai={() => {
          setDemo({
            orders: s.orders.map((o) => (o.id === detailId ? { ...o, tahapSelesai: total } : o)),
          });
          setDetailId(null);
          demoToast("Pesanan ditandai selesai (mode demo)");
        }}
      />
    </div>
  );
}

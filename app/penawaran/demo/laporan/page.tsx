"use client";

/**
 * Demo Laporan — kartu ringkasan + grafik bar omzet (SVG ringan, tanpa
 * library chart) dengan filter periode.
 */
import { useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { PageHead, Kartu, rp } from "@/components/penawaran/demo/ui";
import { CountUp } from "@/components/penawaran/Reveal";

/** Label bulan + omzet dummy untuk N bulan terakhir. */
function seriBulanan(n: number) {
  const out: { label: string; omzet: number }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      label: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d),
      // Angka dummy dengan sedikit variasi biar grafiknya hidup.
      omzet: 18_000_000 + ((i * 7_300_000) % 22_000_000) + (i === 0 ? 6_500_000 : 0),
    });
  }
  return out;
}

export default function DemoLaporan() {
  const s = useDemo();
  const [periode, setPeriode] = useState(6);
  const seri = seriBulanan(periode);
  const max = Math.max(...seri.map((b) => b.omzet));

  const omzet = s.orders.reduce((a, o) => a + o.total, 0);
  const profit = Math.round(omzet * 0.31);
  const rataHpp = 65_250;

  return (
    <div>
      <PageHead
        kicker="Data"
        title="Laporan"
        action={
          <select
            value={periode}
            onChange={(e) => setPeriode(Number(e.target.value))}
            className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13px] font-semibold text-[#04123F] outline-none"
          >
            <option value={3}>3 bulan</option>
            <option value={6}>6 bulan</option>
            <option value={12}>12 bulan</option>
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [rp(omzet), "Omzet", "total order aktif + selesai"],
          [rp(profit), "Profit", "estimasi margin rata-rata"],
          [String(s.orders.length), "Jumlah Order", "periode ini"],
          [rp(rataHpp), "Rata-rata HPP", "per set dari Kalkulator HPP"],
        ].map(([v, judul, ket]) => (
          <Kartu key={judul} className="p-5">
            <p className="text-[22px] font-extrabold tabular-nums text-[#04123F]">{v}</p>
            <p className="mt-1 text-[13px] font-bold text-[#04123F]">{judul}</p>
            <p className="mt-1 text-[11.5px] text-[#94A3B8]">{ket}</p>
          </Kartu>
        ))}
      </div>

      {/* Grafik bar omzet */}
      <Kartu className="mt-5 p-5">
        <h3 className="text-[14px] font-bold text-[#04123F]">Omzet {periode} bulan terakhir</h3>
        <div className="mt-6 flex h-48 items-end gap-3">
          {seri.map((b, i) => (
            <div key={b.label + i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-[#04123F] to-[#2E4AA8] transition-all duration-700"
                style={{ height: `${Math.max(6, (b.omzet / max) * 100)}%` }}
                title={rp(b.omzet)}
              />
              <span className="text-[10.5px] font-semibold text-[#94A3B8]">{b.label}</span>
            </div>
          ))}
        </div>
      </Kartu>

      <Kartu className="mt-5 p-5">
        <h3 className="text-[14px] font-bold text-[#04123F]">Ringkasan</h3>
        <div className="mt-3 space-y-2 text-[13px] text-[#475569]">
          <p>· Rata-rata nilai order: <b className="text-[#04123F]">{rp(Math.round(omzet / Math.max(1, s.orders.length)))}</b></p>
          <p>· Order mendekati deadline dipantau otomatis lewat menu <b className="text-[#04123F]">Notifikasi</b>.</p>
          <p>· Angka di laporan demo ini dummy — di app asli dihitung dari data pesanan sungguhan.</p>
        </div>
      </Kartu>
    </div>
  );
}

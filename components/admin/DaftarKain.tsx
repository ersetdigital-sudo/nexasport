"use client";

/**
 * Tab "Daftar Kain" — padanan sheet DAFTAR KAIN di Excel: daftar nama kain
 * per grup (Basic / Premium / Pro) dengan harga per kg dan hasil jadi
 * per pcs (atasan jadi 4 pcs, celana jadi 5 pcs). Read-only.
 */
import type { KainFabric } from "@/lib/kain-server";
import { rupiah } from "@/lib/rupiah";

/** Aksen header tiap grup kain. */
const GRUP_META: Record<string, { bar: string; badge: string; label: string }> = {
  "Kain Basic": {
    bar: "bg-[#F1F5F9]",
    badge: "bg-[#E2E8F0] text-[#334155]",
    label: "Kain Basic",
  },
  "Kain Premium": {
    bar: "bg-[#FEF3C7]",
    badge: "bg-[#FDE68A] text-[#92400E]",
    label: "Kain Premium",
  },
  "Kain Pro": {
    bar: "bg-[#E0E7FF]",
    badge: "bg-[#C7D2FE] text-[#3730A3]",
    label: "Kain Pro",
  },
};
const FALLBACK_GRUP = {
  bar: "bg-[#F1F5F9]",
  badge: "bg-[#E2E8F0] text-[#334155]",
  label: "",
};

export default function DaftarKain({ fabrics }: { fabrics: KainFabric[] | null }) {
  if (!fabrics || fabrics.length === 0) {
    return (
      <div className="pas-card p-6 text-sm opacity-70">
        Data Daftar Kain belum tersedia. Jalankan migrasi{" "}
        <code>0014_kain_fabrics.sql</code> di SQL Editor Supabase, lalu muat
        ulang halaman ini.
      </div>
    );
  }

  // Grup dijaga urutan kemunculan pertama (mengikuti kolom position di DB).
  const grups: string[] = [];
  for (const f of fabrics) if (!grups.includes(f.grup)) grups.push(f.grup);

  return (
    <div>
      <div className="flex flex-col gap-5">
        {grups.map((grup) => {
          const meta = GRUP_META[grup] ?? { ...FALLBACK_GRUP, label: grup };
          const rows = fabrics.filter((f) => f.grup === grup);
          return (
            <div key={grup} className="pas-card overflow-hidden">
              <div className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 ${meta.bar}`}>
                <h2 className="font-bold text-[15px]">{meta.label}</h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${meta.badge}`}
                >
                  {rows.length} kain
                </span>
              </div>
              <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11.5px] uppercase tracking-wide opacity-50">
                    <th className="px-4 py-2.5 font-semibold w-14">No</th>
                    <th className="px-2 py-2.5 font-semibold">Nama Kain</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Hrg/Kg</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Atasan Jadi 4 Pcs</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Celana Jadi 5 Pcs</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((f, i) => (
                    <tr key={f.id} className={i % 2 ? "bg-[#F7F8FA]" : ""}>
                      <td className="px-4 py-2.5 opacity-40 tabular-nums">{i + 1}</td>
                      <td className="px-2 py-2.5 font-medium">{f.nama}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {rupiah(f.hargaPerKg)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {f.hargaAtasan != null ? rupiah(f.hargaAtasan) : <span className="opacity-40">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {f.hargaCelana != null ? rupiah(f.hargaCelana) : <span className="opacity-40">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {/* ── DAFTAR KAIN (MOBILE) ── */}
              <div className="sm:hidden divide-y divide-[#EEF1F5]">
                {rows.map((f) => (
                  <div key={f.id} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13.5px] font-medium">{f.nama}</span>
                      <span className="text-[12px] opacity-60 whitespace-nowrap tabular-nums">
                        {rupiah(f.hargaPerKg)}/kg
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-[#F7F8FA] px-3 py-2">
                        <span className="block text-[10.5px] uppercase tracking-wide opacity-50">
                          Atasan · 4 pcs
                        </span>
                        <span className="text-[13px] font-semibold tabular-nums">
                          {f.hargaAtasan != null ? rupiah(f.hargaAtasan) : <span className="opacity-40">—</span>}
                        </span>
                      </div>
                      <div className="rounded-lg bg-[#F7F8FA] px-3 py-2">
                        <span className="block text-[10.5px] uppercase tracking-wide opacity-50">
                          Celana · 5 pcs
                        </span>
                        <span className="text-[13px] font-semibold tabular-nums">
                          {f.hargaCelana != null ? rupiah(f.hargaCelana) : <span className="opacity-40">—</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11.5px] opacity-50">
        Padanan sheet DAFTAR KAIN di Excel — harga per kg kain dan hasil jadi
        per pcs yang jadi acuan harga “Kain Atasan/Kain Celana” di Database HPP.
      </p>
    </div>
  );
}

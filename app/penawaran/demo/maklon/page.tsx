"use client";

/** Demo Maklon — order maklon dengan progres per tahap. */
import { useDemo } from "@/lib/demo-store";
import { PageHead, Kartu, badgeTahap, rp, tanggalID } from "@/components/penawaran/demo/ui";

export default function DemoMaklon() {
  const s = useDemo();
  const maklon = s.orders.filter((o) => o.maklon);
  const total = s.tahapan.length;

  return (
    <div>
      <PageHead title="Maklon" />
      {maklon.length === 0 && (
        <Kartu className="p-10 text-center text-[13px] text-[#94A3B8]">
          Belum ada order maklon di data demo.
        </Kartu>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {maklon.map((o) => (
          <Kartu key={o.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[15px] font-bold text-[#04123F]">{o.kode} — {o.customer}</p>
                <p className="mt-0.5 text-[12.5px] text-[#64748B]">{o.produk} · {o.qty} pcs</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeTahap(o.tahapSelesai, total)}`}>
                {o.tahapSelesai >= total ? "Selesai" : s.tahapan[o.tahapSelesai]}
              </span>
            </div>
            {/* Progres per tahap: 11 titik */}
            <div className="mt-4 flex items-center gap-1">
              {s.tahapan.map((t, i) => (
                <div key={t} className="group relative flex-1">
                  <div
                    className={`h-2 rounded-full ${i < o.tahapSelesai ? "bg-[#FEC40B]" : i === o.tahapSelesai ? "bg-[#FEC40B]/50" : "bg-[#E2E8F0]"}`}
                    title={t}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#94A3B8]">
              <span>{o.tahapSelesai}/{total} tahap selesai</span>
              <span>deadline {tanggalID(o.deadline)} · {rp(o.total)}</span>
            </div>
          </Kartu>
        ))}
      </div>
    </div>
  );
}

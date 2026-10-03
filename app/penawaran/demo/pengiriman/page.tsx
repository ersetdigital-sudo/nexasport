"use client";

/** Demo Pengiriman — resi, ekspedisi, status; tombol Update Status. */
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { PageHead, Kartu, tanggalID } from "@/components/penawaran/demo/ui";

const URUTAN = ["Dikemas", "Dititip Ekspedisi", "Dalam Pengiriman", "Diterima"];
const WARNA: Record<string, string> = {
  Dikemas: "bg-slate-100 text-slate-600",
  "Dititip Ekspedisi": "bg-sky-50 text-sky-700",
  "Dalam Pengiriman": "bg-amber-50 text-amber-700",
  Diterima: "bg-emerald-50 text-emerald-700",
};

export default function DemoPengiriman() {
  const s = useDemo();

  const update = (id: number) => {
    setDemo({
      kirim: s.kirim.map((k) => {
        if (k.id !== id) return k;
        const next = URUTAN[Math.min(URUTAN.length - 1, URUTAN.indexOf(k.status) + 1)];
        return { ...k, status: next };
      }),
    });
    demoToast("Status pengiriman diperbarui");
  };

  return (
    <div>
      <PageHead title="Pengiriman" />
      <Kartu>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-wide text-[#94A3B8]">
                {["Resi", "Order", "Ekspedisi", "Tanggal", "Status", ""].map((h, i) => (
                  <th key={h} className={`px-4 py-3 font-semibold ${i === 4 ? "" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.kirim.map((k, i) => (
                <tr key={k.id} className={i % 2 ? "bg-[#FAFBFC]" : ""}>
                  <td className="px-4 py-3 font-bold tabular-nums text-[#04123F]">{k.resi}</td>
                  <td className="px-4 py-3">{k.order}</td>
                  <td className="px-4 py-3 text-[#475569]">{k.ekspedisi}</td>
                  <td className="px-4 py-3 tabular-nums text-[#475569]">{tanggalID(k.tanggal)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${WARNA[k.status] ?? "bg-[#F1F5F9]"}`}>
                      {k.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {k.status !== "Diterima" && (
                      <button
                        type="button"
                        onClick={() => update(k.id)}
                        className="rounded-xl bg-[#FEC40B] px-3 py-1.5 text-[12px] font-bold text-[#04123F] transition hover:brightness-105 active:scale-95"
                      >
                        Update Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>
    </div>
  );
}

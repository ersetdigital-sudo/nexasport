"use client";

/**
 * Demo Jadwal Produksi — timeline mingguan dengan kartu order.
 * Kartu bisa digeser ±1 hari (ganti tanggal, tersimpan in-memory).
 */
import { useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { PageHead, Kartu, rp } from "@/components/penawaran/demo/ui";

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function awalMinggu(base: Date) {
  const d = new Date(base);
  const shift = (d.getDay() + 6) % 7; // Senin = 0
  d.setDate(d.getDate() - shift);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DemoJadwal() {
  const s = useDemo();
  const [offset, setOffset] = useState(0);

  const base = awalMinggu(new Date(Date.now() + offset * 7 * 86_400_000));
  const kolom = HARI.map((h, i) => {
    const t = new Date(base);
    t.setDate(base.getDate() + i);
    const iso = t.toISOString().slice(0, 10);
    return { hari: h, iso, order: s.orders.filter((o) => o.mulai === iso) };
  });

  const geser = (id: number, hari: number) => {
    setDemo({
      orders: s.orders.map((o) => {
        if (o.id !== id) return o;
        const t = new Date(o.mulai);
        t.setDate(t.getDate() + hari);
        return { ...o, mulai: t.toISOString().slice(0, 10) };
      }),
    });
    demoToast(hari > 0 ? "Digeser +1 hari" : "Digeser -1 hari");
  };

  return (
    <div>
      <PageHead
        title="Jadwal Produksi"
        action={
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setOffset((v) => v - 1)} className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] font-bold text-[#475569] transition hover:border-[#04123F]">←</button>
            <span className="rounded-xl bg-[#F1F5F9] px-3 py-2 text-[12.5px] font-semibold text-[#475569]">Minggu ini</span>
            <button type="button" onClick={() => setOffset((v) => v + 1)} className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] font-bold text-[#475569] transition hover:border-[#04123F]">→</button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-6 gap-3">
          {kolom.map((k) => (
            <Kartu key={k.iso}>
              <div className="border-b border-[#E9EDF2] bg-[#F8FAFC] px-3 py-2.5 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#04123F]">{k.hari}</p>
                <p className="text-[10.5px] text-[#94A3B8]">
                  {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(k.iso))}
                </p>
              </div>
              <div className="space-y-2 p-2.5">
                {k.order.map((o) => (
                  <div key={o.id} className="rounded-xl border border-[#EEF1F5] bg-white p-2.5 shadow-sm">
                    <p className="text-[11px] font-bold text-[#04123F]">{o.kode}</p>
                    <p className="mt-0.5 line-clamp-2 text-[10.5px] text-[#64748B]">{o.customer}</p>
                    <p className="mt-1 text-[10px] font-semibold text-[#94A3B8]">{o.qty} pcs · {rp(o.total)}</p>
                    <div className="mt-2 flex gap-1">
                      <button type="button" onClick={() => geser(o.id, -1)} className="flex-1 rounded-lg bg-[#F1F5F9] py-1 text-[10px] font-bold text-[#475569] transition hover:bg-[#E2E8F0] active:scale-95">←</button>
                      <button type="button" onClick={() => geser(o.id, +1)} className="flex-1 rounded-lg bg-[#F1F5F9] py-1 text-[10px] font-bold text-[#475569] transition hover:bg-[#E2E8F0] active:scale-95">→</button>
                    </div>
                  </div>
                ))}
                {k.order.length === 0 && (
                  <p className="py-3 text-center text-[10.5px] text-[#CBD5E1]">Kosong</p>
                )}
              </div>
            </Kartu>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[11.5px] text-[#94A3B8]">
        Geser kartu pakai tombol ← → (mode demo — di app asli bisa drag langsung).
      </p>
    </div>
  );
}

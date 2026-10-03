"use client";

/** Demo Customer — daftar customer + riwayat order ringkas. */
import { useDemo } from "@/lib/demo-store";
import { PageHead, Kartu, rp } from "@/components/penawaran/demo/ui";

export default function DemoCustomer() {
  const s = useDemo();

  return (
    <div>
      <PageHead kicker="Data" title="Customer" />
      <div className="grid gap-4 lg:grid-cols-2">
        {s.customers.map((c) => {
          const riwayat = s.orders.filter((o) => o.customer === c.nama);
          return (
            <Kartu key={c.nama} className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#04123F] text-[13px] font-bold text-[#FEC40B]">
                  {c.nama.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[#04123F]">{c.nama}</p>
                  <p className="text-[12px] text-[#94A3B8]">{c.kontak}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-bold tabular-nums text-[#04123F]">{rp(c.omzet)}</p>
                  <p className="text-[11px] text-[#94A3B8]">{c.totalOrder} order</p>
                </div>
              </div>
              <div className="mt-4 border-t border-[#F1F5F9] pt-3">
                <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wide text-[#94A3B8]">Riwayat ringkas</p>
                {riwayat.length === 0 && <p className="text-[12px] text-[#CBD5E1]">Belum ada order di data demo.</p>}
                <div className="space-y-1.5">
                  {riwayat.slice(0, 3).map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-[12.5px]">
                      <span className="font-semibold text-[#04123F]">{o.kode}</span>
                      <span className="text-[#64748B]">{o.produk}</span>
                      <span className="font-semibold tabular-nums text-[#475569]">{rp(o.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Kartu>
          );
        })}
      </div>
    </div>
  );
}

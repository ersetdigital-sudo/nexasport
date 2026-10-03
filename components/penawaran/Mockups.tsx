"use client";

/**
 * Mockup untuk landing /penawaran — dibangun dari komponen (bukan gambar),
 * gaya dashboard asli: navy #04123F, aksen #FEC40B, kartu rounded halus.
 */
import { rp } from "@/components/penawaran/Reveal";

/** Kartu kecil di dalam mockup dashboard (efek floating). */
function FloatCard({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute rounded-xl bg-white shadow-lg shadow-[#04123F]/10 ring-1 ring-[#04123F]/5 ${className}`}>
      {children}
    </div>
  );
}

/** Mockup dashboard: topbar + strip KPI mini + sidebar mini + tabel order + kartu float. */
export function MockupDashboard() {
  const kpi: [string, string, string][] = [
    ["Pesanan aktif", "12", "text-[#04123F]"],
    ["Siap kirim", "4", "text-emerald-600"],
    ["Deadline H-3", "3", "text-amber-600"],
  ];
  return (
    <div className="relative">
      {/* Cahaya lembut di belakang mockup */}
      <div aria-hidden className="absolute -inset-8 -z-10">
        <div className="absolute right-2 top-0 h-40 w-40 rounded-full bg-[#FEC40B]/25 blur-3xl" />
        <div className="absolute bottom-2 left-0 h-44 w-44 rounded-full bg-[#04123F]/10 blur-3xl" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-[#04123F]/15 ring-1 ring-[#04123F]/10">
        {/* Topbar mockup */}
        <div className="flex items-center justify-between border-b border-[#EEF1F5] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#04123F] text-[9px] font-extrabold text-[#FEC40B]">NS</span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">Operasional</p>
              <p className="text-[13px] font-bold text-[#04123F]">Pesanan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-lg bg-[#F1F5F9] px-2.5 py-1.5 text-[9px] font-medium text-[#94A3B8] sm:block">
              Cari pesanan…
            </span>
            <span className="rounded-lg bg-[#FEC40B] px-2.5 py-1.5 text-[10px] font-bold text-[#04123F] shadow-sm shadow-[#FEC40B]/40">
              + Tambah Pesanan
            </span>
          </div>
        </div>
        {/* Strip KPI mini */}
        <div className="grid grid-cols-3 gap-2 border-b border-[#EEF1F5] bg-[#F8FAFC] px-3 py-2.5">
          {kpi.map(([label, val, warna]) => (
            <div key={label} className="rounded-xl bg-white px-2.5 py-2 ring-1 ring-[#EEF1F5]">
              <p className="text-[8px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
              <p className={`text-[14px] font-extrabold tabular-nums ${warna}`}>{val}</p>
            </div>
          ))}
        </div>
        {/* Isi: sidebar mini + tabel */}
        <div className="flex">
          <div className="hidden w-28 shrink-0 bg-[#04123F] p-3 sm:block">
            <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">Operasional</p>
            <div className="mt-2 space-y-1.5">
              <div className="rounded-lg bg-[#FEC40B] px-2 py-1.5 text-[9px] font-bold text-[#04123F]">Pesanan</div>
              {["Maklon", "Kalkulator HPP", "Jadwal", "Pengiriman"].map((m) => (
                <div key={m} className="rounded-lg px-2 py-1.5 text-[9px] font-medium text-white/70">{m}</div>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 p-3">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[8px] uppercase tracking-wide text-[#94A3B8]">
                  <th className="py-1.5 font-semibold">Kode</th>
                  <th className="py-1.5 font-semibold">Customer</th>
                  <th className="py-1.5 font-semibold">Progres</th>
                  <th className="py-1.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-medium text-[#1E293B]">
                {[
                  ["NS-2410", "TNT Sport", 7, 4_140_000, "Jahit"],
                  ["NS-2409", "FC Garuda Muda", 4, 2_420_000, "Print"],
                  ["NS-2408", "Komunitas Grid", 11, 1_980_000, "Kirim"],
                ].map(([kode, cust, tahap, total, status], i) => (
                  <tr key={kode as string} className={i % 2 ? "bg-[#F8FAFC]" : ""}>
                    <td className="py-2.5 font-bold text-[#04123F]">{kode}</td>
                    <td className="py-2.5">{cust}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div className="h-full rounded-full bg-[#FEC40B]" style={{ width: `${((tahap as number) / 11) * 100}%` }} />
                        </div>
                        <span className="text-[8px] text-[#94A3B8]">{tahap}/11</span>
                      </div>
                      <span className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[8px] font-bold ${i === 2 ? "bg-emerald-500/10 text-emerald-600" : "bg-[#04123F]/5 text-[#475569]"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{rp(total as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Floating cards — ditempel di sudut agar isi dashboard tetap kebaca */}
      <FloatCard className="-bottom-6 -left-3 w-44 px-3.5 py-3 sm:-left-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#FEC40B] text-[11px] font-extrabold text-[#04123F]">Rp</span>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-[#94A3B8]">Total HPP / pcs</p>
            <p className="text-[14px] font-extrabold text-[#04123F]">{rp(65_250)}</p>
          </div>
        </div>
      </FloatCard>
      <FloatCard className="-bottom-9 -right-3 w-48 px-3.5 py-3 sm:-right-5">
        <div className="flex items-start gap-2.5">
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#FEC40B] ring-4 ring-[#FEC40B]/20" />
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-[#94A3B8]">Notifikasi Deadline</p>
            <p className="text-[10px] font-semibold text-[#04123F]">NS-2410 · H-3 terkirim 08:00 WIB</p>
          </div>
        </div>
        <div className="mt-2 h-1 w-full rounded-full bg-[#FDE68A]" />
      </FloatCard>
    </div>
  );
}

/** Mockup kalkulator HPP: pilih variasi → total, margin, harga jual otomatis. */
export function MockupKalkulator() {
  const rows: [string, string, number | null][] = [
    ["Kain Atasan", "Premium", 21_250],
    ["Print/Press Atasan", "Atasan", 25_000],
    ["Jahit Atasan", "Basic", 9_000],
    ["DTF", "otomatis", 5_000],
    ["Lain-lain", "otomatis", 5_000],
  ];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-2xl shadow-[#04123F]/15 ring-1 ring-[#04123F]/10">
      <div className="mb-3 inline-flex rounded-xl bg-[#F1F5F9] p-1">
        {["Kalkulator", "Database HPP", "Daftar Kain"].map((t, i) => (
          <span key={t} className={`rounded-lg px-2.5 py-1 text-[9px] font-semibold ${i === 0 ? "bg-[#04123F] text-white" : "text-[#64748B]"}`}>
            {t}
          </span>
        ))}
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[8px] uppercase tracking-wide text-[#94A3B8]">
            <th className="py-1.5 font-semibold">Kategori</th>
            <th className="py-1.5 font-semibold">Variasi</th>
            <th className="py-1.5 text-right font-semibold">Harga</th>
          </tr>
        </thead>
        <tbody className="text-[10px] font-medium text-[#1E293B]">
          {rows.map(([kategori, variasi, harga]) => (
            <tr key={kategori} className="border-b border-[#F1F5F9]">
              <td className="py-2.5">{kategori}</td>
              <td className="py-2.5">
                <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-[9px]">{variasi}</span>
              </td>
              <td className="py-2.5 text-right font-bold tabular-nums text-[#04123F]">{harga != null ? rp(harga) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 space-y-1.5 border-t border-[#E2E8F0] pt-3 text-[11px]">
        <div className="flex justify-between font-bold text-[#04123F]">
          <span>Total HPP</span><span className="tabular-nums">{rp(65_250)}</span>
        </div>
        <div className="flex justify-between text-[#475569]">
          <span>Margin</span><span className="tabular-nums">{rp(50_000)}</span>
        </div>
        <div className="flex justify-between rounded-lg bg-[#FEC40B]/15 px-2 py-1.5 font-bold text-[#04123F]">
          <span>Harga Jual</span><span className="tabular-nums">{rp(115_250)}</span>
        </div>
      </div>
    </div>
  );
}

/** Bubble chat WhatsApp — dipakai section 5c dan preview di demo notifikasi. */
export function BubbleWA({ pesan, jam = "08:00" }: { pesan: string; jam?: string }) {
  return (
    <div className="rounded-2xl rounded-tr-sm bg-[#E7FFDB] px-3.5 py-2.5 shadow-sm">
      <p className="whitespace-pre-line text-[11px] leading-relaxed text-[#1F3D14]">{pesan}</p>
      <p className="mt-1 text-right text-[9px] text-[#5B7F4A]">{jam} ✓✓</p>
    </div>
  );
}

"use client";

/**
 * Section highlight landing:
 *   5  — Kalkulator HPP (badge "Fitur Baru")
 *   5b — Dari Excel ke Nexa Sport (perbandingan + contoh hitungan animasi)
 *   5c — Notifikasi Deadline Otomatis (gelap, countdown 08:00 WIB berjalan)
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { PENAWARAN, waLink } from "@/lib/penawaran-config";
import { Reveal, CountUp, rp } from "@/components/penawaran/Reveal";
import { MockupKalkulator, BubbleWA } from "@/components/penawaran/Mockups";

/* ══ 5. HIGHLIGHT KALKULATOR HPP ══ */
export function HppHighlight() {
  return (
    <section className="bg-[#04123F] py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <span className="rounded-full bg-[#FEC40B] px-3 py-1.5 text-[11.5px] font-bold text-[#04123F]">Fitur Baru</span>
          <h2 className="mt-4 text-[26px] font-extrabold tracking-tight text-white sm:text-[34px]">
            Kalkulator HPP — ganti Excel, hitung otomatis
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
            Pilih kain dan variasi per kategori, sisanya terisi sendiri. Total HPP, margin, dan harga jual dihitung realtime — tanpa rumus yang bisa ketimpa.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Kain dikelompokkan per kelas: Basic, Premium, Pro",
              "Margin nominal rupiah, harga jual langsung jadi",
              "Ubah harga sekali di Database HPP, semua hitungan ikut",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[14px] text-white/80">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-[11px] font-bold text-emerald-400">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <Link
            href="/penawaran/demo/hpp"
            className="mt-8 inline-block rounded-xl bg-[#FEC40B] px-6 py-3 text-[14.5px] font-bold text-[#04123F] transition hover:brightness-105 active:scale-[0.98]"
          >
            Coba Kalkulatornya di Demo
          </Link>
        </Reveal>
        <Reveal delay={150}>
          <MockupKalkulator />
        </Reveal>
      </div>
    </section>
  );
}

/* ══ 5b. DARI EXCEL KE NEXA SPORT ══ */
const BANDING = [
  ["Pilihan kain", "Hanya Basic/Premium/Pro", "Dropdown per kelas dengan nama kain asli: JARUM, MILANO, PUMA, JAQUARD, dst."],
  ["Keamanan rumus", "Rawan rumus tertimpa atau baris bergeser", "Harga diedit lewat form — rumus terkunci, gak bisa rusak."],
  ["Akses", "File dikirim lewat WA, versi beda-beda", "Satu data terpusat, bisa dari HP dan banyak orang sekaligus."],
  ["Nyambung ke produksi", "Berdiri sendiri", "HPP langsung terhubung ke Pesanan, Jadwal Produksi, dan Laporan."],
  ["Update harga", "Ubah manual di banyak tempat", "Ubah sekali di Database HPP, semua hitungan ikut berubah."],
];

export function ExcelToNexa() {
  return (
    <section className="bg-[#071B50] py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <h2 className="text-center text-[26px] font-extrabold tracking-tight text-white sm:text-[34px]">
            Masih hitung HPP pakai Excel? Waktunya naik kelas.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-[#EEF1F5] bg-white shadow-sm">
            <div className="grid grid-cols-[1fr_1.1fr] sm:grid-cols-[0.8fr_1fr_1.2fr]">
              <div className="hidden border-b border-[#EEF1F5] bg-[#F1F5F9] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-[#94A3B8] sm:block" />
              <div className="border-b border-r border-[#EEF1F5] bg-[#F1F5F9] px-4 py-3 text-[12px] font-bold text-[#64748B]">Excel</div>
              <div className="border-b border-[#EEF1F5] bg-[#FEC40B]/20 px-4 py-3 text-[12px] font-bold text-[#04123F]">Nexa Sport</div>
            </div>
            {BANDING.map(([label, excel, nexa], i) => (
              <div key={label} className={`grid grid-cols-[1fr_1.1fr] sm:grid-cols-[0.8fr_1fr_1.2fr] ${i % 2 ? "bg-[#FAFBFC]" : ""}`}>
                <div className="hidden border-b border-r border-[#EEF1F5] px-4 py-3.5 text-[12.5px] font-bold text-[#04123F] sm:block">{label}</div>
                <div className="border-b border-r border-[#EEF1F5] px-4 py-3.5 text-[12.5px] text-[#64748B]">
                  <span className="mb-1 inline-flex items-center gap-1 text-[11px] font-bold text-red-400 sm:hidden">{label}</span>
                  <span className="mr-1.5 inline text-[11px] font-bold text-red-400">✕</span>
                  {excel}
                </div>
                <div className="border-b border-[#EEF1F5] bg-[#FEC40B]/10 px-4 py-3.5 text-[12.5px] font-medium text-[#04123F]">
                  <span className="mr-1.5 inline text-[11px] font-bold text-emerald-600">✓</span>
                  {nexa}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Contoh hitungan dengan angka nyata, animasi menghitung naik */}
        <Reveal delay={150}>
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#04123F]/10 bg-white p-6 shadow-lg shadow-[#04123F]/5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Contoh hitungan nyata</p>
            <div className="mt-4 space-y-2.5 text-[13.5px]">
              {[
                ["Kain Atasan Premium", 21_250],
                ["Print/Press Atasan", 25_000],
                ["Jahit Atasan Basic", 9_000],
                ["DTF", 5_000],
                ["Lain-lain", 5_000],
              ].map(([label, nilai]) => (
                <div key={label as string} className="flex justify-between text-[#475569]">
                  <span>{label}</span>
                  <CountUp to={nilai as number} prefix="Rp" />
                </div>
              ))}
              <div className="flex justify-between border-t border-[#EEF1F5] pt-3 font-bold text-[#04123F]">
                <span>Total HPP</span><CountUp to={65_250} prefix="Rp" />
              </div>
              <div className="flex justify-between text-[#475569]">
                <span>Margin</span><CountUp to={50_000} prefix="Rp" duration={900} />
              </div>
              <div className="flex justify-between rounded-xl bg-[#FEC40B]/15 px-3 py-2.5 font-extrabold text-[#04123F]">
                <span>Harga Jual</span><CountUp to={115_250} prefix="Rp" duration={1_500} />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-8 text-center">
            <Link
              href="/penawaran/demo/hpp"
              className="inline-block rounded-xl bg-[#FEC40B] px-7 py-3.5 text-[15px] font-bold text-[#04123F] shadow-md shadow-amber-200 transition hover:brightness-105 active:scale-[0.98]"
            >
              Coba Kalkulatornya di Demo
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══ 5c. NOTIFIKASI DEADLINE OTOMATIS ══ */

/** Detik menuju pukul 08:00 WIB berikutnya (WIB = UTC+7, dihitung dari UTC). */
function useCountdownKe08Wib() {
  const [sisa, setSisa] = useState<[number, number, number] | null>(null);
  const [besok, setBesok] = useState(true);

  useEffect(() => {
    const target = () => {
      const now = Date.now();
      // Waktu dinding WIB = epoch + 7 jam; "jam:menit" WIB dibaca via getUTC*.
      const wib = new Date(now + 7 * 3_600_000);
      const t = new Date(wib);
      t.setUTCHours(8, 0, 0, 0);
      let besokBaru = true;
      if (t.getTime() <= wib.getTime()) {
        t.setUTCDate(t.getUTCDate() + 1);
      } else {
        besokBaru = false;
      }
      setBesok(besokBaru);
      return t.getTime() - 7 * 3_600_000; // kembali ke epoch asli
    };
    let t = target();
    const tick = () => {
      const ms = t - Date.now();
      const total = Math.max(0, Math.floor(ms / 1_000));
      setSisa([
        Math.floor(total / 3_600),
        Math.floor((total % 3_600) / 60),
        total % 60,
      ]);
      if (ms <= 0) t = target();
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  return { sisa, besok };
}

export function DeadlineNotif() {
  const { sisa, besok } = useCountdownKe08Wib();

  return (
    <section className="bg-[#04123F] py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <span className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
            Untuk kepala produksi
          </span>
          <h2 className="mt-4 max-w-xl text-[26px] font-extrabold tracking-tight text-white sm:text-[34px]">
            Nggak ada lagi deadline yang kelewat.
          </h2>
          <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-white/65">
            Sistem mengingatkan penanggung jawab produksi lewat WhatsApp otomatis di H-3, H-2, dan H-1 sebelum deadline — terkirim jam 08:00 WIB.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div
            className="mt-10 overflow-hidden rounded-2xl border border-white/10"
            style={{ background: "linear-gradient(120deg, #04123F 0%, #23134A 55%, #5C1220 100%)" }}
          >
            {/* Pola grid halus */}
            <div
              className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            >
              {/* Kiri: manfaat */}
              <div>
                <ul className="space-y-3.5">
                  {[
                    "Kepala produksi tahu order mana yang mepet — tanpa buka app",
                    "Gak bergantung ingatan atau catatan manual",
                    "Bisa dimatikan/dinyalakan kapan saja",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[14px] text-white/85">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#FEC40B] text-[11px] font-bold text-[#04123F]">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[["08:00 WIB", "Jadwal kirim"], ["1 admin", "Penerima"], ["H-3 · H-2 · H-1", "Reminder"]].map(([v, l]) => (
                    <div key={l} className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2">
                      <p className="text-[13px] font-bold text-white">{v}</p>
                      <p className="text-[10px] uppercase tracking-wide text-white/50">{l}</p>
                    </div>
                  ))}
                </div>
                {/* Kotak countdown */}
                <div className="mt-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Notifikasi berikutnya</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    {[["JAM", sisa?.[0]], ["MENIT", sisa?.[1]], ["DETIK", sisa?.[2]]].map(([label, val]) => (
                      <div key={label as string} className="min-w-[62px] rounded-xl border border-white/15 bg-black/25 px-3 py-2.5 text-center">
                        <p className="text-[20px] font-extrabold tabular-nums text-white">
                          {val == null ? "--" : String(val).padStart(2, "0")}
                        </p>
                        <p className="text-[9px] font-bold tracking-widest text-white/50">{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[11.5px] text-white/55">
                    kirim {besok ? "besok" : "hari ini"} pukul 08:00 WIB
                  </p>
                </div>
              </div>

              {/* Kanan: mockup bubble WA */}
              <div className="rounded-2xl bg-[#111B21] p-4">
                <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#25D366]/20 text-[11px] font-bold text-[#25D366]">NS</span>
                  <div>
                    <p className="text-[12px] font-bold text-white">Nexa Sport — Deadline</p>
                    <p className="text-[10px] text-white/40">online</p>
                  </div>
                </div>
                <BubbleWA
                  pesan={
                    "PENGINGAT DEADLINE H-3\n" +
                    "Order NS-2410 — TNT Sport\n" +
                    "Produk: Jersey Setelan (36 pcs)\n" +
                    "Tahap saat ini: Jahit / Sewing\n" +
                    "Deadline: 3 hari lagi\n" +
                    "Mohon pantau progresnya hari ini."
                  }
                />
                <div className="mt-2.5">
                  <BubbleWA
                    pesan={
                      "PENGINGAT DEADLINE H-2\n" +
                      "Order NS-2410 — TNT Sport\n" +
                      "Sisa 2 hari sebelum deadline."
                    }
                    jam="08:00"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 text-center">
            <Link
              href="/penawaran/demo/notifikasi"
              className="inline-block rounded-xl bg-[#FEC40B] px-7 py-3.5 text-[15px] font-bold text-[#04123F] shadow-md shadow-black/20 transition hover:brightness-105 active:scale-[0.98]"
            >
              Lihat Notifikasi di Demo
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

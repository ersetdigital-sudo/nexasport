"use client";

/**
 * Landing penjualan /penawaran — section 1–4, 6–11, CTA band, harga,
 * testimoni, FAQ, footer, dan tombol WhatsApp floating.
 * Tema: Deep Navy #04123F + Honey Gold #FEC40B (palet brand Nexa Sport).
 * Semua teks gampang diedit di lib/penawaran-config.ts.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PENAWARAN, waLink } from "@/lib/penawaran-config";
import { Reveal, CountUp } from "@/components/penawaran/Reveal";
import { MockupDashboard } from "@/components/penawaran/Mockups";
import { HppHighlight, ExcelToNexa, DeadlineNotif } from "@/components/penawaran/HppSections";

const MENU = [
  { label: "Fitur", href: "#fitur" },
  { label: "Demo", href: "/penawaran/demo" },
  { label: "Harga", href: "#harga" },
  { label: "FAQ", href: "#faq" },
];

const PAIN = [
  { judul: "HPP sering salah hitung", teks: "Rumus Excel ketimpa, baris bergeser, harga kain lupa diupdate — harga jual jadi ngawur." },
  { judul: "Orderan numpuk di chat WA", teks: "Detail order tersebar di puluhan chat: ukuran, desain, revisi — gampang ada yang kelewat." },
  { judul: "Jadwal produksi berantakan", teks: "Nggak jelas order mana yang harus didahulukan, mesin jadi idle atau mepet deadline." },
  { judul: "Lupa update status kirim", teks: "Customer tanya \"pack-nya udah dikirim belum?\" dan kamu harus buka-buka catatan dulu." },
];

const FITUR = [
  { judul: "Pesanan", teks: "Tracking 11 tahap produksi — dari desain sampai kirim, statusnya live." },
  { judul: "Maklon", teks: "Kelola orderan maklon dengan progres per tahap yang jelas." },
  { judul: "Kalkulator HPP", teks: "Hitung HPP & harga jual otomatis — ganti Excel, tanpa rumus rusak." },
  { judul: "Jadwal Produksi", teks: "Atur urutan kerja per minggu biar mesin gak nganggur." },
  { judul: "Pengiriman", teks: "Resi, ekspedisi, dan status kirim terpusat — tinggal copas ke customer." },
  { judul: "Laporan", teks: "Omzet, profit, dan rata-rata HPP tersaji otomatis." },
  { judul: "Notifikasi Deadline", teks: "Pengingat WhatsApp ke penanggung jawab di H-3, H-2, H-1." },
];

const FAQ = [
  ["Perlu install aplikasi?", "Gak perlu. Nexa Sport jalan di browser — dari laptop maupun HP, tinggal login."],
  ["Data produksi saya aman?", "Aman. Data tersimpan terpusat dengan akses berbasis akun; demo di halaman ini murni data contoh tanpa koneksi ke data siapa pun."],
  ["Bisa disesuaikan dengan alur konveksi saya?", "Bisa. Alur produksi, kategori HPP, dan laporan bisa kami sesuaikan saat setup — gratis untuk paket berapa pun."],
  ["Ada pelatihan untuk tim?", "Ada. Kami dampingi lewat WhatsApp + sesi onboarding singkat sampai tim kamu terbiasa."],
  ["Bisa dipakai banyak orang sekaligus?", "Bisa. Sesuai paket: mulai 1 admin di Starter, hingga 5 user di Pro, tanpa batas di Custom."],
  ["Cara bayar gimana?", "Bisa transfer bank, QRIS, atau bayar per bulan. Untuk komunitas ada skema harga spesial — chat aja dulu."],
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Kunci scroll saat menu mobile terbuka.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div
      className="min-h-screen bg-[#04123F] text-[#A9B6D9] antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif" }}
    >
      {/* ══ 1. NAVBAR ══ */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#04123F]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="/penawaran" className="flex items-center">
            <img src="/nexa-sport-logo.png" alt="Nexa Sport" className="h-8 w-auto" />
          </a>
          <nav className="hidden items-center gap-7 text-[14px] font-semibold text-white/70 md:flex">
            {MENU.map((m) =>
              m.href.startsWith("#") ? (
                <a key={m.label} href={m.href} className="transition hover:text-white">{m.label}</a>
              ) : (
                <Link key={m.label} href={m.href} className="transition hover:text-white">{m.label}</Link>
              )
            )}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/penawaran/demo"
              className="rounded-xl bg-[#FEC40B] px-4 py-2.5 text-[14px] font-bold text-[#04123F] shadow-sm shadow-black/20 transition hover:brightness-105 active:scale-[0.98]"
            >
              Coba Demo
            </Link>
            <button
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white/80 md:hidden"
              aria-label="Buka menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-white/10 bg-[#04123F] px-5 py-3 md:hidden">
            {MENU.map((m) =>
              m.href.startsWith("#") ? (
                <a key={m.label} href={m.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-2 py-2.5 text-[15px] font-semibold text-white/75">
                  {m.label}
                </a>
              ) : (
                <Link key={m.label} href={m.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-2 py-2.5 text-[15px] font-semibold text-white/75">
                  {m.label}
                </Link>
              )
            )}
          </nav>
        )}
      </header>

      {/* ══ 2. HERO ══ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A2058] to-[#04123F]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-2">
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FEC40B]" />
              {PENAWARAN.tntSport}
            </p>
            <h1 className="text-[34px] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[44px]">
              Hitung HPP, atur produksi, dan kirim orderan jersey tanpa ribet spreadsheet.
            </h1>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-white/65">
              Nexa Sport memantau 11 tahap produksi dari order sampai kirim, dan menggantikan hitungan HPP di Excel dengan kalkulator otomatis yang rumusnya gak bisa rusak.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/penawaran/demo"
                className="rounded-xl bg-[#FEC40B] px-6 py-3.5 text-[15px] font-bold text-[#04123F] shadow-md shadow-black/30 transition hover:brightness-105 active:scale-[0.98]"
              >
                Coba Demo Gratis
              </Link>
              <a
                href={waLink()}
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                Chat WhatsApp
              </a>
            </div>
            <p className="mt-5 text-[12.5px] text-white/45">
              Tanpa daftar · Data demo contoh · {PENAWARAN.tntSport}
            </p>
          </Reveal>
          <Reveal delay={150}>
            <MockupDashboard />
          </Reveal>
        </div>
      </section>

      {/* ══ 3. PAIN POINTS ══ */}
      <section className="bg-[#04123F] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="max-w-xl text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
              Keseharian konveksi yang bikin margin bocor
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PAIN.map((p, i) => (
              <Reveal key={p.judul} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/10 bg-[#0A2058] p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/15 text-[15px] font-bold text-red-400">✕</div>
                  <h3 className="mt-4 text-[15.5px] font-bold text-white">{p.judul}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{p.teks}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. SOLUSI / FITUR ══ */}
      <section id="fitur" className="bg-[#071B50] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/40">Solusi</p>
            <h2 className="mt-2 max-w-xl text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
              Satu app untuk semua puses produksi
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FITUR.map((f, i) => (
              <Reveal key={f.judul} delay={i * 60}>
                <div className="h-full rounded-2xl border border-white/10 bg-[#04123F] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FEC40B] text-[15px] font-bold text-[#04123F]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-4 text-[15.5px] font-bold text-white">{f.judul}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{f.teks}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5, 5b, 5c — HIGHLIGHT KALKULATOR HPP ══ */}
      <HppHighlight />
      <ExcelToNexa />
      <DeadlineNotif />

      {/* ══ 6. CARA KERJA ══ */}
      <section className="bg-[#04123F] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-center text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
              Mulainya gampang, 3 langkah
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              ["Coba demo", "Mainkan demo interaktifnya langsung — tanpa daftar, tanpa install."],
              ["Kami setup sesuai bisnis kamu", "Alur produksi, kategori HPP, dan laporan kami rapikan bareng kamu."],
              ["Mulai dipakai tim", "Tim produksi pakai dari HP masing-masing, datanya satu dan live."],
            ].map(([judul, teks], i) => (
              <Reveal key={judul} delay={i * 100}>
                <div className="relative rounded-2xl border border-white/10 bg-[#0A2058] p-6 text-center">
                  <span className="absolute -top-5 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-[#FEC40B] text-[15px] font-extrabold text-[#04123F] shadow-md">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-[15.5px] font-bold text-white">{judul}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{teks}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. DEMO CTA BAND ══ */}
      <section className="bg-[#071B50] py-16">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <Reveal>
            <h2 className="text-[26px] font-extrabold tracking-tight text-white sm:text-[34px]">
              Rasain langsung appnya, tanpa daftar
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] text-white/60">
              Demo interaktif dengan data contoh jersey custom — coba ganti-ganti, reset kapan saja.
            </p>
            <Link
              href="/penawaran/demo"
              className="mt-7 inline-block rounded-xl bg-[#FEC40B] px-8 py-3.5 text-[15px] font-bold text-[#04123F] shadow-lg shadow-black/30 transition hover:brightness-105 active:scale-[0.98]"
            >
              Coba Demo Sekarang
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══ 8. HARGA ══ */}
      <section id="harga" className="bg-[#04123F] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <div className="text-center">
              <span className="rounded-full bg-[#FEC40B] px-3.5 py-1.5 text-[12px] font-bold text-[#04123F]">
                Harga Spesial Komunitas
              </span>
              <h2 className="mt-4 text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
                Harga jujur, fitur beres
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PENAWARAN.paket.map((p, i) => (
              <Reveal key={p.nama} delay={i * 80}>
                <div
                  className={
                    "relative h-full rounded-2xl border p-6 " +
                    (p.highlight
                      ? "border-[#FEC40B] bg-[#0A2058] text-white shadow-xl shadow-black/40"
                      : "border-white/10 bg-[#071B50]")
                  }
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-6 rounded-full bg-[#FEC40B] px-3 py-1 text-[11px] font-bold text-[#04123F]">
                      Paling Dipilih
                    </span>
                  )}
                  <h3 className={`text-[16px] font-bold ${p.highlight ? "text-white" : "text-white"}`}>{p.nama}</h3>
                  <p className={`mt-1 text-[12.5px] ${p.highlight ? "text-white/60" : "text-white/50"}`}>{p.desc}</p>
                  <p className="mt-4">
                    <span className={`text-[30px] font-extrabold tracking-tight ${p.highlight ? "text-[#FEC40B]" : "text-white"}`}>{p.harga}</span>
                    <span className={`text-[13px] ${p.highlight ? "text-white/60" : "text-white/50"}`}>{p.periode}</span>
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {p.fitur.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-[13.5px] ${p.highlight ? "text-white/85" : "text-white/70"}`}>
                        <span className="text-[#FEC40B]">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={waLink(`Halo, saya tertarik paket ${p.nama} Nexa Sport.`)}
                    className={
                      "mt-6 block rounded-xl py-3 text-center text-[14px] font-bold transition active:scale-[0.98] " +
                      (p.highlight
                        ? "bg-[#FEC40B] text-[#04123F] hover:brightness-105"
                        : "border border-white/20 text-white hover:border-[#FEC40B]")
                    }
                  >
                    Tanya Paket {p.nama}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. TESTIMONI ══ */}
      <section className="bg-[#071B50] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-center text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
              Kata mereka yang udah cobain
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              ["Andi P.", "Owner TNT Sport", "\u201CTracking 11 tahapnya bikin saya gak perlu tanya-tanya kepala produksi lagi. Semua kelihatan dari HP.\u201D"],
              ["Rina K.", "Brand jersey lokal", "\u201CKalkulator HPP-nya nggantin 3 sheet Excel saya. Harga jual sekarang konsisten, gak asal tebak.\u201D"],
              ["Bagus W.", "Konveksi maklon", "\u201COrderan maklon yang tadinya campur aduk di chat sekarang rapi, statusnya jelas per tahap.\u201D"],
            ].map(([nama, usaha, kutip], i) => (
              <Reveal key={nama} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/10 bg-[#04123F] p-6">
                  <p className="text-[14px] leading-relaxed text-white/80">{kutip}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FEC40B] text-[12px] font-bold text-[#04123F]">
                      {(nama as string).charAt(0)}
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold text-white">{nama}</p>
                      <p className="text-[11.5px] text-white/45">{usaha}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-2xl border border-white/10 bg-[#04123F] px-8 py-6 text-center shadow-sm">
              {[
                [<CountUp key="a" to={2400} suffix="+" />, "order terkelola"],
                [<CountUp key="b" to={320} suffix=" jam" />, "kerja admin dihemat"],
                [<CountUp key="c" to={11} />, "tahap produksi terpantau"],
              ].map(([angka, label], i) => (
                <div key={i}>
                  <p className="text-[24px] font-extrabold text-[#FEC40B]">{angka}</p>
                  <p className="text-[12px] text-white/45">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 10. FAQ ══ */}
      <section id="faq" className="bg-[#04123F] py-20">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal>
            <h2 className="text-center text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
              Pertanyaan yang sering muncul
            </h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {FAQ.map(([q, a]) => (
              <Faq key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ 11. CTA PENUTUP + FOOTER ══ */}
      <section className="bg-gradient-to-b from-[#04123F] to-[#0A2058] py-20">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <Reveal>
            <h2 className="text-[28px] font-extrabold tracking-tight text-white sm:text-[36px]">
              Waktunya tinggalin spreadsheet.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] text-white/60">
              Coba demo-nya sekarang — kalau cocok, chat kami dan kita setup bareng.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/penawaran/demo" className="rounded-xl bg-[#FEC40B] px-7 py-3.5 text-[15px] font-bold text-[#04123F] shadow-lg shadow-black/30 transition hover:brightness-105 active:scale-[0.98]">
                Coba Demo Gratis
              </Link>
              <a href={waLink()} className="rounded-xl border border-white/25 px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10 active:scale-[0.98]">
                Chat WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-[#020B2A] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 sm:flex-row">
          <div>
            <img src="/nexa-sport-logo.png" alt="Nexa Sport" className="h-8 w-auto" />
            <p className="mt-2 text-[12px] text-white/40">{PENAWARAN.tntSport} · © {new Date().getFullYear()} Nexa Sport</p>
          </div>
          <div className="flex items-center gap-3">
            <a href={waLink()} className="rounded-xl border border-white/20 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/10">
              WhatsApp
            </a>
            <Link href="/penawaran/demo" className="rounded-xl bg-[#FEC40B] px-4 py-2.5 text-[13px] font-bold text-[#04123F] transition hover:brightness-105">
              Coba Demo
            </Link>
          </div>
        </div>
      </footer>

      {/* Tombol WhatsApp floating */}
      <a
        href={waLink()}
        aria-label="Chat WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition hover:scale-105 active:scale-95"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.6-.7c.1-.2.1-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2-1 3.1.3 1.6 1.3 3.1 2.4 4.1 1.5 1.4 3 2 4.5 2.1 1 .1 2-.3 2.7-1.1.3-.4.5-.8.4-1.2l-.4-.6Z" />
        </svg>
      </a>
    </div>
  );
}

/** Satu item FAQ accordion. */
function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0A2058]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-[14.5px] font-bold text-white">{q}</span>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-[#FEC40B] transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <p className="overflow-hidden px-5 pb-4 text-[13.5px] leading-relaxed text-white/60">{a}</p>
      </div>
    </div>
  );
}

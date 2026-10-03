"use client";

/**
 * Landing penjualan /penawaran — semua section, CTA band, harga, testimoni,
 * FAQ, footer, dan tombol WhatsApp floating. Tema: navy #04123F + emas
 * #FEC40B untuk hero/CTA, section isi dipecah dengan latar terang supaya
 * tidak gelap menyeluruh. SEMUA teks tinggal edit di lib/penawaran-config.ts.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PENAWARAN, waLink } from "@/lib/penawaran-config";
import { Reveal } from "@/components/penawaran/Reveal";
import { MockupDashboard } from "@/components/penawaran/Mockups";
import { HppHighlight, ExcelToNexa, DeadlineNotif } from "@/components/penawaran/HppSections";

const { navbar, hero, pain, fitur, harga, testimoni, faq, ctaAkhir } = PENAWARAN;

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
      className="min-h-screen bg-white text-[#3B4A66] antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif" }}
    >
      {/* ══ 1. NAVBAR ══ */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#04123F]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="/penawaran" className="flex items-center">
            <img src="/nexa-sport-logo.png" alt="Nexa Sport" className="h-10 w-auto" />
          </a>
          <nav className="hidden items-center gap-7 text-[14px] font-semibold text-white/70 md:flex">
            {navbar.menu.map((m) =>
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
              {navbar.cta}
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
            {navbar.menu.map((m) =>
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
              {hero.badge}
            </p>
            <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[42px]">
              {hero.headline}
            </h1>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-white/70">
              {hero.subheadline}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/penawaran/demo"
                className="rounded-xl bg-[#FEC40B] px-6 py-3.5 text-[15px] font-bold text-[#04123F] shadow-md shadow-black/30 transition hover:brightness-105 active:scale-[0.98]"
              >
                {hero.ctaUtama}
              </Link>
              <a
                href={waLink()}
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                {hero.ctaKedua}
              </a>
            </div>
            {/* Tiga poin kecil: satu baris di desktop, ditumpuk di mobile */}
            <ul className="mt-6 flex flex-col gap-2 text-[13px] font-semibold text-white/75 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-0">
              {hero.poin.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[#FEC40B]/20 text-[10px] font-bold text-[#FEC40B]">✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] text-white/50">{hero.catatan}</p>
          </Reveal>
          <Reveal delay={150}>
            <MockupDashboard />
          </Reveal>
        </div>
      </section>

      {/* ══ 3. PAIN POINTS ══ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="max-w-xl text-[26px] font-extrabold tracking-tight text-[#04123F] sm:text-[32px]">
              {pain.judul}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pain.kartu.map((p, i) => (
              <Reveal key={p.judul} delay={i * 80}>
                <div className="h-full rounded-2xl border border-[#E8ECF4] bg-[#F7F9FD] p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#04123F]/10">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/10 text-[15px] font-bold text-red-500">✕</div>
                  <h3 className="mt-4 text-[15.5px] font-bold text-[#04123F]">{p.judul}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#5A6784]">{p.teks}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. SOLUSI / FITUR ══ */}
      <section id="fitur" className="bg-[#F3F6FB] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#04123F]/50">Solusi</p>
            <h2 className="mt-2 max-w-xl text-[26px] font-extrabold tracking-tight text-[#04123F] sm:text-[32px]">
              {fitur.judul}
            </h2>
            <p className="mt-2 text-[14.5px] text-[#5A6784]">{fitur.sub}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fitur.kartu.map((f, i) => (
              <Reveal key={f.judul} delay={i * 60}>
                <div className="h-full rounded-2xl border border-[#E8ECF4] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#04123F]/10">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FEC40B] text-[15px] font-bold text-[#04123F]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-4 text-[15.5px] font-bold text-[#04123F]">{f.judul}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#5A6784]">{f.teks}</p>
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
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-center text-[26px] font-extrabold tracking-tight text-[#04123F] sm:text-[32px]">
              {PENAWARAN.caraKerja.judul}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {PENAWARAN.caraKerja.langkah.map((langkah, i) => (
              <Reveal key={langkah.judul} delay={i * 100}>
                <div className="relative rounded-2xl border border-[#E8ECF4] bg-[#F7F9FD] p-6 pt-8 text-center">
                  <span className="absolute -top-5 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-[#FEC40B] text-[15px] font-extrabold text-[#04123F] shadow-md">
                    {i + 1}
                  </span>
                  <h3 className="text-[15.5px] font-bold text-[#04123F]">{langkah.judul}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#5A6784]">{langkah.teks}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. DEMO CTA BAND ══ */}
      <section className="bg-[#04123F] py-16">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <Reveal>
            <h2 className="text-[26px] font-extrabold tracking-tight text-white sm:text-[34px]">
              {PENAWARAN.demoBand.judul}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] text-white/65">
              {PENAWARAN.demoBand.sub}
            </p>
            <Link
              href="/penawaran/demo"
              className="mt-7 inline-block rounded-xl bg-[#FEC40B] px-8 py-3.5 text-[15px] font-bold text-[#04123F] shadow-lg shadow-black/30 transition hover:brightness-105 active:scale-[0.98]"
            >
              {PENAWARAN.demoBand.cta}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══ 8. HARGA ══ */}
      <section id="harga" className="bg-[#F3F6FB] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <div className="text-center">
              <span className="rounded-full bg-[#FEC40B] px-3.5 py-1.5 text-[12px] font-bold text-[#04123F]">
                Harga Spesial Komunitas
              </span>
              <h2 className="mt-4 text-[26px] font-extrabold tracking-tight text-[#04123F] sm:text-[32px]">
                {harga.judul}
              </h2>
              <p className="mt-2 text-[14.5px] text-[#5A6784]">{harga.sub}</p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PENAWARAN.paket.map((p, i) => (
              <Reveal key={p.nama} delay={i * 80}>
                <div
                  className={
                    "relative h-full rounded-2xl border p-6 " +
                    (p.highlight
                      ? "border-[#FEC40B] bg-white shadow-xl shadow-[#04123F]/10"
                      : "border-[#E8ECF4] bg-white")
                  }
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-6 rounded-full bg-[#FEC40B] px-3 py-1 text-[11px] font-bold text-[#04123F]">
                      {harga.badgeHighlight}
                    </span>
                  )}
                  <h3 className="text-[16px] font-bold text-[#04123F]">{p.nama}</h3>
                  <p className="mt-1 text-[12.5px] text-[#5A6784]">{p.desc}</p>
                  <p className="mt-4">
                    <span className={`text-[30px] font-extrabold tracking-tight ${p.highlight ? "text-[#04123F]" : "text-[#04123F]"}`}>{p.harga}</span>
                    <span className="ml-1.5 text-[12.5px] font-semibold text-[#94A3B8]">{p.periode}</span>
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {p.fitur.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13.5px] text-[#3B4A66]">
                        <span className="text-[#B98A00]">✓</span>
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
                        : "border border-[#04123F]/20 text-[#04123F] hover:border-[#FEC40B]")
                    }
                  >
                    {p.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <p className="mx-auto mt-8 max-w-2xl text-center text-[12px] leading-relaxed text-[#8794AE]">
              {harga.catatan}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ 9. TESTIMONI (contoh — mudah diganti lewat config) ══ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-center text-[26px] font-extrabold tracking-tight text-[#04123F] sm:text-[32px]">
              {testimoni.judul}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {testimoni.items.map((t, i) => (
              <Reveal key={t.nama} delay={i * 80}>
                <div className="h-full rounded-2xl border border-[#E8ECF4] bg-[#F7F9FD] p-6">
                  <span className="rounded-full border border-[#04123F]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5A6784]">
                    {testimoni.label}
                  </span>
                  <p className="mt-4 text-[14px] leading-relaxed text-[#3B4A66]">“{t.kutip}”</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FEC40B] text-[12px] font-bold text-[#04123F]">
                      {t.nama.charAt(0)}
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold text-[#04123F]">{t.nama}</p>
                      <p className="text-[11.5px] text-[#8794AE]">{t.usaha}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {/* Poin faktual dari app — bukan angka klaim */}
          <Reveal delay={200}>
            <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-2xl border border-[#E8ECF4] bg-white px-8 py-6 text-center shadow-sm">
              {[
                ["11", "tahap produksi terpantau"],
                ["H-3 · H-2 · H-1", "pengingat deadline otomatis"],
                ["08:00 WIB", "jadwal kirim WhatsApp"],
              ].map(([angka, label]) => (
                <div key={label}>
                  <p className="text-[22px] font-extrabold text-[#04123F]">{angka}</p>
                  <p className="text-[12px] text-[#8794AE]">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 10. FAQ ══ */}
      <section id="faq" className="bg-[#F3F6FB] py-20">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal>
            <h2 className="text-center text-[26px] font-extrabold tracking-tight text-[#04123F] sm:text-[32px]">
              Pertanyaan yang sering ditanya
            </h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {faq.map(([q, a]) => (
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
              {ctaAkhir.judul}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] text-white/65">
              {ctaAkhir.sub}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/penawaran/demo" className="rounded-xl bg-[#FEC40B] px-7 py-3.5 text-[15px] font-bold text-[#04123F] shadow-lg shadow-black/30 transition hover:brightness-105 active:scale-[0.98]">
                {ctaAkhir.ctaUtama}
              </Link>
              <a href={waLink()} className="rounded-xl border border-white/25 px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10 active:scale-[0.98]">
                {ctaAkhir.ctaKedua}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-[#020B2A] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 sm:flex-row">
          <div>
            <img src="/nexa-sport-logo.png" alt="Nexa Sport" className="h-9 w-auto" />
            <p className="mt-2 text-[12px] text-white/40">{hero.catatan} · © {new Date().getFullYear()} Nexa Sport</p>
          </div>
          <div className="flex items-center gap-3">
            <a href={waLink()} className="rounded-xl border border-white/20 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/10">
              WhatsApp
            </a>
            <Link href="/penawaran/demo" className="rounded-xl bg-[#FEC40B] px-4 py-2.5 text-[13px] font-bold text-[#04123F] transition hover:brightness-105">
              {navbar.cta}
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
    <div className="rounded-2xl border border-[#E8ECF4] bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-[14.5px] font-bold text-[#04123F]">{q}</span>
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#04123F]/5 text-[#04123F] transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <p className="overflow-hidden px-5 pb-4 text-[13.5px] leading-relaxed text-[#5A6784]">{a}</p>
      </div>
    </div>
  );
}

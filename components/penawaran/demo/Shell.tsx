"use client";

/**
 * Shell demo /penawaran/demo — tiru tampilan app asli: sidebar navy fixed,
 * banner "Mode Demo", drawer mobile, product tour singkat, dan toast.
 * Semuanya client-only & terisolasi (tidak menyentuh API/session app asli).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemo, useDemoToast, resetDemo, demoToast, tourSudahDitampilkan, tandaiTourSelesai } from "@/lib/demo-store";
import { waLink } from "@/lib/penawaran-config";

type MenuItem = { label: string; href: string; icon: React.ReactNode; grup: "OPERASIONAL" | "DATA"; badge?: true };

function Ikon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const MENU: MenuItem[] = [
  { grup: "OPERASIONAL", label: "Pesanan", href: "/penawaran/demo", icon: <Ikon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /> },
  { grup: "OPERASIONAL", label: "Maklon", href: "/penawaran/demo/maklon", icon: <Ikon d="M20 7l-8-4-8 4v10l8 4 8-4V7zM4 7l8 4 8-4M12 11v10" /> },
  { grup: "OPERASIONAL", label: "Kalkulator HPP", href: "/penawaran/demo/hpp", icon: <Ikon d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zM8 6h8M8 11h2m3 0h3M8 16h2m3 0h3" /> },
  { grup: "OPERASIONAL", label: "Jadwal Produksi", href: "/penawaran/demo/jadwal", icon: <Ikon d="M8 7V3m8 4V3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { grup: "OPERASIONAL", label: "Pengiriman", href: "/penawaran/demo/pengiriman", icon: <Ikon d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" /> },
  { grup: "DATA", label: "Customer", href: "/penawaran/demo/customer", icon: <Ikon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" /> },
  { grup: "DATA", label: "Laporan", href: "/penawaran/demo/laporan", icon: <Ikon d="M18 20V10M12 20V4M6 20v-6" /> },
  { grup: "DATA", label: "Notifikasi", href: "/penawaran/demo/notifikasi", icon: <Ikon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /> },
  { grup: "DATA", label: "Pengaturan", href: "/penawaran/demo/pengaturan", icon: <Ikon d="M12 9a3 3 0 100 6 3 3 0 000-6zM19 12a7 7 0 01-.1 1.2l2 1.6-2 3.4-2.4-1a7 7 0 01-2 1.2L14 21h-4l-.5-2.6a7 7 0 01-2-1.2l-2.4 1-2-3.4 2-1.6A7 7 0 015 12c0-.4 0-.8.1-1.2l-2-1.6 2-3.4 2.4 1a7 7 0 012-1.2L10 3h4l.5 2.6a7 7 0 012 1.2l2.4-1 2 3.4-2 1.6c.1.4.1.8.1 1.2z" /> },
];

/** Langkah product tour — kartu melayang sederhana, bisa di-skip. */
// Posisi kartu: selalu terpusat & aman di layar kecil/tablet, lalu menunjuk
// elemen terkait di desktop (lg:). lg:translate-* me-reset translate mobile.
const TOUR = [
  { judul: "Menu Operasional", teks: "Semua puses produksi ada di sini: Pesanan, Maklon, Kalkulator HPP, Jadwal, Pengiriman.", pos: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-[260px] lg:translate-x-0" },
  { judul: "Kalkulator HPP", teks: "Fitur andalan: hitung HPP & harga jual otomatis, ganti Excel. Coba dari menu Kalkulator HPP.", pos: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:top-16 lg:translate-y-0" },
  { judul: "Notifikasi Deadline", teks: "Pengingat WhatsApp otomatis H-3/H-2/H-1 jam 08:00 WIB — buka dari menu Notifikasi.", pos: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:top-1/3 lg:translate-y-0" },
  { judul: "Reset Demo", teks: "Semua perubahan tidak disimpan. Tekan Reset Demo kapan saja untuk kembali ke data awal.", pos: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:top-4 lg:translate-y-0" },
];

export default function DemoShell({ children }: { children: React.ReactNode }) {
  const s = useDemo();
  const toast = useDemoToast();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [tour, setTour] = useState<number | null>(null);

  // Product tour muncul otomatis saat pertama masuk (in-memory).
  useEffect(() => {
    if (!tourSudahDitampilkan()) setTour(0);
  }, []);

  // Badge Pesanan: order belum selesai yang deadline-nya ≤ 3 hari lagi.
  const mendekati = s.orders.filter((o) => !o.maklon && o.tahapSelesai < 11 && new Date(o.deadline).getTime() - Date.now() <= 3 * 86_400_000).length;

  const aktif = (href: string) =>
    href === "/penawaran/demo" ? pathname === href : pathname.startsWith(href);

  // Sidebar demo — memakai kelas pas-* yang sama dengan sidebar admin asli
  // (pas-navlink, pas-navsec, pas-brand-logo) supaya tampilannya identik.
  const sidebar = (
    <div
      className="flex h-full flex-col px-4 pb-4 pt-6"
      style={{ background: "linear-gradient(180deg, #04123F, #0A1B45)" }}
    >
      <div className="mb-2 px-2">
        <img src="/nexa-sport-logo.png" alt="Nexa Sport" className="w-[150px] max-w-full" />
        <span className="pas-brand-sub mt-2">Admin Panel</span>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {(["OPERASIONAL", "DATA"] as const).map((grup) => (
          <div key={grup}>
            <p className="pas-navsec">{grup}</p>
            <div className="flex flex-col gap-1">
              {MENU.filter((m) => m.grup === grup).map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setNavOpen(false)}
                  className={`pas-navlink${aktif(m.href) ? " on" : ""}`}
                >
                  <span className="pas-ic">{m.icon}</span>
                  <span className="flex-1">{m.label}</span>
                  {m.label === "Pesanan" && mendekati > 0 && (
                    <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold ${aktif(m.href) ? "bg-[#04123F] text-[#FEC40B]" : "bg-[#FEC40B] text-[#04123F]"}`}>
                      {mendekati}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="pas-userbox mt-4 flex items-center gap-3 p-3">
        <span className="pas-avatar-invert grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold">AD</span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[12.5px] font-bold">Admin Nexa Sport</p>
          <p className="truncate text-[10.5px] text-white/50">admin@nexasport.id</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}>
      {/* ── BANNER MODE DEMO ── */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 bg-[#04123F] px-4 py-2 text-[11.5px] text-white/80">
        <span>
          <b className="text-[#FEC40B]">Mode Demo</b> — data contoh, perubahan tidak disimpan
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              resetDemo();
              demoToast("Demo direset ke data awal");
            }}
            className="rounded-lg bg-white/10 px-2.5 py-1 font-bold text-white transition hover:bg-white/20 active:scale-95"
          >
            Reset Demo
          </button>
          <button
            type="button"
            onClick={() => setTour(0)}
            className="rounded-lg bg-white/10 px-2.5 py-1 font-bold text-white transition hover:bg-white/20 active:scale-95"
          >
            Tur
          </button>
          <a href={waLink()} target="_blank" rel="noreferrer" className="rounded-lg bg-white/10 px-2.5 py-1 font-bold text-white transition hover:bg-white/20">
            Hubungi Kami
          </a>
          <a href={waLink("Halo Nexa Sport, saya mau minta penawaran.")} target="_blank" rel="noreferrer" className="rounded-lg bg-[#FEC40B] px-2.5 py-1 font-bold text-[#04123F] transition hover:brightness-105">
            Minta Penawaran
          </a>
        </div>
      </div>

      <div className="flex">
        {/* ── SIDEBAR DESKTOP ── */}
        <aside className="sticky top-[41px] hidden h-[calc(100vh-41px)] w-60 shrink-0 lg:block">{sidebar}</aside>

        {/* ── DRAWER MOBILE ── */}
        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setNavOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 shadow-2xl">{sidebar}</div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          {/* Tombol hamburger mobile */}
          <div className="sticky top-[41px] z-30 border-b border-[#E9EDF2] bg-white px-4 py-2.5 lg:hidden">
            <button
              className="grid h-10 w-10 place-items-center rounded-lg border border-[#E2E8F0] text-[#475569]"
              aria-label="Buka menu"
              onClick={() => setNavOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="p-4 sm:p-7">{children}</div>
        </main>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-[#04123F] px-4 py-2.5 text-[13px] font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* ── PRODUCT TOUR ── */}
      {tour != null && TOUR[tour] && (
        <div className="fixed inset-0 z-[55] bg-black/55" onClick={() => setTour(null)}>
          <div
            className={`absolute ${TOUR[tour].pos} w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-5 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#94A3B8]">
              Tur demo · {tour + 1}/{TOUR.length}
            </p>
            <h3 className="mt-1.5 text-[15px] font-bold text-[#04123F]">{TOUR[tour].judul}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">{TOUR[tour].teks}</p>
            <div className="mt-4 flex items-center justify-between">
              <button type="button" className="text-[12.5px] font-semibold text-[#94A3B8] hover:text-[#475569]" onClick={() => { setTour(null); tandaiTourSelesai(); }}>
                Lewati
              </button>
              <div className="flex items-center gap-2">
                {tour > 0 && (
                  <button
                    type="button"
                    className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-[12.5px] font-semibold text-[#475569]"
                    onClick={() => setTour(tour - 1)}
                  >
                    Kembali
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-lg bg-[#FEC40B] px-3.5 py-1.5 text-[12.5px] font-bold text-[#04123F]"
                  onClick={() => {
                    if (tour + 1 >= TOUR.length) {
                      setTour(null);
                      tandaiTourSelesai();
                    } else setTour(tour + 1);
                  }}
                >
                  {tour + 1 >= TOUR.length ? "Selesai" : "Lanjut"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

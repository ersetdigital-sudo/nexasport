"use client";

/**
 * Shell dashboard bersama (sidebar + topbar + drawer mobile) — dipakai
 * halaman yang bukan dashboard tabel (Kalkulator HPP) supaya tampil sama
 * persis dengan Maklon/Pesanan.
 *
 * Menu di sidebar ini pindah HALAMAN (bukan ganti tab), sama seperti di
 * MaklonDashboard: Link + prefetch supaya kerangka halaman (loading.tsx)
 * tampil seketika begitu diklik.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatShortDateID } from "@/lib/format-date";

type ActiveKey = "pesanan" | "maklon" | "hpp";

function NavIcon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    pesanan: (
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
    ),
    maklon: (
      <>
        <path d="M20 7l-8-4-8 4v10l8 4 8-4V7z" />
        <path d="M4 7l8 4 8-4M12 11v10" />
      </>
    ),
    jadwal: (
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    kirim: (
      <>
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
    customer: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    laporan: <path d="M18 20V10M12 20V4M6 20v-6" />,
    hpp: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 6h8M8 11h2m3 0h3M8 16h2m3 0h3" />
      </>
    ),
    setting: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008.6 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </>
    ),
    notif: (
      <>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <path d="M16 17l5-5-5-5M21 12H9" />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
}

export default function DashboardShell({
  active,
  kicker = "Operasional",
  title,
  actions,
  children,
}: {
  /** Menu yang sedang aktif (dapat kelas `on`). */
  active: ActiveKey;
  kicker?: string;
  /** Judul di topbar. */
  title: string;
  /** Aksi tambahan di kanan topbar (mis. tombol "Edit Harga"). */
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [showMobileNav, setShowMobileNav] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/pesanan/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  const navClass = (key: ActiveKey) =>
    `pas-navlink${active === key ? " on" : ""}`;

  const sideNav = (
    <>
      <p className="pas-navsec">Operasional</p>
      <nav className="flex flex-col gap-1">
        <Link className={navClass("pesanan")} href="/pesanan/orders" prefetch>
          <span className="pas-ic"><NavIcon name="pesanan" /></span> Pesanan
        </Link>
        <Link className={navClass("maklon")} href="/pesanan/maklon" prefetch>
          <span className="pas-ic"><NavIcon name="maklon" /></span> Maklon
        </Link>
        <Link className={navClass("hpp")} href="/pesanan/hpp" prefetch>
          <span className="pas-ic"><NavIcon name="hpp" /></span> Kalkulator HPP
        </Link>
        <Link className="pas-navlink" href="/pesanan/orders#jadwal" prefetch>
          <span className="pas-ic"><NavIcon name="jadwal" /></span> Jadwal Produksi
        </Link>
        <Link className="pas-navlink" href="/pesanan/orders#kirim" prefetch>
          <span className="pas-ic"><NavIcon name="kirim" /></span> Pengiriman
        </Link>
      </nav>
      <p className="pas-navsec">Data</p>
      <nav className="flex flex-col gap-1">
        <Link className="pas-navlink" href="/pesanan/orders#customer" prefetch>
          <span className="pas-ic"><NavIcon name="customer" /></span> Customer
        </Link>
        <Link className="pas-navlink" href="/pesanan/orders#laporan" prefetch>
          <span className="pas-ic"><NavIcon name="laporan" /></span> Laporan
        </Link>
        <Link className="pas-navlink" href="/pesanan/orders#notif" prefetch>
          <span className="pas-ic"><NavIcon name="notif" /></span> Notifikasi
        </Link>
        <Link className="pas-navlink" href="/pesanan/orders#setting" prefetch>
          <span className="pas-ic"><NavIcon name="setting" /></span> Pengaturan
        </Link>
      </nav>
    </>
  );

  return (
    <div className="pas-shell">
      <aside className="pas-side">
        <a href="/" className="pas-brand">
          {/* Logo UTUH apa adanya dari brand (emblem + wordmark + tagline) —
              sengaja tidak dipotong supaya proporsinya tetap asli. Nama
              "Nexa Sport" sudah ada di dalam logo, jadi tidak diulang sebagai teks. */}
          <img src="/logo-nexa-sport.png" alt="Nexa Sport" className="pas-brand-logo" />
          <span className="pas-brand-sub">Admin Panel</span>
        </a>
        {sideNav}
        <div className="pas-userbox mt-auto p-3 flex items-center gap-3">
          <span className="pas-avatar pas-avatar-invert">AD</span>
          <span className="leading-tight">
            <span className="block text-[13.5px] font-semibold">Admin Nexa Sport</span>
            <span className="block text-[11.5px] opacity-70">admin@nexasport.id</span>
          </span>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="pas-topbar">
          <div className="px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo TIDAK dipasang di topbar mobile: di layar sempit ia
                bertabrakan dengan breadcrumb + tombol. Branding cukup di
                drawer (tombol menu). */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <p className="pas-kicker">{kicker}</p>
                <h1 className="pas-display pas-title mt-1 truncate">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden w-10 h-10 grid place-items-center rounded-lg border border-[var(--pas-line)] text-[var(--pas-muted)] hover:text-[var(--pas-ink-1)] hover:bg-[var(--pas-surface-2)] transition"
                onClick={() => setShowMobileNav(true)}
                aria-label="Buka menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="hidden lg:inline text-[12.5px] text-[var(--pas-muted)]">
                {formatShortDateID(new Date())}
              </span>
              {actions}
            </div>
          </div>
        </header>

        <main className="px-5 sm:px-8 py-7 sm:py-9 w-full">{children}</main>
      </div>

      {/* ── MOBILE NAV DRAWER ── */}
      <Sheet open={showMobileNav} onOpenChange={setShowMobileNav}>
        <SheetContent
          side="left"
          className="p-5 bg-[#04123F] text-white border-r border-white/10 w-[280px] overflow-y-auto [&>button]:text-white/50 [&>button]:hover:text-white [&>button]:hover:bg-white/10 [&>button]:rounded-lg [&>button]:p-2 [&>button]:transition"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {/* Drawer header — satu-satunya tempat logo tampil di mobile. */}
          <div className="flex items-center mb-2">
            <a href="/" className="flex items-center gap-2.5">
              <img src="/logo-nexa-sport.png" alt="Nexa Sport" className="w-36 h-auto" />
            </a>
          </div>
          <div onClick={() => setShowMobileNav(false)}>{sideNav}</div>
          <button
            type="button"
            onClick={handleLogout}
            className="pas-navlink mt-5 w-full text-left"
          >
            <span className="pas-ic"><NavIcon name="logout" /></span> Keluar
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
}

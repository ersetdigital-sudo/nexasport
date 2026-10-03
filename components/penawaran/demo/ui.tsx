"use client";

/** Komponen UI kecil yang dipakai halaman-halaman demo. */
import { PENAWARAN, waLink } from "@/lib/penawaran-config";
import { formatShortDateID } from "@/lib/format-date";

export const rp = (v: number) => "Rp" + new Intl.NumberFormat("id-ID").format(Math.round(v));

export const tanggalID = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

/** Header halaman demo — disamakan dengan topbar admin asli (pas-*). */
export function PageHead({
  kicker = "Operasional",
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="pas-kicker">{kicker}</p>
        <h1 className="pas-display pas-title mt-1 truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-[12.5px] text-[var(--pas-muted)] lg:inline">
          {formatShortDateID(new Date())}
        </span>
        {action}
      </div>
    </div>
  );
}

/** Kartu putih rounded besar dengan border tipis — bawaan gaya demo. */
export function Kartu({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-2xl border border-[#E9EDF2] bg-white shadow-sm ${className}`}>{children}</div>;
}

/** Warna badge status order berdasar indeks tahap. */
export function badgeTahap(tahapSelesai: number, total: number): string {
  if (tahapSelesai >= total) return "bg-emerald-50 text-emerald-700";
  const p = tahapSelesai / total;
  if (p < 0.3) return "bg-sky-50 text-sky-700";
  if (p < 0.6) return "bg-violet-50 text-violet-700";
  if (p < 0.9) return "bg-amber-50 text-amber-700";
  return "bg-teal-50 text-teal-700";
}

/** Tombol kuning aksi utama (gaya header app asli). */
export function BtnKuning({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl bg-[#FEC40B] px-4 py-2.5 text-[13.5px] font-bold text-[#04123F] shadow-[0_4px_12px_rgba(254,196,11,0.35)] transition hover:brightness-105 active:scale-[0.97] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Sheet samping kanan — disamakan dengan sheet admin asli (pas-sheet/pas-panel). */
export function Modal({ open, onClose, kicker, title, children }: {
  open: boolean;
  onClose: () => void;
  kicker?: string;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="pas-sheet open">
      <div className="pas-veil" onClick={onClose} />
      <div className="pas-panel p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {kicker && <p className="text-[12px] text-[var(--pas-accent)] font-semibold">{kicker}</p>}
            <h2 className={`pas-display text-[22px] ${kicker ? "mt-1.5" : ""}`}>{title}</h2>
          </div>
          <button type="button" className="pas-btn-ghost px-3 py-2 text-sm shrink-0" onClick={onClose}>
            Tutup
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

/** Link WhatsApp (dipakai tombol di halaman demo). */
export const wa = (pesan?: string) => waLink(pesan ?? PENAWARAN.wa.pesanAwal);

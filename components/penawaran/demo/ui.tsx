"use client";

/** Komponen UI kecil yang dipakai halaman-halaman demo. */
import { PENAWARAN, waLink } from "@/lib/penawaran-config";

export const rp = (v: number) => "Rp" + new Intl.NumberFormat("id-ID").format(Math.round(v));

export const tanggalID = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

const hariIni = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

/** Header halaman demo: label kapital + judul + tanggal + aksi utama. */
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
    <div className="mb-6 rounded-2xl border border-[#E9EDF2] bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">{kicker}</p>
          <h1 className="mt-0.5 text-[20px] font-extrabold tracking-tight text-[#0B1A5C] sm:text-[22px]">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[12.5px] text-[#64748B] sm:inline">{hariIni}</span>
          {action}
        </div>
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
      className="rounded-xl bg-[#FFC107] px-4 py-2.5 text-[13.5px] font-bold text-[#3A2B00] shadow-sm transition hover:brightness-105 active:scale-[0.97] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Modal sederhana (drawer/modal demo). */
export function Modal({ open, onClose, title, children, lebar = "max-w-lg" }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  lebar?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className={`relative max-h-[92vh] w-full ${lebar} overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#0B1A5C]">{title}</h3>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-[#F1F5F9] text-[#475569]">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Link WhatsApp (dipakai tombol di halaman demo). */
export const wa = (pesan?: string) => waLink(pesan ?? PENAWARAN.wa.pesanAwal);

"use client";

/**
 * Upload foto preview (design / WO) — dipakai form Tambah Pesanan & Tambah
 * Maklon di demo. Dipindah ke komponen bersama supaya kedua halaman memakai
 * markup yang sama persis (satu sumber).
 */
import { IMAGE_ACCEPT } from "@/lib/cloudinary";

export function FotoUpload({
  label,
  catatan,
  fotos,
  alt,
  uploading,
  onPick,
  onRemove,
}: {
  label: string;
  catatan?: string;
  fotos: string[];
  alt: string;
  uploading: boolean;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
}) {
  const inputId = `foto-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <span className="text-[13px] text-[#64748B]">{label}</span>
      {catatan && <p className="-mt-0.5 text-[11px] text-[#94A3B8]">{catatan}</p>}
      <div className="mt-1.5 flex flex-wrap gap-2.5">
        {fotos.map((url, i) => (
          <div key={i} className="group relative h-[76px] w-[76px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${alt} ${i + 1}`} className="h-full w-full rounded-xl border border-[#E2E8F0] object-cover" />
            <button
              type="button"
              className="absolute right-1 top-1 grid h-[22px] w-[22px] place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
              title="Hapus foto"
              onClick={() => onRemove(i)}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          className="grid h-[76px] w-[76px] place-items-center rounded-xl border border-dashed border-[#CBD5E1] text-[#94A3B8] transition hover:border-[#04123F] hover:text-[#04123F]"
          title={`Upload ${label.toLowerCase()}`}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {uploading ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-3.2-6.9" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
          )}
        </button>
      </div>
      <input id={inputId} type="file" accept={IMAGE_ACCEPT} multiple className="hidden" onChange={onPick} />
    </div>
  );
}

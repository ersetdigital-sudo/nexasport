"use client";

/**
 * Tab "Database HPP" — padanan sheet DATABASE HPP di Excel: seluruh baris
 * harga bahan/proses dengan warna kategori seperti aslinya. Read-only
 * (edit harga tetap lewat tombol "Edit Harga" di tab Kalkulator).
 */
import { useMemo, useState } from "react";
import type { HppItem } from "@/lib/hpp-server";
import { rupiah } from "@/lib/rupiah";

/** Warna kategori mengikuti warna baris di sheet DATABASE HPP. */
const KATEGORI_META: Record<string, { dot: string; chip: string }> = {
  Kain: { dot: "bg-[#FACC15]", chip: "bg-[#FEF9C3] text-[#854D0E]" },
  "Print/Press": { dot: "bg-[#60A5FA]", chip: "bg-[#DBEAFE] text-[#1E40AF]" },
  "Jahit Atasan": { dot: "bg-[#4ADE80]", chip: "bg-[#DCFCE7] text-[#166534]" },
  "Jahit Celana": { dot: "bg-[#4ADE80]", chip: "bg-[#DCFCE7] text-[#166534]" },
  Logo: { dot: "bg-[#F472B6]", chip: "bg-[#FCE7F3] text-[#9D174D]" },
  Collar: { dot: "bg-[#22D3EE]", chip: "bg-[#CFFAFE] text-[#155E75]" },
  Cuff: { dot: "bg-[#22D3EE]", chip: "bg-[#CFFAFE] text-[#155E75]" },
  Namset: { dot: "bg-[#FB923C]", chip: "bg-[#FFEDD5] text-[#9A3412]" },
  Operasional: { dot: "bg-[#A78BFA]", chip: "bg-[#EDE9FE] text-[#5B21B6]" },
  DTF: { dot: "bg-[#94A3B8]", chip: "bg-[#F1F5F9] text-[#334155]" },
};
const FALLBACK_META = { dot: "bg-[#94A3B8]", chip: "bg-[#F1F5F9] text-[#334155]" };

export default function HppDatabase({ items }: { items: HppItem[] | null }) {
  const [query, setQuery] = useState("");
  const [kategori, setKategori] = useState<string>("");

  const kategories = useMemo(() => {
    const seen: string[] = [];
    for (const it of items ?? []) if (!seen.includes(it.kategori)) seen.push(it.kategori);
    return seen;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (it) =>
        (!kategori || it.kategori === kategori) &&
        (!q ||
          it.item.toLowerCase().includes(q) ||
          it.variasi.toLowerCase().includes(q) ||
          it.kategori.toLowerCase().includes(q))
    );
  }, [items, query, kategori]);

  if (!items) {
    return (
      <div className="pas-card p-6 text-sm opacity-70">
        Database HPP belum bisa dibaca. Coba muat ulang halaman, atau cek izin
        tabel <code>hpp_items</code> di Supabase.
      </div>
    );
  }

  return (
    <div>
      {/* ── FILTER: cari + chip kategori ── */}
      <div className="flex flex-col gap-3 mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari item atau variasi…"
          className="w-full sm:w-72 rounded-xl border border-[var(--pas-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#04123F]"
        />
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="Semua"
            count={items.length}
            active={kategori === ""}
            onClick={() => setKategori("")}
          />
          {kategories.map((k) => (
            <FilterChip
              key={k}
              label={k}
              count={items.filter((it) => it.kategori === k).length}
              active={kategori === k}
              onClick={() => setKategori(kategori === k ? "" : k)}
              dot={KATEGORI_META[k]?.dot ?? FALLBACK_META.dot}
            />
          ))}
        </div>
      </div>

      {/* ── TABEL DATABASE HPP ── */}
      <div className="pas-card overflow-hidden hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#04123F] text-white text-left text-[11.5px] uppercase tracking-wide">
              <th className="px-4 py-3 font-semibold w-14">No</th>
              <th className="px-2 py-3 font-semibold">Kategori</th>
              <th className="px-2 py-3 font-semibold">Item</th>
              <th className="px-2 py-3 font-semibold">Variasi</th>
              <th className="px-3 py-3 text-right font-semibold">Harga HPP</th>
              <th className="px-4 py-3 font-semibold w-20">Satuan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it, i) => {
              const meta = KATEGORI_META[it.kategori] ?? FALLBACK_META;
              return (
                <tr key={it.id} className={i % 2 ? "bg-[#F7F8FA]" : ""}>
                  <td className="px-4 py-2.5 opacity-40 tabular-nums">{i + 1}</td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${meta.chip}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {it.kategori}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 font-medium">{it.item}</td>
                  <td className="px-2 py-2.5 opacity-80">{it.variasi}</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                    {rupiah(it.harga)}
                  </td>
                  <td className="px-4 py-2.5 opacity-60">{it.satuan}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center opacity-50">
                  Tidak ada baris yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── DAFTAR (MOBILE) ── */}
      <div className="pas-card overflow-hidden divide-y divide-[#EEF1F5] sm:hidden">
        {filtered.map((it) => {
          const meta = KATEGORI_META[it.kategori] ?? FALLBACK_META;
          return (
            <div key={it.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {it.kategori}
                </span>
                <span className="text-[13.5px] font-bold tabular-nums whitespace-nowrap">
                  {rupiah(it.harga)}
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-medium min-w-0 truncate">
                  {it.item}
                  <span className="ml-1.5 text-[12px] font-normal opacity-60">
                    {it.variasi}
                  </span>
                </span>
                <span className="text-[11.5px] opacity-50 whitespace-nowrap">
                  {it.satuan}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm opacity-50">
            Tidak ada baris yang cocok dengan filter.
          </div>
        )}
      </div>

      <p className="mt-3 text-[11.5px] opacity-50">
        Menampilkan {filtered.length} dari {items.length} baris — padanan sheet
        DATABASE HPP di Excel. Harga bisa diedit dari tombol “Edit Harga” di tab
        Kalkulator.
      </p>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  dot,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition " +
        (active
          ? "bg-[#04123F] text-white border-[#04123F]"
          : "bg-white text-[var(--pas-muted)] border-[var(--pas-line)] hover:text-[var(--pas-ink-1)] hover:border-[#CBD2DD]")
      }
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label}
      <span className={active ? "opacity-60" : "opacity-40"}>{count}</span>
    </button>
  );
}

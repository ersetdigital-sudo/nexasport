"use client";

/**
 * Tab "Database HPP" (demo) — salinan UI dari components/admin/HppDatabase.tsx:
 * filter kategori, pencarian, form tambah item, tabel navy + kartu mobile.
 *
 * Bedanya dengan admin: data disimpan in-memory di demo-store (setDemo),
 * bukan ke Supabase — sisanya identik, termasuk perubahan harga yang langsung
 * ikut ke tab Kalkulator lewat store bersama.
 */
import { useMemo, useState } from "react";
import type { HppItem } from "@/lib/demo-seed";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { rp } from "@/components/penawaran/demo/ui";
import RupiahInput from "@/components/admin/RupiahInput";

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

/** Opsi khusus pada pilihan kategori. */
const KATEGORI_BARU = "__kategori_baru__";

const INPUT_KELAS =
  "rounded-lg border border-[#E3E7EE] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#04123F]";

export default function HppDatabaseDemo() {
  const s = useDemo();
  const items = s.hppItems;

  const [query, setQuery] = useState("");
  const [kategori, setKategori] = useState<string>("");

  // ── Edit harga inline: satu baris aktif dalam satu waktu ──
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState(0);

  // ── Form tambah item ──
  const [showForm, setShowForm] = useState(false);
  const [formKategori, setFormKategori] = useState("");
  const [formKategoriBaru, setFormKategoriBaru] = useState("");
  const [formItem, setFormItem] = useState("");
  const [formVariasi, setFormVariasi] = useState("");
  const [formHarga, setFormHarga] = useState(0);
  const [formSatuan, setFormSatuan] = useState("pcs");

  const commitHarga = (item: HppItem) => {
    if (editingId !== item.id) return;
    if (draft <= 0 || draft === item.harga) {
      setEditingId(null);
      return;
    }
    setDemo({ hppItems: items.map((it) => (it.id === item.id ? { ...it, harga: draft } : it)) });
    setEditingId(null);
    demoToast("Harga tersimpan — semua hitungan ikut berubah");
  };

  const mulaiEdit = (item: HppItem) => {
    if (editingId === item.id) return;
    setEditingId(item.id);
    setDraft(item.harga);
  };

  const tambahItem = (e: React.FormEvent) => {
    e.preventDefault();
    const kategoriFinal = (formKategori === KATEGORI_BARU ? formKategoriBaru : formKategori).trim();
    if (!kategoriFinal || !formItem.trim() || !formVariasi.trim() || formHarga <= 0) {
      demoToast("Lengkapi kategori, item, variasi, dan harga dulu");
      return;
    }
    const item: HppItem = {
      id: Math.max(0, ...items.map((it) => it.id)) + 1,
      kategori: kategoriFinal,
      item: formItem.trim(),
      variasi: formVariasi.trim(),
      harga: formHarga,
      satuan: formSatuan.trim() || "pcs",
    };
    setDemo({ hppItems: [...items, item] });
    setShowForm(false);
    setFormItem("");
    setFormVariasi("");
    setFormHarga(0);
    setFormKategoriBaru("");
    demoToast("Item ditambahkan — langsung muncul di Kalkulator");
  };

  const kategories = useMemo(() => {
    const seen: string[] = [];
    for (const it of items) if (!seen.includes(it.kategori)) seen.push(it.kategori);
    return seen;
  }, [items]);

  // Saran nama item (untuk datalist form): nama item yang membuat baris baru
  // otomatis ikut dropdown kalkulator.
  const saranItem = useMemo(() => {
    const seen: string[] = [];
    for (const it of items) if (!seen.includes(it.item)) seen.push(it.item);
    return seen;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (it) =>
        (!kategori || it.kategori === kategori) &&
        (!q ||
          it.item.toLowerCase().includes(q) ||
          it.variasi.toLowerCase().includes(q) ||
          it.kategori.toLowerCase().includes(q))
    );
  }, [items, query, kategori]);

  /** Sel harga yang bisa diklik untuk langsung diedit. */
  const selHarga = (item: HppItem) =>
    editingId === item.id ? (
      <span className="inline-flex items-center gap-1.5">
        <RupiahInput
          autoFocus
          className="w-32"
          value={draft}
          onValueChange={setDraft}
          onBlur={() => {
            if (editingId === item.id) commitHarga(item);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitHarga(item);
            if (e.key === "Escape") setEditingId(null);
          }}
        />
        <button
          type="button"
          title="Simpan"
          // preventDefault: input tetap fokus, blur tidak memicu simpan ganda.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => commitHarga(item)}
          className="pas-btn pas-btn-accent text-[11px] px-2 py-1 whitespace-nowrap"
        >
          ✓
        </button>
      </span>
    ) : (
      <button
        type="button"
        title="Klik untuk edit harga"
        onClick={() => mulaiEdit(item)}
        className="group inline-flex items-center gap-1.5 font-semibold tabular-nums rounded-lg px-2 py-1 -mx-2 hover:bg-[#EEF1F5] transition"
      >
        {rp(item.harga)}
        <span className="text-[11px] opacity-40 transition sm:opacity-0 sm:group-hover:opacity-60">✏️</span>
      </button>
    );

  return (
    <div>
      {/* ── HEADER + FILTER ── */}
      <div className="pas-card overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-[#04123F] via-[#0A2465] to-[#123A8F] px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-white font-bold text-[15px] leading-tight">Database HPP</h2>
            <p className="text-white/60 text-[12px] mt-0.5">
              {items.length} item harga bahan &amp; proses — klik harga untuk edit langsung
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="pas-btn pas-btn-accent whitespace-nowrap px-3.5 py-2.5 text-[14px]"
          >
            {showForm ? "Tutup" : "+ Tambah Item"}
          </button>
        </div>
        <div className="px-5 py-3.5 flex flex-col gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari item atau variasi…"
            className="w-full sm:w-80 rounded-xl border border-[var(--pas-line)] bg-[#F7F8FA] px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#04123F]"
          />
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
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
      </div>

      {/* ── FORM TAMBAH ITEM ── */}
      {showForm && (
        <form onSubmit={tambahItem} className="pas-card p-4 sm:p-5 mb-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                Kategori
              </span>
              <select
                value={formKategori}
                onChange={(e) => {
                  setFormKategori(e.target.value);
                  // Prefill nama item dari kategori yang dipilih (mis. Logo →
                  // item "Logo") supaya pas dengan dropdown kalkulator.
                  const k = e.target.value;
                  const milik = items.filter((it) => it.kategori === k);
                  const nama = [...new Set(milik.map((it) => it.item))];
                  setFormItem(nama.length === 1 ? nama[0] : "");
                }}
                className={`${INPUT_KELAS} w-full`}
              >
                <option value="">— pilih kategori —</option>
                {kategories.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
                <option value={KATEGORI_BARU}>+ Kategori baru…</option>
              </select>
            </label>
            {formKategori === KATEGORI_BARU && (
              <label className="block">
                <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                  Nama kategori baru
                </span>
                <input
                  value={formKategoriBaru}
                  onChange={(e) => setFormKategoriBaru(e.target.value)}
                  placeholder="mis. Aksesoris"
                  className={`${INPUT_KELAS} w-full`}
                />
              </label>
            )}
            <label className="block">
              <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                Item
              </span>
              <input
                list="hpp-item-saran"
                value={formItem}
                onChange={(e) => setFormItem(e.target.value)}
                placeholder="mis. Logo, Rib Collar, Namset"
                className={`${INPUT_KELAS} w-full`}
              />
              <datalist id="hpp-item-saran">
                {saranItem.map((sr) => (
                  <option key={sr} value={sr} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                Variasi
              </span>
              <input
                value={formVariasi}
                onChange={(e) => setFormVariasi(e.target.value)}
                placeholder="mis. Bordir, Rubber"
                className={`${INPUT_KELAS} w-full`}
              />
            </label>
            <label className="block">
              <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                Harga (Rp)
              </span>
              <RupiahInput value={formHarga} onValueChange={setFormHarga} className="w-full sm:w-40" />
            </label>
            <label className="block">
              <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                Satuan
              </span>
              <input
                value={formSatuan}
                onChange={(e) => setFormSatuan(e.target.value)}
                placeholder="pcs"
                className={`${INPUT_KELAS} w-full sm:w-24`}
              />
            </label>
            <button type="submit" className="pas-btn pas-btn-accent px-4 py-2.5 text-[14px]">
              Simpan
            </button>
          </div>
          <p className="mt-3 text-[12px] opacity-60">
            Tips: pakai nama item yang sudah ada (Kain Atasan, Print Atasan,
            Logo, Rib Collar, Rib Cuff, Namset, dll.) supaya langsung muncul
            di dropdown Kalkulator.
          </p>
        </form>
      )}

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
                <tr key={it.id} className={(i % 2 ? "bg-[#F7F8FA] " : "") + "transition-colors hover:bg-[#EEF2F8]"}>
                  <td className="px-4 py-2.5 opacity-40 tabular-nums">{i + 1}</td>
                  <td className="px-2 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${meta.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {it.kategori}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 font-medium">{it.item}</td>
                  <td className="px-2 py-2.5 opacity-80">{it.variasi}</td>
                  <td className="px-3 py-2.5 text-right">{selHarga(it)}</td>
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
            <div key={it.id} className="px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {it.kategori}
                </span>
                {selHarga(it)}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-medium min-w-0 truncate">
                  {it.item}
                  <span className="ml-1.5 text-[12px] font-normal opacity-60">{it.variasi}</span>
                </span>
                <span className="text-[11.5px] opacity-50 whitespace-nowrap">{it.satuan}</span>
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
        Menampilkan {filtered.length} dari {items.length} baris — klik harga
        untuk edit langsung di baris. Data demo disimpan sementara dan kembali
        lewat tombol Reset Demo.
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
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition " +
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

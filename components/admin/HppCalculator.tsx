"use client";

/**
 * Kalkulator HPP — reinkarnasi sheet "Kalkulator HPP" dari Excel.
 *
 * Cara kerjanya sama persis:
 *   - pilih variasi per kategori (boleh dikosongkan → baris tidak dihitung,
 *     padanan rumus `IF(C36="","",SUMIFS(...))`);
 *   - DTF dan Biaya Tak Terduga selalu ditambahkan (Rp5.000, tidak bisa
 *     dipilih/dihapus — padanan baris D46/D47 yang tertulis manual);
 *   - TOTAL HPP = jumlah semua baris terisi (padanan `SUM(D36:D47)`);
 *   - MARGIN bisa diedit (default 50.000, seperti D49);
 *   - HARGA JUAL = TOTAL HPP + MARGIN (padanan `=D48+D49`).
 *
 * Bedanya: harganya dibaca dari tabel `nexa_sport.hpp_items` (bukan sheet
 * DAFTAR KAIN), dan harga bisa diedit langsung dari bawah halaman —
 * padanan sheet DAFTAR KAIN/Lists yang di Excel diedit manual.
 */
import { useMemo, useState } from "react";
import type { HppItem } from "@/lib/hpp-server";
import type { KainFabric } from "@/lib/kain-server";
import DashboardShell from "@/components/admin/DashboardShell";
import HppDatabase from "@/components/admin/HppDatabase";
import DaftarKain from "@/components/admin/DaftarKain";
import { rupiah } from "@/lib/rupiah";

/** Baris pilihan kalkulator — urutan & label mengikuti Excel (A36–A45). */
const CALC_ROWS = [
  { key: "kain_atasan", label: "Kain Atasan", item: "Kain Atasan", defaultVariasi: "Premium" },
  { key: "kain_celana", label: "Kain Celana", item: "Kain Celana", defaultVariasi: "" },
  { key: "print_atasan", label: "Print/Press Atasan", item: "Print Atasan", defaultVariasi: "Atasan" },
  { key: "print_celana", label: "Print/Press Celana", item: "Print Celana", defaultVariasi: "" },
  { key: "jahit_atasan", label: "Jahit Atasan", item: "Jahit Atasan", defaultVariasi: "Basic" },
  { key: "jahit_celana", label: "Jahit Celana", item: "Jahit Celana", defaultVariasi: "" },
  { key: "logo", label: "Logo", item: "Logo", defaultVariasi: "" },
  { key: "collar", label: "Collar", item: "Rib Collar", defaultVariasi: "" },
  { key: "cuff", label: "Cuff", item: "Rib Cuff", defaultVariasi: "" },
  { key: "namset", label: "Namset", item: "Namset", defaultVariasi: "" },
] as const;

/** Biaya tetap yang selalu ikut (padanan baris DTF & Lain Lain di Excel). */
const FIXED_ROWS = ["DTF", "Biaya Tak Terduga"];
const DEFAULT_MARGIN = 50000;

/** Tab sheet — padanan tab sheet Excel: Kalkulator, DATABASE HPP, DAFTAR KAIN. */
const TABS = [
  { key: "kalkulator", label: "Kalkulator" },
  { key: "database", label: "Database HPP" },
  { key: "kain", label: "Daftar Kain" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function HppCalculator({
  initialItems,
  initialFabrics: fabrics,
}: {
  initialItems: HppItem[] | null;
  initialFabrics: KainFabric[] | null;
}) {
  const [items, setItems] = useState<HppItem[] | null>(initialItems);
  const [tab, setTab] = useState<TabKey>("kalkulator");
  const [margin, setMargin] = useState<number>(DEFAULT_MARGIN);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    // Nilai awal mengikuti Excel: sebagian kolom variasi sudah terisi.
    const initial: Record<string, string> = {};
    for (const row of CALC_ROWS) initial[row.key] = row.defaultVariasi;
    return initial;
  });
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [draftHarga, setDraftHarga] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const priceByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items ?? []) map.set(`${item.item}|${item.variasi}`, item.harga);
    return map;
  }, [items]);

  const lines = useMemo(() => {
    const chosen = CALC_ROWS.map((row) => {
      const variasi = selected[row.key] ?? "";
      const harga = variasi ? (priceByKey.get(`${row.item}|${variasi}`) ?? null) : null;
      return { key: row.key, label: row.label, variasi, harga };
    });
    const fixed = FIXED_ROWS.map((item) => ({
      key: item,
      label: item === "DTF" ? "DTF" : "Lain Lain",
      variasi: item,
      harga: priceByKey.get(`${item}|${item}`) ?? null,
    }));
    return [...chosen, ...fixed];
  }, [selected, priceByKey]);

  const totalHpp = lines.reduce((sum, line) => sum + (line.harga ?? 0), 0);
  const hargaJual = totalHpp + (Number.isFinite(margin) ? margin : 0);

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  const saveHarga = async (item: HppItem) => {
    const raw = (draftHarga[item.id] ?? "").replace(/[^\d]/g, "");
    if (raw === "" || !Number.isFinite(Number(raw))) {
      flash("Isi harga dengan angka dulu");
      return;
    }
    setSavingId(item.id);
    try {
      const res = await fetch("/api/pesanan/hpp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, harga: Number(raw) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        flash(data?.error ?? "Gagal menyimpan harga");
        return;
      }
      setItems((prev) =>
        (prev ?? []).map((it) => (it.id === item.id ? { ...it, harga: Number(raw) } : it))
      );
      flash("Harga tersimpan ✅");
    } finally {
      setSavingId(null);
    }
  };

  const isEmpty = !items || items.length === 0;

  return (
    <DashboardShell
      active="hpp"
      title="Kalkulator HPP"
      actions={
        tab !== "kalkulator" || isEmpty ? undefined : (
          <button
            type="button"
            className="pas-btn pas-btn-accent whitespace-nowrap px-3.5 py-2.5 text-[14px]"
            onClick={() => setShowPriceEditor((v) => !v)}
          >
            {showPriceEditor ? "Tutup Harga" : "Edit Harga"}
          </button>
        )
      }
    >
      <div className="max-w-4xl mx-auto">
      {/* ── TAB SHEET (padanan tab sheet di Excel) ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              "rounded-xl px-4 py-2 text-[13px] font-semibold transition border " +
              (tab === t.key
                ? "bg-[#04123F] text-white border-[#04123F] shadow-sm"
                : "bg-white text-[var(--pas-muted)] border-[var(--pas-line)] hover:text-[var(--pas-ink-1)] hover:border-[#CBD2DD]")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "kalkulator" && isEmpty && (
        <div className="py-16 text-center">
          <p className="text-sm opacity-70">
            Data HPP belum bisa dibaca atau masih kosong. Jika migrasi tabel
            sudah dijalankan, jalankan <code>0013_hpp_permissions.sql</code>{" "}
            di SQL Editor Supabase untuk memberikan izin baca dan edit harga
            kepada aplikasi, lalu muat ulang halaman ini.
          </p>
          <a
            href="/pesanan/orders"
            className="pas-btn pas-btn-accent inline-block mt-6"
          >
            Kembali ke Dashboard
          </a>
        </div>
      )}

      {tab === "kalkulator" && !isEmpty && (
      <div className="max-w-3xl mx-auto">
      {/* ── HEADER ── */}
      <p className="text-[12.5px] opacity-60 mb-6">
        Pilih variasi pada tiap kategori. Boleh dikosongkan.
      </p>

      {/* ── KALKULATOR ── */}
      <div className="pas-card overflow-hidden hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11.5px] uppercase tracking-wide opacity-50">
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-2 py-3 font-semibold">Item / Variasi</th>
              <th className="px-4 py-3 text-right font-semibold">Harga</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const rowDef = CALC_ROWS.find((r) => r.key === line.key);
              const options = rowDef
                ? items.filter((it) => it.item === rowDef.item)
                : [];
              return (
                <tr
                  key={line.key}
                  className={index % 2 ? "bg-[#F7F8FA]" : ""}
                >
                  <td className="px-4 py-2.5 font-medium align-middle">
                    {line.label}
                    {options.length === 0 && rowDef && (
                      <span className="block text-[11px] opacity-50">
                        belum ada di database
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 align-middle">
                    {rowDef && options.length > 0 ? (
                      <select
                        className="w-full max-w-[180px] rounded-lg border border-[#E3E7EE] bg-white px-2.5 py-1.5 text-sm"
                        value={line.variasi}
                        onChange={(e) =>
                          setSelected((prev) => ({
                            ...prev,
                            [line.key]: e.target.value,
                          }))
                        }
                      >
                        <option value="">—</option>
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.variasi}>
                            {opt.variasi}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="opacity-70">{line.variasi}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold align-middle">
                    {line.harga != null ? rupiah(line.harga) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#E3E7EE]">
              <td className="px-4 py-3 font-bold" colSpan={2}>
                TOTAL HPP
              </td>
              <td className="px-4 py-3 text-right font-bold">
                {rupiah(totalHpp)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium" colSpan={2}>
                MARGIN
              </td>
              <td className="px-4 py-2 text-right">
                <input
                  type="number"
                  min={0}
                  className="w-32 text-right rounded-lg border border-[#E3E7EE] bg-white px-2.5 py-1.5 text-sm"
                  value={Number.isFinite(margin) ? margin : 0}
                  onChange={(e) => setMargin(Number(e.target.value || 0))}
                />
              </td>
            </tr>
            <tr className="bg-[#FEC40B]/10">
              <td className="px-4 py-3 font-bold" colSpan={2}>
                HARGA JUAL
              </td>
              <td className="px-4 py-3 text-right font-bold text-[15px]">
                {rupiah(hargaJual)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── KALKULATOR (MOBILE) ── */}
      <div className="pas-card overflow-hidden sm:hidden">
        <div className="divide-y divide-[#EEF1F5]">
          {lines.map((line) => {
            const rowDef = CALC_ROWS.find((r) => r.key === line.key);
            const options = rowDef
              ? items.filter((it) => it.item === rowDef.item)
              : [];
            return (
              <div key={line.key} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[13.5px] font-medium leading-snug">
                    {line.label}
                    {options.length === 0 && rowDef && (
                      <span className="block text-[11px] opacity-50">
                        belum ada di database
                      </span>
                    )}
                  </span>
                  <span className="text-[13.5px] font-bold whitespace-nowrap">
                    {line.harga != null ? rupiah(line.harga) : "—"}
                  </span>
                </div>
                {rowDef && options.length > 0 ? (
                  <select
                    className="w-full rounded-lg border border-[#E3E7EE] bg-white px-3 py-2.5 text-sm"
                    value={line.variasi}
                    onChange={(e) =>
                      setSelected((prev) => ({
                        ...prev,
                        [line.key]: e.target.value,
                      }))
                    }
                  >
                    <option value="">—</option>
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.variasi}>
                        {opt.variasi}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="block text-[13px] opacity-70">
                    {line.variasi || "—"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-4 py-4 border-t border-[#E3E7EE] space-y-3">
          <div className="flex items-center justify-between font-bold">
            <span>TOTAL HPP</span>
            <span>{rupiah(totalHpp)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">MARGIN</span>
            <input
              type="number"
              min={0}
              className="w-28 text-right rounded-lg border border-[#E3E7EE] bg-white px-2.5 py-2 text-sm"
              value={Number.isFinite(margin) ? margin : 0}
              onChange={(e) => setMargin(Number(e.target.value || 0))}
            />
          </div>
          <div className="flex items-center justify-between font-bold rounded-xl bg-[#FEC40B]/10 px-3 py-3">
            <span>HARGA JUAL</span>
            <span className="text-[15px]">{rupiah(hargaJual)}</span>
          </div>
        </div>
      </div>

      {/* ── EDITOR HARGA ── */}
      {showPriceEditor && (
        <div className="pas-card mt-6 p-4 sm:p-5">
          <h2 className="font-bold text-[15px]">
            Database HPP
            <span className="ml-2 text-[11.5px] font-normal opacity-50">
              {items.length} item — padanan sheet DAFTAR KAIN di Excel
            </span>
          </h2>
          <div className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 py-1.5 border-b border-[#EEF1F5]"
              >
                <span className="min-w-0 flex-1 text-[13px] truncate">
                  {item.item} <span className="opacity-50">{item.variasi}</span>
                </span>
                <input
                  type="number"
                  min={0}
                  className="w-28 text-right rounded-lg border border-[#E3E7EE] bg-white px-2.5 py-1 text-[13px]"
                  value={draftHarga[item.id] ?? String(item.harga)}
                  onChange={(e) =>
                    setDraftHarga((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="pas-btn pas-btn-ghost text-[12px] px-2.5 py-1"
                  disabled={savingId === item.id}
                  onClick={() => saveHarga(item)}
                >
                  {savingId === item.id ? "…" : "Simpan"}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] opacity-50">
            Harga baru langsung dipakai kalkulator di atas (padanan mengganti
            harga kain di sheet DAFTAR KAIN).
          </p>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-[#04123F] text-white text-[13px] px-4 py-2.5 shadow-lg z-50">
          {toast}
        </div>
      )}
      </div>
      )}

      {tab === "database" && <HppDatabase items={items} />}

      {tab === "kain" && <DaftarKain fabrics={fabrics} />}
      </div>
    </DashboardShell>
  );
}

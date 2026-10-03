"use client";

/**
 * Demo Kalkulator HPP — salinan UI dari components/admin/HppCalculator.tsx.
 *
 * Rumus sama persis dengan app asli (padanan sheet Excel):
 *   - pilih variasi per kategori (boleh dikosongkan → baris tidak dihitung);
 *   - DTF dan Biaya Tak Terduga selalu ditambahkan (Rp5.000);
 *   - TOTAL HPP = jumlah semua baris terisi;
 *   - MARGIN bisa diedit (default 50.000);
 *   - HARGA JUAL = TOTAL HPP + MARGIN.
 *
 * Bedanya dengan admin: data in-memory dari demo-store (setDemo) — edit harga
 * di panel "Edit Harga", tab Database HPP, dan tab Daftar Kain langsung ikut
 * ke kalkulator lewat store bersama, tanpa Supabase.
 */
import { Fragment, useMemo, useState } from "react";
import type { HppItem } from "@/lib/demo-seed";
import { konversiAtasan, konversiCelana } from "@/lib/demo-seed";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { PageHead, rp } from "@/components/penawaran/demo/ui";
import RupiahInput from "@/components/admin/RupiahInput";
import HppDatabaseDemo from "@/components/penawaran/demo/HppDatabaseDemo";
import DaftarKainDemo from "@/components/penawaran/demo/DaftarKainDemo";

/** Baris pilihan kalkulator — urutan & label mengikuti Excel (A36–A45). */
const CALC_ROWS = [
  { key: "kain_atasan", label: "Kain Atasan", item: "Kain Atasan", defaultVariasi: "" },
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
const FIXED_ROWS = ["DTF", "Biaya Tak Terduga"] as const;
const DEFAULT_MARGIN = 50_000;

/** Tab sheet — padanan tab sheet Excel: Kalkulator, DATABASE HPP, DAFTAR KAIN. */
const TABS = [
  { key: "kalkulator", label: "Kalkulator" },
  { key: "database", label: "Database HPP" },
  { key: "kain", label: "Daftar Kain" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function DemoHpp() {
  const s = useDemo();
  const items = s.hppItems;
  const [tab, setTab] = useState<TabKey>("kalkulator");
  const [margin, setMargin] = useState<number>(DEFAULT_MARGIN);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    // Nilai awal mengikuti Excel/app asli: sebagian kolom variasi sudah terisi.
    const initial: Record<string, string> = {};
    for (const row of CALC_ROWS) initial[row.key] = row.defaultVariasi;
    return initial;
  });
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [draftHarga, setDraftHarga] = useState<Record<number, number>>({});

  const priceByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(`${item.item}|${item.variasi}`, item.harga);
    return map;
  }, [items]);

  const lines = useMemo(() => {
    // Kain dari tab Daftar Kain ikut jadi pilihan kalkulator: harga per kg
    // sudah dikonversi ke per pcs (atasan 4 pcs / celana 5 pcs), jadi kain
    // yang baru ditambahkan otomatis muncul di dropdown.
    const kainAtasan = new Map<string, number>();
    const kainCelana = new Map<string, number>();
    for (const f of s.kains) {
      kainAtasan.set(f.nama, konversiAtasan(f.hargaPerKg));
      kainCelana.set(f.nama, konversiCelana(f.hargaPerKg));
    }
    const hargaUntuk = (key: string, item: string, variasi: string) => {
      const dariDb = priceByKey.get(`${item}|${variasi}`);
      if (dariDb != null) return dariDb;
      if (key === "kain_atasan") return kainAtasan.get(variasi) ?? null;
      if (key === "kain_celana") return kainCelana.get(variasi) ?? null;
      return null;
    };
    const chosen = CALC_ROWS.map((row) => {
      const variasi = selected[row.key] ?? "";
      const harga = variasi ? hargaUntuk(row.key, row.item, variasi) : null;
      return { key: row.key, label: row.label, variasi, harga };
    });
    const fixed = FIXED_ROWS.map((item) => {
      // Seed demo menyimpan "Lain-lain" dengan variasi "Biaya Tak Terduga".
      const row = items.find(
        (it) => (item === "DTF" ? it.item === "DTF" : it.item === "Lain-lain" || it.item === "Biaya Tak Terduga")
      );
      return {
        key: item,
        label: item === "DTF" ? "DTF" : "Lain Lain",
        variasi: item,
        harga: row?.harga ?? 5_000,
      };
    });
    return [...chosen, ...fixed];
  }, [selected, priceByKey, s.kains, items]);

  // Opsi dropdown tiap baris: item dari database HPP + kain dari Daftar Kain.
  // Kain dikelompokkan per grup (Kain Basic/Premium/Pro, dst.) supaya
  // dropdown panjang tetap enak dibaca.
  type OpsiGrup = { label: string; options: { id: number; variasi: string }[] };
  const optionsFor = (rowDef: (typeof CALC_ROWS)[number]): OpsiGrup[] => {
    const dariDb = items
      .filter((it) => it.item === rowDef.item)
      .map((it) => ({ id: it.id, variasi: it.variasi }));
    if (rowDef.key === "kain_atasan" || rowDef.key === "kain_celana") {
      // Baris kain hanya memakai kain dari tab Daftar Kain, dikelompokkan
      // per grup (Kain Basic/Premium/Pro, dst.).
      const kain = s.kains;
      const grups: string[] = [];
      for (const f of kain) if (!grups.includes(f.grup)) grups.push(f.grup);
      return grups.map((g) => ({
        label: g,
        options: kain
          .filter((f) => f.grup === g)
          .map((f) => ({ id: -f.id, variasi: f.nama })),
      }));
    }
    return [{ label: "", options: dariDb }];
  };

  /** Opsi grup → <option>/<optgroup>. */
  const renderOpsi = (groups: OpsiGrup[]) => (
    <>
      {groups.map((g) =>
        g.label ? (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((opt) => (
              <option key={opt.id} value={opt.variasi}>
                {opt.variasi}
              </option>
            ))}
          </optgroup>
        ) : (
          <Fragment key="standar">
            {g.options.map((opt) => (
              <option key={opt.id} value={opt.variasi}>
                {opt.variasi}
              </option>
            ))}
          </Fragment>
        )
      )}
    </>
  );

  const totalHpp = lines.reduce((sum, line) => sum + (line.harga ?? 0), 0);
  const hargaJual = totalHpp + (Number.isFinite(margin) ? margin : 0);

  const saveHarga = (item: HppItem) => {
    const hargaBaru = draftHarga[item.id] ?? 0;
    if (hargaBaru <= 0 || hargaBaru === item.harga) {
      demoToast("Isi harga dulu");
      return;
    }
    setDemo({ hppItems: items.map((it) => (it.id === item.id ? { ...it, harga: hargaBaru } : it)) });
    demoToast("Harga tersimpan ✅");
  };

  const isEmpty = items.length === 0;

  return (
    <div>
      <PageHead
        kicker="Operasional"
        title="Kalkulator HPP"
        action={
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
      />

      <div className="max-w-4xl mx-auto">
        {/* ── TAB SHEET (padanan tab sheet di Excel) ──
            Di mobile: menempel di atas saat discroll supaya selalu terjangkau
            jempol, target sentuh besar, dan ada umpan balik saat ditekan. */}
        <div className="sticky top-0 z-20 -mx-5 px-5 py-2.5 bg-[var(--pas-bg)]/90 backdrop-blur-sm sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:backdrop-blur-none mb-1 sm:mb-6">
          <div className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-[var(--pas-line)] bg-white/95 p-1.5 shadow-sm sm:inline-flex sm:w-auto sm:gap-0">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={
                  "rounded-xl px-2 py-3 sm:px-4 sm:py-2 text-[13px] font-semibold transition text-center whitespace-nowrap touch-manipulation active:scale-[0.97] " +
                  (tab === t.key
                    ? "bg-gradient-to-b from-[#04123F] to-[#0A2465] text-white shadow-sm"
                    : "text-[var(--pas-muted)] hover:text-[var(--pas-ink-1)]")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "kalkulator" && isEmpty && (
          <div className="py-16 text-center">
            <p className="text-sm opacity-70">
              Data HPP demo kosong — gunakan tombol Reset Demo untuk
              memulihkan data awalnya.
            </p>
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
                    const options = rowDef ? optionsFor(rowDef) : [];
                    return (
                      <tr key={line.key} className={index % 2 ? "bg-[#F7F8FA]" : ""}>
                        <td className="px-4 py-2.5 font-medium align-middle">
                          {line.label}
                          {options.length === 0 && rowDef && (
                            <span className="block text-[11px] opacity-50">belum ada di database</span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 align-middle">
                          {rowDef && options.length > 0 ? (
                            <select
                              className="w-full max-w-[180px] rounded-lg border border-[#E3E7EE] bg-white px-2.5 py-1.5 text-sm"
                              value={line.variasi}
                              onChange={(e) =>
                                setSelected((prev) => ({ ...prev, [line.key]: e.target.value }))
                              }
                            >
                              <option value="">—</option>
                              {renderOpsi(options)}
                            </select>
                          ) : (
                            <span className="opacity-70">{line.variasi}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold align-middle">
                          {line.harga != null ? rp(line.harga) : "—"}
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
                    <td className="px-4 py-3 text-right font-bold">{rp(totalHpp)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium" colSpan={2}>
                      MARGIN
                    </td>
                    <td className="px-4 py-2 text-right">
                      <RupiahInput
                        className="w-36"
                        value={Number.isFinite(margin) ? margin : 0}
                        onValueChange={setMargin}
                      />
                    </td>
                  </tr>
                  <tr className="bg-[#FEC40B]/10">
                    <td className="px-4 py-3 font-bold" colSpan={2}>
                      HARGA JUAL
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[15px]">{rp(hargaJual)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ── KALKULATOR (MOBILE) ── */}
            <div className="pas-card overflow-hidden sm:hidden">
              <div className="divide-y divide-[#EEF1F5]">
                {lines.map((line) => {
                  const rowDef = CALC_ROWS.find((r) => r.key === line.key);
                  const options = rowDef ? optionsFor(rowDef) : [];
                  return (
                    <div key={line.key} className="px-4 py-3.5">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-[13.5px] font-medium leading-snug">
                          {line.label}
                          {options.length === 0 && rowDef && (
                            <span className="block text-[11px] opacity-50">belum ada di database</span>
                          )}
                        </span>
                        <span className="text-[13.5px] font-bold tabular-nums whitespace-nowrap">
                          {line.harga != null ? rp(line.harga) : "—"}
                        </span>
                      </div>
                      {rowDef && options.length > 0 ? (
                        <select
                          className="w-full rounded-xl border border-[#E3E7EE] bg-[#F7F8FA] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#04123F] focus:bg-white"
                          value={line.variasi}
                          onChange={(e) =>
                            setSelected((prev) => ({ ...prev, [line.key]: e.target.value }))
                          }
                        >
                          <option value="">—</option>
                          {renderOpsi(options)}
                        </select>
                      ) : (
                        <span className="block text-[13px] opacity-70">{line.variasi || "—"}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-4 border-t border-[#E3E7EE] space-y-3">
                <div className="flex items-center justify-between font-bold">
                  <span>TOTAL HPP</span>
                  <span>{rp(totalHpp)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">MARGIN</span>
                  <RupiahInput
                    className="w-32 shrink-0"
                    value={Number.isFinite(margin) ? margin : 0}
                    onValueChange={setMargin}
                  />
                </div>
                <div className="flex items-center justify-between font-bold rounded-xl bg-[#FEC40B]/10 px-3 py-3">
                  <span>HARGA JUAL</span>
                  <span className="text-[15px]">{rp(hargaJual)}</span>
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
                      <RupiahInput
                        className="w-32 shrink-0"
                        value={draftHarga[item.id] ?? item.harga}
                        onValueChange={(n) =>
                          setDraftHarga((prev) => ({ ...prev, [item.id]: n }))
                        }
                      />
                      <button
                        type="button"
                        className="pas-btn pas-btn-ghost text-[12px] px-2.5 py-1"
                        onClick={() => saveHarga(item)}
                      >
                        Simpan
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[11.5px] opacity-50">
                  Harga baru langsung dipakai kalkulator di atas (padanan
                  mengganti harga kain di sheet DAFTAR KAIN).
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "database" && <HppDatabaseDemo />}
        {tab === "kain" && <DaftarKainDemo />}
      </div>
    </div>
  );
}

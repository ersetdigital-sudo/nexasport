"use client";

/**
 * Demo Kalkulator HPP — halaman andalan demo. 3 tab pill: Kalkulator,
 * Database HPP (edit inline), Daftar Kain (tambah/hapus). Semua in-memory.
 * Rumus sama dengan app asli: harga kain per pcs = harga/kg ÷ 4 (atasan)
 * atau ÷ 5 (celana), dibulatkan ke Rp50. DTF & Lain-lain otomatis Rp5.000.
 */
import { useMemo, useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { konversiAtasan, konversiCelana, type HppItem, type Kain } from "@/lib/demo-seed";
import { PageHead, Kartu, BtnKuning, rp } from "@/components/penawaran/demo/ui";
import RupiahInput from "@/components/admin/RupiahInput";

const TABS = ["Kalkulator", "Database HPP", "Daftar Kain"] as const;

const BARIS = [
  { key: "kain_atasan", label: "Kain Atasan", item: "Kain Atasan" },
  { key: "kain_celana", label: "Kain Celana", item: "Kain Celana" },
  { key: "print_atasan", label: "Print/Press Atasan", item: "Print Atasan" },
  { key: "print_celana", label: "Print/Press Celana", item: "Print Celana" },
  { key: "jahit_atasan", label: "Jahit Atasan", item: "Jahit Atasan" },
  { key: "jahit_celana", label: "Jahit Celana", item: "Jahit Celana" },
  { key: "logo", label: "Logo", item: "Logo" },
  { key: "collar", label: "Collar", item: "Rib Collar" },
  { key: "cuff", label: "Cuff", item: "Rib Cuff" },
  { key: "namset", label: "Namset", item: "Namset" },
] as const;

/** Kondisi awal demo = sama persis dengan contoh di landing page. */
const AWAL: Record<string, string> = {
  kain_atasan: "PUMA",
  print_atasan: "Atasan",
  jahit_atasan: "Basic",
};

const WARNA: Record<string, string> = {
  Kain: "bg-[#FEF9C3] text-[#854D0E]",
  "Print/Press": "bg-[#DBEAFE] text-[#1E40AF]",
  "Jahit Atasan": "bg-[#DCFCE7] text-[#166534]",
  "Jahit Celana": "bg-[#DCFCE7] text-[#166534]",
  Logo: "bg-[#FCE7F3] text-[#9D174D]",
  Collar: "bg-[#CFFAFE] text-[#155E75]",
  "Rib Collar": "bg-[#CFFAFE] text-[#155E75]",
  Cuff: "bg-[#CFFAFE] text-[#155E75]",
  "Rib Cuff": "bg-[#CFFAFE] text-[#155E75]",
  Namset: "bg-[#FFEDD5] text-[#9A3412]",
  DTF: "bg-[#F1F5F9] text-[#334155]",
  Operasional: "bg-[#EDE9FE] text-[#5B21B6]",
};

export default function DemoHpp() {
  const s = useDemo();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Kalkulator");

  return (
    <div>
      <PageHead title="Kalkulator HPP" />
      <div className="mb-5 grid w-full max-w-md grid-cols-3 gap-1 rounded-2xl border border-[#E9EDF2] bg-white p-1.5 shadow-sm sm:inline-flex sm:w-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              "rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition text-center whitespace-nowrap " +
              (tab === t ? "bg-gradient-to-b from-[#0B1A5C] to-[#12266E] text-white shadow-sm" : "text-[#64748B] hover:text-[#0B1A5C]")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Kalkulator" && <Kalkulator />}
      {tab === "Database HPP" && <Database />}
      {tab === "Daftar Kain" && <DaftarKain />}
    </div>
  );
}

/* ══ TAB KALKULATOR ══ */
function Kalkulator() {
  const s = useDemo();
  const [selected, setSelected] = useState<Record<string, string>>(AWAL);
  const [margin, setMargin] = useState(50_000);

  const hargaUntuk = (key: string, item: string, variasi: string): number | null => {
    const dariDb = s.hppItems.find((it) => it.item === item && it.variasi === variasi);
    if (dariDb) return dariDb.harga;
    const kain = s.kains.find((k) => k.nama === variasi);
    if (kain) {
      if (key === "kain_atasan") return konversiAtasan(kain.hargaPerKg);
      if (key === "kain_celana") return konversiCelana(kain.hargaPerKg);
    }
    return null;
  };

  const lines = useMemo(() => {
    const chosen = BARIS.map((b) => {
      const variasi = selected[b.key] ?? "";
      return { ...b, variasi, harga: variasi ? hargaUntuk(b.key, b.item, variasi) : null };
    });
    const fixed = [
      { key: "dtf", label: "DTF", item: "DTF", variasi: "otomatis", harga: s.hppItems.find((it) => it.item === "DTF")?.harga ?? 5_000 },
      { key: "lain", label: "Lain-lain", item: "Lain-lain", variasi: "otomatis", harga: s.hppItems.find((it) => it.item === "Lain-lain")?.harga ?? 5_000 },
    ];
    return [...chosen, ...fixed];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, s.hppItems, s.kains]);

  const total = lines.reduce((a, l) => a + (l.harga ?? 0), 0);
  const jual = total + margin;

  const kosongkan = () => {
    setSelected(Object.fromEntries(BARIS.map((b) => [b.key, ""])));
    setMargin(50_000);
    demoToast("Kalkulator dikosongkan");
  };

  return (
    <div className="max-w-3xl">
      <p className="mb-4 text-[13px] text-[#64748B]">Pilih variasi pada tiap kategori. Boleh dikosongkan.</p>
      <Kartu>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13.5px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-wide text-[#94A3B8]">
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-2 py-3 font-semibold">Item / Variasi</th>
                <th className="px-4 py-3 text-right font-semibold">Harga</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => {
                const isKain = l.key === "kain_atasan" || l.key === "kain_celana";
                const grups = isKain ? [...new Set(s.kains.map((k) => k.grup))] : [];
                const opsi = isKain
                  ? null
                  : s.hppItems.filter((it) => it.item === l.item).map((it) => it.variasi);
                return (
                  <tr key={l.key} className={i % 2 ? "bg-[#FAFBFC]" : ""}>
                    <td className="px-4 py-2.5 font-semibold text-[#0B1A5C]">{l.label}</td>
                    <td className="px-2 py-2.5">
                      {l.key === "dtf" || l.key === "lain" ? (
                        <span className="text-[12px] text-[#94A3B8]">otomatis</span>
                      ) : isKain ? (
                        <select
                          value={l.variasi}
                          onChange={(e) => setSelected((p) => ({ ...p, [l.key]: e.target.value }))}
                          className="w-full max-w-[240px] rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#0B1A5C]"
                        >
                          <option value="">—</option>
                          {grups.map((g) => (
                            <optgroup key={g} label={g}>
                              {s.kains
                                .filter((k) => k.grup === g)
                                .map((k) => (
                                  <option key={k.id} value={k.nama}>{k.nama}</option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      ) : opsi && opsi.length > 0 ? (
                        <select
                          value={l.variasi}
                          onChange={(e) => setSelected((p) => ({ ...p, [l.key]: e.target.value }))}
                          className="w-full max-w-[240px] rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#0B1A5C]"
                        >
                          <option value="">—</option>
                          {opsi.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[12px] text-[#94A3B8]">belum ada di database</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold tabular-nums text-[#0B1A5C]">
                      {l.harga != null ? rp(l.harga) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#E2E8F0]">
                <td className="px-4 py-3 font-bold" colSpan={2}>TOTAL HPP</td>
                <td className="px-4 py-3 text-right font-bold tabular-nums text-[#0B1A5C]">{rp(total)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold" colSpan={2}>MARGIN</td>
                <td className="px-4 py-2">
                  <RupiahInput className="ml-auto w-36" value={margin} onValueChange={setMargin} />
                </td>
              </tr>
              <tr className="bg-[#FFC107]/10">
                <td className="px-4 py-3 font-bold" colSpan={2}>HARGA JUAL</td>
                <td className="px-4 py-3 text-right font-extrabold tabular-nums text-[15px] text-[#0B1A5C]">{rp(jual)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Kartu>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11.5px] text-[#94A3B8]">
          DTF dan Lain-lain otomatis Rp5.000. Total HPP dan Harga Jual otomatis.
        </p>
        <BtnKuning onClick={kosongkan}>Kosongkan</BtnKuning>
      </div>
    </div>
  );
}

/* ══ TAB DATABASE HPP (edit inline) ══ */
function Database() {
  const s = useDemo();
  const [editId, setEditId] = useState<number | null>(null);
  const [draft, setDraft] = useState(0);

  const simpan = (it: HppItem) => {
    if (draft <= 0 || draft === it.harga) {
      setEditId(null);
      return;
    }
    setDemo({ hppItems: s.hppItems.map((x) => (x.id === it.id ? { ...x, harga: draft } : x)) });
    setEditId(null);
    demoToast("Harga tersimpan — semua hitungan ikut berubah");
  };

  return (
    <Kartu>
      <div className="border-b border-[#E9EDF2] bg-gradient-to-r from-[#0B1A5C] to-[#12266E] px-5 py-4">
        <h2 className="text-[15px] font-bold text-white">Database HPP</h2>
        <p className="mt-0.5 text-[12px] text-white/60">{s.hppItems.length} item — klik harga untuk edit langsung</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-[13px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-wide text-[#94A3B8]">
              {["No", "Kategori", "Item", "Variasi", "Harga HPP", "Satuan"].map((h, i) => (
                <th key={h} className={`px-4 py-3 font-semibold ${i === 4 ? "text-right" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.hppItems.map((it, i) => (
              <tr key={it.id} className={`transition hover:bg-[#F1F5F9] ${i % 2 ? "bg-[#FAFBFC]" : ""}`}>
                <td className="px-4 py-2.5 tabular-nums text-[#94A3B8]">{i + 1}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${WARNA[it.kategori] ?? "bg-[#F1F5F9] text-[#334155]"}`}>
                    {it.kategori}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-semibold text-[#0B1A5C]">{it.item}</td>
                <td className="px-4 py-2.5 text-[#475569]">{it.variasi}</td>
                <td className="px-4 py-2.5 text-right">
                  {editId === it.id ? (
                    <span className="inline-flex items-center gap-1.5">
                      <RupiahInput
                        autoFocus
                        className="w-32"
                        value={draft}
                        onValueChange={setDraft}
                      />
                      <button type="button" className="rounded-lg bg-[#FFC107] px-2.5 py-1.5 text-[11px] font-bold text-[#3A2B00]" onClick={() => simpan(it)}>✓</button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      title="Klik untuk edit harga"
                      onClick={() => {
                        setEditId(it.id);
                        setDraft(it.harga);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-bold tabular-nums text-[#0B1A5C] transition hover:bg-[#EEF1F5]"
                    >
                      {rp(it.harga)} <span className="text-[11px] opacity-40">✏️</span>
                    </button>
                  )}
                </td>
                <td className="px-4 py-2.5 text-[#94A3B8]">{it.satuan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Kartu>
  );
}

/* ══ TAB DAFTAR KAIN (tambah / hapus / edit harga/kg) ══ */
function DaftarKain() {
  const s = useDemo();
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ grup: "Kain Basic", nama: "", hargaPerKg: 0 });
  const [editId, setEditId] = useState<number | null>(null);
  const [kgDraft, setKgDraft] = useState(0);

  const grups = [...new Set(s.kains.map((k) => k.grup))];

  const tambah = () => {
    if (!draft.nama.trim() || draft.hargaPerKg <= 0) {
      demoToast("Isi nama kain dan harga per kg dulu");
      return;
    }
    const id = Math.max(0, ...s.kains.map((k) => k.id)) + 1;
    setDemo({ kains: [...s.kains, { id, grup: draft.grup, nama: draft.nama.trim().toUpperCase(), hargaPerKg: draft.hargaPerKg, stok: 0 }] });
    setFormOpen(false);
    setDraft({ grup: "Kain Basic", nama: "", hargaPerKg: 0 });
    demoToast("Kain ditambahkan — langsung muncul di Kalkulator");
  };

  const simpanKg = (k: Kain) => {
    if (kgDraft <= 0 || kgDraft === k.hargaPerKg) {
      setEditId(null);
      return;
    }
    setDemo({ kains: s.kains.map((x) => (x.id === k.id ? { ...x, hargaPerKg: kgDraft } : x)) });
    setEditId(null);
    demoToast("Harga/kg tersimpan — harga pcs ikut dihitung ulang");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] text-[#64748B]">
          1 kg = 4 pcs atasan / 5 pcs celana. Harga/kg di sini langsung dipakai tab Kalkulator.
        </p>
        <BtnKuning onClick={() => setFormOpen(true)}>+ Tambah Kain</BtnKuning>
      </div>
      {formOpen && (
        <Kartu className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={draft.grup}
              onChange={(e) => setDraft((d) => ({ ...d, grup: e.target.value }))}
              className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13.5px] outline-none"
            >
              {grups.map((g) => <option key={g}>{g}</option>)}
              <option>Kain Basic</option>
            </select>
            <input
              value={draft.nama}
              onChange={(e) => setDraft((d) => ({ ...d, nama: e.target.value }))}
              placeholder="Nama kain, mis. BIRON"
              className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#0B1A5C] focus:bg-white"
            />
            <RupiahInput value={draft.hargaPerKg} onValueChange={(n) => setDraft((d) => ({ ...d, hargaPerKg: n }))} className="w-full sm:w-44" />
          </div>
          <div className="mt-3 flex justify-end">
            <BtnKuning onClick={tambah}>Simpan Kain</BtnKuning>
          </div>
        </Kartu>
      )}
      {grups.map((g) => (
        <Kartu key={g}>
          <div className="flex items-center justify-between bg-[#F1F5F9] px-5 py-3">
            <h3 className="text-[14px] font-bold text-[#0B1A5C]">{g}</h3>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#475569]">
              {s.kains.filter((k) => k.grup === g).length} kain
            </span>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {s.kains.filter((k) => k.grup === g).map((k) => (
              <div key={k.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <span className="min-w-28 text-[13.5px] font-bold text-[#0B1A5C]">{k.nama}</span>
                {editId === k.id ? (
                  <span className="inline-flex items-center gap-1.5">
                    <RupiahInput autoFocus className="w-32" value={kgDraft} onValueChange={setKgDraft} />
                    <button type="button" className="rounded-lg bg-[#FFC107] px-2.5 py-1.5 text-[11px] font-bold text-[#3A2B00]" onClick={() => simpanKg(k)}>✓</button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setEditId(k.id); setKgDraft(k.hargaPerKg); }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold tabular-nums text-[#334155] transition hover:bg-[#EEF1F5]"
                    title="Klik untuk edit harga/kg"
                  >
                    {rp(k.hargaPerKg)}/kg <span className="text-[11px] opacity-40">✏️</span>
                  </button>
                )}
                <span className="text-[12px] text-[#94A3B8]">stok {k.stok}</span>
                <span className="ml-auto text-[12px] text-[#64748B] tabular-nums">
                  Atasan {rp(konversiAtasan(k.hargaPerKg))} · Celana {rp(konversiCelana(k.hargaPerKg))}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDemo({ kains: s.kains.filter((x) => x.id !== k.id) });
                    demoToast("Kain dihapus");
                  }}
                  className="rounded-lg px-2 py-1 text-[12px] font-bold text-red-400 transition hover:bg-red-50"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </Kartu>
      ))}
    </div>
  );
}

"use client";

/**
 * Tab "Daftar Kain" (demo) — salinan UI dari components/admin/DaftarKain.tsx:
 * grup kain (Basic/Premium/Pro) dengan aksen baris masing-masing, harga per
 * kg yang bisa diedit inline, dan kolom hasil jadi per pcs (atasan 4 pcs /
 * celana 5 pcs).
 *
 * Bedanya dengan admin: data in-memory dari demo-store, dan harga per pcs
 * dihitung dari hargaPerKg lewat konversiAtasan/konversiCelana (rumus sama
 * dengan lib/kain-konversi.ts: dibulatkan ke Rp50 terdekat).
 */
import { useRef, useState } from "react";
import type { Kain } from "@/lib/demo-seed";
import { konversiAtasan, konversiCelana } from "@/lib/demo-seed";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { rp } from "@/components/penawaran/demo/ui";
import RupiahInput from "@/components/admin/RupiahInput";

/** Aksen header tiap grup kain. */
const GRUP_META: Record<string, { bar: string; badge: string }> = {
  "Kain Basic": { bar: "bg-[#F1F5F9]", badge: "bg-[#E2E8F0] text-[#334155]" },
  "Kain Premium": { bar: "bg-[#FEF3C7]", badge: "bg-[#FDE68A] text-[#92400E]" },
  "Kain Pro": { bar: "bg-[#E0E7FF]", badge: "bg-[#C7D2FE] text-[#3730A3]" },
};
const FALLBACK_GRUP = { bar: "bg-[#F1F5F9]", badge: "bg-[#E2E8F0] text-[#334155]" };

/** Nilai khusus opsi "grup baru" pada pilihan grup. */
const GRUP_BARU = "__grup_baru__";

export default function DaftarKainDemo() {
  const s = useDemo();
  const fabrics = s.kains;

  const [showForm, setShowForm] = useState(false);
  const [grupPilihan, setGrupPilihan] = useState("");
  const [grupBaru, setGrupBaru] = useState("");
  const [nama, setNama] = useState("");
  const [hargaPerKg, setHargaPerKg] = useState(0);
  const [error, setError] = useState("");
  // Edit harga/kg inline: satu baris aktif dalam satu waktu (klik harga →
  // ketik → Enter simpan, Esc batal — sama seperti tab Database HPP).
  const [editingKgId, setEditingKgId] = useState<number | null>(null);
  const [kgDraft, setKgDraft] = useState(0);
  const batalKg = useRef(false);

  if (fabrics.length === 0) {
    return (
      <div className="pas-card p-6 text-sm opacity-70">
        Daftar kain demo kosong — gunakan tombol Reset Demo untuk memulihkan
        datanya.
      </div>
    );
  }

  // Grup dijaga urutan kemunculan pertama (mengikuti urutan seed demo).
  const grups: string[] = [];
  for (const f of fabrics) if (!grups.includes(f.grup)) grups.push(f.grup);

  const pratinjau = hargaPerKg > 0 ? { atasan: konversiAtasan(hargaPerKg), celana: konversiCelana(hargaPerKg) } : null;

  const tambahKain = (e: React.FormEvent) => {
    e.preventDefault();
    const grupFinal = (grupPilihan === GRUP_BARU ? grupBaru : grupPilihan).trim();
    if (!grupFinal || !nama.trim() || hargaPerKg <= 0) {
      setError("Lengkapi grup, nama kain, dan harga per kg.");
      return;
    }
    const kain: Kain = {
      id: Math.max(0, ...fabrics.map((f) => f.id)) + 1,
      grup: grupFinal,
      nama: nama.trim().toUpperCase(),
      hargaPerKg,
      stok: 0,
    };
    setDemo({ kains: [...fabrics, kain] });
    setShowForm(false);
    setNama("");
    setHargaPerKg(0);
    setGrupPilihan("");
    setGrupBaru("");
    setError("");
    demoToast("Kain ditambahkan — langsung muncul di Kalkulator");
  };

  /** Simpan harga per kg — harga per pcs dihitung ulang otomatis. */
  const commitKg = (f: Kain) => {
    if (editingKgId !== f.id) return;
    if (kgDraft <= 0 || kgDraft === f.hargaPerKg) {
      setEditingKgId(null);
      return;
    }
    setDemo({ kains: fabrics.map((x) => (x.id === f.id ? { ...x, hargaPerKg: kgDraft } : x)) });
    setEditingKgId(null);
    demoToast("Harga/kg tersimpan — harga pcs ikut dihitung ulang");
  };

  /** Sel harga/kg: tampil format rupiah, klik → edit langsung di baris. */
  const selHargaKg = (f: Kain) =>
    editingKgId === f.id ? (
      <span className="inline-flex items-center gap-1.5">
        <RupiahInput
          autoFocus
          className="w-28"
          value={kgDraft}
          onValueChange={setKgDraft}
          onBlur={() => {
            if (batalKg.current) {
              batalKg.current = false;
              setEditingKgId(null);
              return;
            }
            commitKg(f);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitKg(f);
            if (e.key === "Escape") {
              batalKg.current = true;
              setEditingKgId(null);
            }
          }}
        />
        <button
          type="button"
          title="Simpan"
          // preventDefault: input tetap fokus, blur tidak memicu simpan ganda.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => commitKg(f)}
          className="pas-btn pas-btn-accent text-[11px] px-2 py-1 whitespace-nowrap"
        >
          ✓
        </button>
      </span>
    ) : (
      <button
        type="button"
        title="Klik untuk edit harga/kg"
        onClick={() => {
          setEditingKgId(f.id);
          setKgDraft(f.hargaPerKg);
        }}
        className="group inline-flex items-center gap-1.5 font-semibold tabular-nums rounded-lg px-2 py-1 -mx-2 hover:bg-[#EEF1F5] transition"
      >
        {rp(f.hargaPerKg)}
        <span className="text-[11px] opacity-40 transition sm:opacity-0 sm:group-hover:opacity-60">✏️</span>
      </button>
    );

  return (
    <div>
      <div className="pas-card overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-[#04123F] via-[#0A2465] to-[#123A8F] px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-white font-bold text-[15px] leading-tight">Daftar Kain</h2>
            <p className="text-white/60 text-[12px] mt-0.5">
              {fabrics.length} kain — harga per kg otomatis jadi harga per pcs:
              1 kg = 4 pcs atasan / 5 pcs celana
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="pas-btn pas-btn-accent whitespace-nowrap px-3.5 py-2.5 text-[14px]"
          >
            {showForm ? "Tutup" : "+ Tambah Kain"}
          </button>
        </div>
      </div>

      {/* ── FORM TAMBAH KAIN ── */}
      {showForm && (
        <form onSubmit={tambahKain} className="pas-card p-4 sm:p-5 mb-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                Grup
              </span>
              <select
                value={grupPilihan}
                onChange={(e) => setGrupPilihan(e.target.value)}
                className="w-full rounded-lg border border-[#E3E7EE] bg-white px-3 py-2.5 text-sm"
              >
                <option value="">— pilih grup —</option>
                {grups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
                <option value={GRUP_BARU}>+ Grup baru…</option>
              </select>
            </label>
            {grupPilihan === GRUP_BARU && (
              <label className="block">
                <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                  Nama grup baru
                </span>
                <input
                  value={grupBaru}
                  onChange={(e) => setGrupBaru(e.target.value)}
                  placeholder="mis. Kain Spandek"
                  className="w-full rounded-lg border border-[#E3E7EE] bg-white px-3 py-2.5 text-sm"
                />
              </label>
            )}
            <label className="block">
              <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                Nama kain
              </span>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="mis. BIRON"
                className="w-full rounded-lg border border-[#E3E7EE] bg-white px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-[11.5px] font-semibold uppercase tracking-wide opacity-50 mb-1.5">
                Harga per kg (Rp)
              </span>
              <RupiahInput value={hargaPerKg} onValueChange={setHargaPerKg} className="w-full sm:w-44" />
            </label>
            <button type="submit" className="pas-btn pas-btn-accent px-4 py-2.5 text-[14px]">
              Simpan
            </button>
          </div>
          {pratinjau && (
            <p className="mt-3 text-[12.5px] opacity-70">
              Otomatis: 1 kg → Atasan{" "}
              <span className="font-semibold">{rp(pratinjau.atasan)}/pcs</span>
              {" · "}Celana{" "}
              <span className="font-semibold">{rp(pratinjau.celana)}/pcs</span>
            </p>
          )}
          {error && <p className="mt-2 text-[12.5px] text-red-600">{error}</p>}
        </form>
      )}

      <div className="flex flex-col gap-5">
        {grups.map((grup) => {
          const meta = GRUP_META[grup] ?? FALLBACK_GRUP;
          const rows = fabrics.filter((f) => f.grup === grup);
          return (
            <div key={grup} className="pas-card overflow-hidden">
              <div className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 ${meta.bar}`}>
                <h2 className="font-bold text-[15px]">{grup}</h2>
                <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${meta.badge}`}>
                  {rows.length} kain
                </span>
              </div>
              <div className="hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11.5px] uppercase tracking-wide opacity-50">
                      <th className="px-4 py-2.5 font-semibold w-14">No</th>
                      <th className="px-2 py-2.5 font-semibold">Nama Kain</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Hrg/Kg</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Atasan Jadi 4 Pcs</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Celana Jadi 5 Pcs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((f, i) => (
                      <tr
                        key={f.id}
                        className={(i % 2 ? "bg-[#F7F8FA] " : "") + "transition-colors hover:bg-[#EEF2F8]"}
                      >
                        <td className="px-4 py-2.5 opacity-40 tabular-nums">{i + 1}</td>
                        <td className="px-2 py-2.5 font-medium">{f.nama}</td>
                        <td className="px-3 py-2.5 text-right">{selHargaKg(f)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{rp(konversiAtasan(f.hargaPerKg))}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{rp(konversiCelana(f.hargaPerKg))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* ── DAFTAR KAIN (MOBILE) ── */}
              <div className="sm:hidden divide-y divide-[#EEF1F5]">
                {rows.map((f) => (
                  <div key={f.id} className="px-4 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold leading-tight">{f.nama}</span>
                        <span className="mt-0.5 block text-[10.5px] font-medium uppercase tracking-wider opacity-45">
                          Harga per kg
                        </span>
                      </div>
                      {selHargaKg(f)}
                    </div>
                    <div className={`mt-3 flex items-stretch overflow-hidden rounded-xl border border-white/70 shadow-sm ${meta.bar}`}>
                      <div className="flex-1 px-3.5 py-2.5">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-50">
                          Atasan · 4 pcs
                        </span>
                        <span className="mt-0.5 block text-[13.5px] font-bold tabular-nums">
                          {rp(konversiAtasan(f.hargaPerKg))}
                        </span>
                      </div>
                      <div className="w-px bg-white/80" />
                      <div className="flex-1 px-3.5 py-2.5">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-50">
                          Celana · 5 pcs
                        </span>
                        <span className="mt-0.5 block text-[13.5px] font-bold tabular-nums">
                          {rp(konversiCelana(f.hargaPerKg))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11.5px] opacity-50">
        Ubah harga per kg dan harga per pcs langsung dihitung ulang otomatis
        (1 kg = 4 pcs atasan / 5 pcs celana).
      </p>
    </div>
  );
}

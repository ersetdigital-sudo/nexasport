"use client";

/**
 * Tab "Daftar Kain" — padanan sheet DAFTAR KAIN di Excel: daftar nama kain
 * per grup (Basic / Premium / Pro) dengan harga per kg dan hasil jadi
 * per pcs (atasan jadi 4 pcs, celana jadi 5 pcs).
 *
 * Bedanya dengan Excel: jenis kain bisa ditambah lewat tombol "Tambah Kain",
 * dan harga per kg bisa diedit langsung — harga per pcs dihitung ulang
 * otomatis dari harga per kg (lihat lib/kain-konversi.ts), tidak diketik
 * manual seperti di sheet.
 */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { KainFabric } from "@/lib/kain-server";
import { konversiHargaPcs } from "@/lib/kain-konversi";
import { rupiah } from "@/lib/rupiah";
import RupiahInput from "@/components/admin/RupiahInput";

/** Aksen header tiap grup kain. */
const GRUP_META: Record<string, { bar: string; badge: string; label: string }> = {
  "Kain Basic": {
    bar: "bg-[#F1F5F9]",
    badge: "bg-[#E2E8F0] text-[#334155]",
    label: "Kain Basic",
  },
  "Kain Premium": {
    bar: "bg-[#FEF3C7]",
    badge: "bg-[#FDE68A] text-[#92400E]",
    label: "Kain Premium",
  },
  "Kain Pro": {
    bar: "bg-[#E0E7FF]",
    badge: "bg-[#C7D2FE] text-[#3730A3]",
    label: "Kain Pro",
  },
};
const FALLBACK_GRUP = {
  bar: "bg-[#F1F5F9]",
  badge: "bg-[#E2E8F0] text-[#334155]",
  label: "",
};

/** Nilai khusus opsi "grup baru" pada pilihan grup. */
const GRUP_BARU = "__grup_baru__";

export default function DaftarKain({ fabrics }: { fabrics: KainFabric[] | null }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [grupPilihan, setGrupPilihan] = useState("");
  const [grupBaru, setGrupBaru] = useState("");
  const [nama, setNama] = useState("");
  const [hargaPerKg, setHargaPerKg] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Edit harga/kg inline: satu baris aktif dalam satu waktu (klik harga →
  // ketik → Enter simpan, Esc batal — sama seperti tab Database HPP).
  const [editingKgId, setEditingKgId] = useState<number | null>(null);
  const [kgDraft, setKgDraft] = useState(0);
  const [savingKg, setSavingKg] = useState<number | null>(null);
  const batalKg = useRef(false);
  const [toast, setToast] = useState("");

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  if (!fabrics || fabrics.length === 0) {
    return (
      <div className="pas-card p-6 text-sm opacity-70">
        Data Daftar Kain belum tersedia. Jalankan migrasi{" "}
        <code>0014_kain_fabrics.sql</code> di SQL Editor Supabase, lalu muat
        ulang halaman ini.
      </div>
    );
  }

  // Grup dijaga urutan kemunculan pertama (mengikuti kolom position di DB).
  const grups: string[] = [];
  for (const f of fabrics) if (!grups.includes(f.grup)) grups.push(f.grup);

  const kgNum = hargaPerKg;
  const pratinjau = kgNum > 0 ? konversiHargaPcs(kgNum) : null;

  const tambahKain = async (e: React.FormEvent) => {
    e.preventDefault();
    const grupFinal = (grupPilihan === GRUP_BARU ? grupBaru : grupPilihan).trim();
    if (!grupFinal || !nama.trim() || kgNum <= 0) {
      setError("Lengkapi grup, nama kain, dan harga per kg.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/pesanan/kain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grup: grupFinal,
          nama: nama.trim(),
          hargaPerKg: kgNum,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Gagal menambah kain");
        return;
      }
      setShowForm(false);
      setNama("");
      setHargaPerKg(0);
      setGrupBaru("");
      flash("Kain ditambahkan ✅");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  /** Simpan harga per kg → server menghitung ulang harga per pcs otomatis. */
  const commitKg = async (f: KainFabric) => {
    if (editingKgId !== f.id) return;
    if (kgDraft <= 0 || kgDraft === f.hargaPerKg) {
      setEditingKgId(null);
      return;
    }
    setSavingKg(f.id);
    try {
      const res = await fetch("/api/pesanan/kain", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: f.id, hargaPerKg: kgDraft }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        flash(data?.error ?? "Gagal menyimpan harga");
      } else {
        flash("Harga/kg tersimpan — harga pcs ikut dihitung ulang ✅");
        router.refresh();
      }
    } finally {
      setSavingKg(null);
      setEditingKgId(null);
    }
  };

  /** Sel harga/kg: tampil format rupiah, klik → edit langsung di baris. */
  const selHargaKg = (f: KainFabric) =>
    editingKgId === f.id ? (
      <span className="inline-flex items-center gap-1.5">
        <RupiahInput
          autoFocus
          disabled={savingKg === f.id}
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
          disabled={savingKg === f.id}
          onClick={() => commitKg(f)}
          className="pas-btn pas-btn-accent text-[11px] px-2 py-1 whitespace-nowrap"
        >
          {savingKg === f.id ? "…" : "✓"}
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
        {rupiah(f.hargaPerKg)}
        <span className="text-[11px] opacity-40 transition sm:opacity-0 sm:group-hover:opacity-60">✏️</span>
      </button>
    );

  return (
    <div>
      <div className="pas-card overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-[#04123F] via-[#0A2465] to-[#123A8F] px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-white font-bold text-[15px] leading-tight">
              Daftar Kain
            </h2>
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
                  <option key={g} value={g}>
                    {g}
                  </option>
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
              <RupiahInput
                value={hargaPerKg}
                onValueChange={setHargaPerKg}
                className="w-full sm:w-44"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="pas-btn pas-btn-accent px-4 py-2.5 text-[14px]"
            >
              {saving ? "…" : "Simpan"}
            </button>
          </div>
          {pratinjau && (
            <p className="mt-3 text-[12.5px] opacity-70">
              Otomatis: 1 kg → Atasan{" "}
              <span className="font-semibold">{rupiah(pratinjau.hargaAtasan)}/pcs</span>
              {" · "}Celana{" "}
              <span className="font-semibold">{rupiah(pratinjau.hargaCelana)}/pcs</span>
            </p>
          )}
          {error && <p className="mt-2 text-[12.5px] text-red-600">{error}</p>}
        </form>
      )}

      <div className="flex flex-col gap-5">
        {grups.map((grup) => {
          const meta = GRUP_META[grup] ?? { ...FALLBACK_GRUP, label: grup };
          const rows = fabrics.filter((f) => f.grup === grup);
          return (
            <div key={grup} className="pas-card overflow-hidden">
              <div className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 ${meta.bar}`}>
                <h2 className="font-bold text-[15px]">{meta.label}</h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${meta.badge}`}
                >
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
                      className={
                        (i % 2 ? "bg-[#F7F8FA] " : "") +
                        "transition-colors hover:bg-[#EEF2F8]"
                      }
                    >
                      <td className="px-4 py-2.5 opacity-40 tabular-nums">{i + 1}</td>
                      <td className="px-2 py-2.5 font-medium">{f.nama}</td>
                      <td className="px-3 py-2.5 text-right">{selHargaKg(f)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {f.hargaAtasan != null ? rupiah(f.hargaAtasan) : <span className="opacity-40">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {f.hargaCelana != null ? rupiah(f.hargaCelana) : <span className="opacity-40">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {/* ── DAFTAR KAIN (MOBILE) ── */}
              <div className="sm:hidden divide-y divide-[#EEF1F5]">
                {rows.map((f) => (
                  <div key={f.id} className="px-4 py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-medium">{f.nama}</span>
                      {selHargaKg(f)}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-[#F7F8FA] px-3.5 py-2.5">
                        <span className="block text-[10.5px] uppercase tracking-wide opacity-50">
                          Atasan · 4 pcs
                        </span>
                        <span className="text-[13px] font-semibold tabular-nums">
                          {f.hargaAtasan != null ? rupiah(f.hargaAtasan) : <span className="opacity-40">—</span>}
                        </span>
                      </div>
                      <div className="rounded-xl bg-[#F7F8FA] px-3.5 py-2.5">
                        <span className="block text-[10.5px] uppercase tracking-wide opacity-50">
                          Celana · 5 pcs
                        </span>
                        <span className="text-[13px] font-semibold tabular-nums">
                          {f.hargaCelana != null ? rupiah(f.hargaCelana) : <span className="opacity-40">—</span>}
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
        Padanan sheet DAFTAR KAIN di Excel — ubah harga per kg dan harga per pcs
        langsung dihitung ulang otomatis (1 kg = 4 pcs atasan / 5 pcs celana).
      </p>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-[#04123F] text-white text-[13px] px-4 py-2.5 shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

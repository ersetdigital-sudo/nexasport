"use client";

/**
 * Demo Pengaturan — profil usaha + preferensi (toast "Tersimpan (mode demo)")
 * dan kartu Tahap Produksi: 11 tahap, urutannya bisa ditukar pakai panah.
 * Urutan baru langsung dipakai timeline di halaman Pesanan.
 */
import { useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { PageHead, Kartu, BtnKuning } from "@/components/penawaran/demo/ui";

export default function DemoPengaturan() {
  const s = useDemo();
  const [profil, setProfil] = useState({ nama: "Nexa Sport Konveksi", wa: "0812-3456-7890", alamat: "Makassar, Sulawesi Selatan" });
  const [nowa, setNowa] = useState(true);

  const geser = (i: number, arah: -1 | 1) => {
    const baru = [...s.tahapan];
    const j = i + arah;
    [baru[i], baru[j]] = [baru[j], baru[i]];
    setDemo({ tahapan: baru });
  };

  return (
    <div>
      <PageHead kicker="Data" title="Pengaturan" />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Profil usaha */}
        <Kartu className="p-5">
          <h3 className="text-[14px] font-bold text-[#04123F]">Profil Usaha</h3>
          <div className="mt-4 grid gap-3">
            {([["Nama usaha", "nama"], ["Nomor WhatsApp", "wa"], ["Alamat", "alamat"]] as const).map(([label, key]) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">{label}</span>
                <input
                  value={profil[key]}
                  onChange={(e) => setProfil((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#04123F] focus:bg-white"
                />
              </label>
            ))}
            <div>
              <BtnKuning onClick={() => demoToast("Tersimpan (mode demo)")}>Simpan</BtnKuning>
            </div>
          </div>
        </Kartu>

        {/* Preferensi */}
        <Kartu className="p-5">
          <h3 className="text-[14px] font-bold text-[#04123F]">Preferensi</h3>
          <div className="mt-4 space-y-3">
            {[
              ["Notifikasi deadline WhatsApp", nowa, () => setNowa((v) => !v)],
              ["Ringkasan mingguan via email", true, () => demoToast("Preferensi diubah (mode demo)")],
              ["Tampilkan logo di laporan", true, () => demoToast("Preferensi diubah (mode demo)")],
            ].map(([label, aktif, onClick], i) => (
              <button key={i} type="button" onClick={onClick as () => void} className="flex w-full items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3 text-left">
                <span className="text-[13.5px] font-semibold text-[#334155]">{label as string}</span>
                <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${(aktif as boolean) ? "bg-[#FEC40B]" : "bg-[#E2E8F0]"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${(aktif as boolean) ? "left-[22px]" : "left-0.5"}`} />
                </span>
              </button>
            ))}
          </div>
        </Kartu>
      </div>

      {/* Tahap produksi: urutan bisa ditukar */}
      <Kartu className="mt-5">
        <div className="border-b border-[#E9EDF2] px-5 py-3.5">
          <h3 className="text-[14px] font-bold text-[#04123F]">Tahap Produksi</h3>
          <p className="mt-0.5 text-[12px] text-[#94A3B8]">
            {s.tahapan.length} tahap — pakai tombol panah untuk ubah urutan. Nama dan jumlah tahap dikunci.
          </p>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {s.tahapan.map((t, i) => (
            <div key={t} className="flex items-center gap-3 px-5 py-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F1F5F9] text-[11px] font-bold text-[#04123F]">{i + 1}</span>
              <span className="flex-1 text-[13.5px] font-semibold text-[#04123F]">{t}</span>
              <button
                type="button"
                disabled={i === 0}
                onClick={() => geser(i, -1)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-[#F1F5F9] text-[#475569] transition hover:bg-[#E2E8F0] active:scale-95 disabled:opacity-30"
                aria-label="Naikkan urutan"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={i === s.tahapan.length - 1}
                onClick={() => geser(i, +1)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-[#F1F5F9] text-[#475569] transition hover:bg-[#E2E8F0] active:scale-95 disabled:opacity-30"
                aria-label="Turunkan urutan"
              >
                ↓
              </button>
            </div>
          ))}
        </div>
      </Kartu>
    </div>
  );
}

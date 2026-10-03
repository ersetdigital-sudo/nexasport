"use client";

/**
 * Demo Pengaturan — DISAMAKAN dengan ViewSetting admin asli
 * (components/admin/PesananDashboard.tsx): Profil Toko, Tahap Produksi
 * (nama read-only, urutan bisa digeser), Notifikasi WhatsApp (Fonnte),
 * Notifikasi Deadline, dan Kapasitas Produksi. Semua tombol simpan hanya
 * toast "mode demo" / update demo store (in-memory) — tidak ada call API.
 */
import { useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { PageHead } from "@/components/penawaran/demo/ui";

export default function DemoPengaturan() {
  const s = useDemo();

  // Tahap Produksi — nama read-only, hanya urutan yang bisa diubah.
  const [editSteps, setEditSteps] = useState<string[]>(() => [...s.tahapan]);
  const [savingSteps, setSavingSteps] = useState(false);

  // Token Fonnte (notifikasi WhatsApp)
  const [fonnteToken, setFonnteToken] = useState("");
  const [fonnteTarget, setFonnteTarget] = useState("");
  const [fonnteHasToken, setFonnteHasToken] = useState(false);
  const [fonnteLast4, setFonnteLast4] = useState<string | null>(null);
  const [savingFonnte, setSavingFonnte] = useState(false);
  const [testingFonnte, setTestingFonnte] = useState(false);

  // Profil Toko
  const [tokoName, setTokoName] = useState("Nexa Sport");
  const [tokoWhatsapp, setTokoWhatsapp] = useState("");
  const [tokoJamOps, setTokoJamOps] = useState("Senin-Sabtu - 09.00-17.00 WIB");
  const [savingToko, setSavingToko] = useState(false);

  // Notifikasi Deadline
  const [deadlineEnabled, setDeadlineEnabled] = useState(s.notifAktif);
  const [deadlineTime, setDeadlineTime] = useState("08:00");
  const [deadlineDays, setDeadlineDays] = useState("3,2,1");
  const [deadlinePhone1, setDeadlinePhone1] = useState("6281234567890");
  const [deadlinePhone2, setDeadlinePhone2] = useState("");
  const [deadlinePhone3, setDeadlinePhone3] = useState("");
  const [savingDeadline, setSavingDeadline] = useState(false);

  // Kapasitas Produksi (dipakai halaman Laporan)
  const [capacity, setCapacity] = useState(String(s.kapasitas ?? 2500));
  const [savingCapacity, setSavingCapacity] = useState(false);

  const updateName = (idx: number, name: string) => {
    const updated = [...editSteps];
    updated[idx] = name;
    setEditSteps(updated);
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= editSteps.length) return;
    const updated = [...editSteps];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setEditSteps(updated);
  };

  const saveSteps = async () => {
    const names = editSteps.map((n) => n.trim());
    if (names.some((n) => !n)) {
      demoToast("Nama tahap tidak boleh kosong");
      return;
    }
    if (new Set(names).size !== names.length) {
      demoToast("Nama tahap tidak boleh duplikat");
      return;
    }
    setSavingSteps(true);
    setTimeout(() => {
      setSavingSteps(false);
      setDemo({ tahapan: names });
      demoToast("Tahap produksi tersimpan (mode demo)");
    }, 400);
  };

  return (
    <div>
      <PageHead kicker="Data" title="Pengaturan" />
      <p className="text-[13.5px] text-[#64748B] mb-4">
        Pengaturan toko dan alur produksi.
      </p>
      <div className="space-y-4">
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="pas-card p-5">
            <p className="font-semibold text-[15px]">Profil Toko</p>
            <label className="block mt-4">
              <span className="text-[13px] text-[var(--pas-muted)]">Nama Toko</span>
              <input
                className="pas-field w-full px-4 py-2.5 mt-1.5 text-[16px]"
                value={tokoName}
                onChange={(e) => setTokoName(e.target.value)}
              />
            </label>
            <label className="block mt-3">
              <span className="text-[13px] text-[var(--pas-muted)]">WhatsApp Admin</span>
              <input
                className="pas-field w-full px-4 py-2.5 mt-1.5 text-[16px] pas-num"
                placeholder="6281234567890"
                value={tokoWhatsapp}
                onChange={(e) => setTokoWhatsapp(e.target.value)}
              />
            </label>
            <label className="block mt-3">
              <span className="text-[13px] text-[var(--pas-muted)]">Jam Operasional</span>
              <input
                className="pas-field w-full px-4 py-2.5 mt-1.5 text-[16px]"
                value={tokoJamOps}
                onChange={(e) => setTokoJamOps(e.target.value)}
              />
            </label>
            <button
              className="pas-btn-accent w-full py-3 text-[14px] mt-4"
              disabled={savingToko}
              onClick={() => {
                setSavingToko(true);
                setTimeout(() => {
                  setSavingToko(false);
                  demoToast("Profil toko tersimpan (mode demo)");
                }, 400);
              }}
            >
              {savingToko ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
          <div className="pas-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[15px]">Tahap Produksi</p>
                <p className="text-[12.5px] text-[var(--pas-muted)] mt-1">
                  {editSteps.length} tahap - pakai tombol panah untuk ubah urutan. Nama dan jumlah tahap dikunci.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-4">
              {editSteps.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg border border-[var(--pas-line-2)] bg-[var(--pas-surface)]"
                >
                  <span className="pas-num w-5 text-[12px] text-[var(--pas-muted)] shrink-0">
                    {i + 1}
                  </span>
                  {/* Nama tahap adalah IDENTITAS tahap — read-only, sama
                      seperti admin asli. Yang boleh berubah cuma urutan. */}
                  <input
                    className="flex-1 min-w-0 bg-transparent text-[14px] outline-none border-none cursor-default"
                    value={name}
                    onChange={(e) => updateName(i, e.target.value)}
                    readOnly
                    aria-readonly="true"
                    title="Nama tahap dikunci. Hubungi support untuk mengubahnya."
                    placeholder="Nama tahap..."
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="pas-btn-ghost w-10 h-10 grid place-items-center disabled:opacity-30"
                      disabled={i === 0}
                      onClick={() => moveStep(i, -1)}
                      title="Geser ke atas"
                      aria-label={`Geser tahap ${name} ke atas`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6" /></svg>
                    </button>
                    <button
                      className="pas-btn-ghost w-10 h-10 grid place-items-center disabled:opacity-30"
                      disabled={i === editSteps.length - 1}
                      onClick={() => moveStep(i, 1)}
                      title="Geser ke bawah"
                      aria-label={`Geser tahap ${name} ke bawah`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-[var(--pas-line-2)] bg-[var(--pas-surface)] px-3 py-2.5">
              <p className="text-[12.5px] leading-relaxed text-[var(--pas-muted)]">
                Cuma <span className="font-semibold text-[var(--pas-accent)]">urutan</span> yang bisa
                diubah dari sini. Nama dan jumlah tahap dikunci supaya riwayat pesanan dan notifikasi
                WhatsApp tetap nyambung dengan tahapnya. Mau ganti teks tahap? Hubungi support.
              </p>
            </div>

            <button
              className="pas-btn-accent w-full py-3 text-[14px] mt-4"
              disabled={savingSteps}
              onClick={saveSteps}
            >
              {savingSteps ? "Menyimpan..." : "Simpan Tahap Produksi"}
            </button>
          </div>
        </div>

        {/* Notifikasi WhatsApp (Fonnte) */}
        <div className="pas-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-[15px]">Notifikasi WhatsApp (Fonnte)</p>
              <p className="text-[12.5px] text-[var(--pas-muted)] mt-1">
                Terkirim otomatis ke customer saat tahap produksi diubah. Token disimpan terenkripsi (AES-256-GCM).
              </p>
            </div>
            <span
              className={`pas-pill self-start shrink-0 whitespace-nowrap sm:self-auto ${fonnteHasToken ? "produksi" : "selesai"}`}
            >
              {fonnteHasToken
                ? `Tersimpan ----${fonnteLast4 ?? ""}`
                : "Belum di-set"}
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mt-5">
            <label className="block">
              <span className="text-[13px] text-[var(--pas-muted)]">Token Fonnte</span>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="password"
                  autoComplete="off"
                  className="pas-field flex-1 min-w-0 px-4 py-2.5 text-[16px]"
                  placeholder={
                    fonnteHasToken && fonnteLast4
                      ? `------------${fonnteLast4} (isi untuk mengganti)`
                      : "Token dari dashboard Fonnte"
                  }
                  value={fonnteToken}
                  onChange={(e) => setFonnteToken(e.target.value)}
                />
                <button
                  className="pas-btn-accent px-4 py-2.5 text-[13px] shrink-0"
                  disabled={savingFonnte}
                  onClick={() => {
                    const value = fonnteToken.trim();
                    if (!value) {
                      demoToast("Token tidak boleh kosong");
                      return;
                    }
                    setSavingFonnte(true);
                    setTimeout(() => {
                      setSavingFonnte(false);
                      setFonnteToken("");
                      setFonnteHasToken(true);
                      setFonnteLast4(value.slice(-4));
                      demoToast("Token Fonnte tersimpan (mode demo)");
                    }, 400);
                  }}
                >
                  {savingFonnte ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="text-[13px] text-[var(--pas-muted)]">Uji Koneksi</span>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="tel"
                  className="pas-field flex-1 min-w-0 px-4 py-2.5 text-[16px] pas-num"
                  placeholder="No. HP admin (0812... atau 62812...)"
                  value={fonnteTarget}
                  onChange={(e) => setFonnteTarget(e.target.value)}
                />
                <button
                  className="pas-btn-ghost px-4 py-2.5 text-[13px] shrink-0"
                  disabled={testingFonnte}
                  onClick={() => {
                    if (!fonnteTarget.trim()) {
                      demoToast("Isi nomor HP tujuan untuk pesan uji");
                      return;
                    }
                    setTestingFonnte(true);
                    setTimeout(() => {
                      setTestingFonnte(false);
                      demoToast("Pesan uji terkirim (mode demo)");
                    }, 500);
                  }}
                >
                  {testingFonnte ? "Mengirim..." : "Test Kirim"}
                </button>
              </div>
            </label>
          </div>
          <p className="text-[12px] text-[var(--pas-muted)] mt-3">
            Dapatkan token di dashboard Fonnte (fonnte.com). Token tidak pernah ditampilkan penuh dan tidak pernah di-log.
          </p>
        </div>

        {/* Notifikasi Deadline */}
        <div className="pas-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-[15px]">Notifikasi Deadline</p>
              <p className="text-[12.5px] text-[var(--pas-muted)] mt-1">
                Kirim peringatan ke admin via WhatsApp setiap hari jika order mendekati deadline.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 self-end sm:self-auto">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={deadlineEnabled}
                onChange={(e) => setDeadlineEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-[var(--pas-line)] rounded-full peer peer-checked:bg-[var(--pas-accent)] transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mt-5">
            <label className="block">
              <span className="text-[13px] text-[var(--pas-muted)]">Jam Kirim (WIB)</span>
              <input
                type="time"
                className="pas-field w-full px-4 py-2.5 mt-1.5 text-[16px]"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[13px] text-[var(--pas-muted)]">Hari Peringatan</span>
              <input
                type="text"
                className="pas-field w-full px-4 py-2.5 mt-1.5 text-[16px]"
                placeholder="3,2,1"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
              />
              <p className="text-[11px] text-[var(--pas-muted)] mt-1">Pisahkan dengan koma (contoh: 3,2,1 untuk H-3, H-2, H-1)</p>
            </label>
            <label className="block lg:col-span-2">
              <span className="text-[13px] text-[var(--pas-muted)]">Nomor HP Admin</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5">
                <input
                  type="text"
                  className="pas-field w-full px-4 py-2.5 text-[16px] pas-num"
                  placeholder="6281234567890"
                  value={deadlinePhone1}
                  onChange={(e) => setDeadlinePhone1(e.target.value)}
                />
                <input
                  type="text"
                  className="pas-field w-full px-4 py-2.5 text-[16px] pas-num"
                  placeholder="6280987654321"
                  value={deadlinePhone2}
                  onChange={(e) => setDeadlinePhone2(e.target.value)}
                />
                <input
                  type="text"
                  className="pas-field w-full px-4 py-2.5 text-[16px] pas-num"
                  placeholder="628111222333"
                  value={deadlinePhone3}
                  onChange={(e) => setDeadlinePhone3(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-[var(--pas-muted)] mt-1">Format internasional (62...). Kosongkan jika tidak dipakai.</p>
            </label>
          </div>

          <div className="flex flex-col gap-3 mt-4 sm:flex-row">
            <button
              className="pas-btn-accent w-full px-6 py-2.5 text-[13px] sm:w-auto"
              disabled={savingDeadline}
              onClick={() => {
                setSavingDeadline(true);
                setTimeout(() => {
                  setSavingDeadline(false);
                  demoToast("Pengaturan deadline tersimpan (mode demo)");
                }, 400);
              }}
            >
              {savingDeadline ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
            <button
              className="pas-btn-ghost w-full px-6 py-2.5 text-[13px] sm:w-auto"
              disabled={!deadlineEnabled || savingDeadline}
              onClick={() => {
                const allPhones = [deadlinePhone1, deadlinePhone2, deadlinePhone3].filter(Boolean).join(",");
                if (!allPhones.trim()) {
                  demoToast("Isi nomor HP admin terlebih dahulu");
                  return;
                }
                setSavingDeadline(true);
                setTimeout(() => {
                  setSavingDeadline(false);
                  demoToast("Notifikasi uji terkirim (mode demo)");
                }, 500);
              }}
            >
              Test Kirim Sekarang
            </button>
          </div>
          <p className="text-[12px] text-[var(--pas-muted)] mt-3">
            Notifikasi akan dikirim otomatis setiap hari pada jam yang ditentukan (hanya jika ada order yang mendekati deadline). Gunakan GitHub Actions atau cron job eksternal untuk menjalankan endpoint.
          </p>
        </div>

        {/* Kapasitas Produksi */}
        <div className="pas-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[15px]">Kapasitas Produksi</p>
              <p className="text-[12.5px] text-[var(--pas-muted)] mt-1">
                Batas jumlah pcs yang diproses per bulan. Dipakai halaman Laporan untuk menghitung
                utilisasi dan peringatan over kapasitas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 mt-5">
            <label className="block flex-1 min-w-[240px]">
              <span className="text-[13px] text-[var(--pas-muted)]">Kapasitas per Bulan (pcs)</span>
              <input
                type="number"
                min={1}
                step={50}
                className="pas-field w-full px-4 py-2.5 mt-1.5 text-[16px] pas-num"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
              <p className="text-[11px] text-[var(--pas-muted)] mt-1">
                Default 2.500 pcs. Di halaman Laporan, beban
                di atas 85% ditandai hampir penuh dan di atas 100% ditandai over kapasitas.
              </p>
            </label>
            <button
              className="pas-btn-accent px-6 py-2.5 text-[13px]"
              disabled={savingCapacity}
              onClick={() => {
                const value = parseInt(capacity, 10);
                if (isNaN(value) || value < 1) {
                  demoToast("Kapasitas harus angka minimal 1");
                  return;
                }
                setSavingCapacity(true);
                setTimeout(() => {
                  setSavingCapacity(false);
                  setDemo({ kapasitas: value });
                  demoToast("Kapasitas tersimpan (mode demo)");
                }, 400);
              }}
            >
              {savingCapacity ? "Menyimpan..." : "Simpan Kapasitas"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

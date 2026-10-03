"use client";

/**
 * Demo Pesanan — tracking 11 tahap produksi. Data dummy in-memory.
 * Urutan tahap dibaca dari store (bisa diubah di halaman Pengaturan).
 */
import { useMemo, useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { DEFAULT_PRODUCTS } from "@/lib/product-options";
import { PageHead, Kartu, BtnKuning, Modal, badgeTahap, rp, tanggalID } from "@/components/penawaran/demo/ui";

export default function DemoPesanan() {
  const s = useDemo();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  // Form tambah pesanan — meniru AddForm app asli: customer + HP,
  // baris produk multi-entry (pilih dari daftar / tulis sendiri) + qty,
  // foto desain & WO (mode demo: preview in-memory), tanggal order/deadline.
  const [form, setForm] = useState({ customer: "", phone: "", created: new Date().toISOString().slice(0, 10), deadline: "" });
  const [productRows, setProductRows] = useState<{ product: string; custom: boolean; qty: string }[]>([{ product: "", custom: false, qty: "" }]);
  const [productOptions, setProductOptions] = useState<string[]>([...DEFAULT_PRODUCTS]);
  const [designPhotos, setDesignPhotos] = useState<string[]>([]);
  const [woPhotos, setWoPhotos] = useState<string[]>([]);
  const [designUpload, setDesignUpload] = useState(false);
  const [woUpload, setWoUpload] = useState(false);
  const [formError, setFormError] = useState("");
  const totalQty = productRows.reduce((acc, p) => acc + (parseInt(p.qty, 10) || 0), 0);

  const statusOf = (tahapSelesai: number) =>
    tahapSelesai >= s.tahapan.length ? "Selesai" : s.tahapan[tahapSelesai];

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return s.orders.filter(
      (o) =>
        (!filter || statusOf(o.tahapSelesai) === filter) &&
        (!k || o.kode.toLowerCase().includes(k) || o.customer.toLowerCase().includes(k) || o.produk.toLowerCase().includes(k))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.orders, s.tahapan, q, filter]);

  const detail = s.orders.find((o) => o.id === detailId) ?? null;
  const total = s.tahapan.length;

  const lanjut = (id: number) => {
    setDemo({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, tahapSelesai: Math.min(total, o.tahapSelesai + 1) } : o
      ),
    });
    demoToast("Status produksi diperbarui");
  };

  const updateProductRow = (rowIdx: number, patch: Partial<{ product: string; custom: boolean; qty: string }>) =>
    setProductRows((rows) => rows.map((r, i) => (i === rowIdx ? { ...r, ...patch } : r)));

  const uploadDemoFoto = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (fn: (ps: string[]) => string[]) => void
  ) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    // Mode demo: foto tidak diunggah ke mana pun — cukup preview in-memory.
    files.forEach((f) => setter((ps) => [...ps, URL.createObjectURL(f)]));
  };

  const resetForm = () => {
    setForm({ customer: "", phone: "", created: new Date().toISOString().slice(0, 10), deadline: "" });
    setProductRows([{ product: "", custom: false, qty: "" }]);
    setDesignPhotos([]);
    setWoPhotos([]);
    setFormError("");
  };

  const tambah = () => {
    const validRows = productRows.filter((p) => p.product.trim() && p.qty.trim());
    if (!form.customer.trim() || !form.phone.trim() || validRows.length === 0) {
      setFormError("Isi nama, HP, dan minimal 1 produk dengan jumlahnya.");
      return;
    }
    const names = validRows.map((p) => p.product.trim());
    const qty = validRows.reduce((a, p) => a + (parseInt(p.qty, 10) || 0), 0);
    const id = Math.max(0, ...s.orders.map((o) => o.id)) + 1;
    // Produk yang dipakai ikut muncul lagi di daftar pilihan (kayak app asli).
    setProductOptions((opts) => Array.from(new Set([...opts, ...names])));
    setDemo({
      orders: [
        {
          id,
          kode: `NS-${2410 + id}`,
          customer: form.customer.trim(),
          phone: form.phone.trim(),
          produk: names.join(", "),
          qty,
          tahapSelesai: 0,
          deadline: form.deadline || new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
          mulai: form.created || new Date().toISOString().slice(0, 10),
          total: qty * 95_000,
        },
        ...s.orders,
      ],
    });
    setFormOpen(false);
    resetForm();
    demoToast("Pesanan ditambahkan (mode demo)");
  };

  return (
    <div>
      <PageHead
        title="Pesanan"
        action={
          <BtnKuning onClick={() => setFormOpen(true)}>+ Tambah Pesanan</BtnKuning>
        }
      />

      {/* Filter + pencarian */}
      <Kartu className="mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kode, customer, atau produk…"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#0B1A5C] focus:bg-white"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13.5px] font-semibold text-[#0B1A5C] outline-none"
          >
            <option value="">Semua status</option>
            {s.tahapan.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </Kartu>

      {/* Tabel order */}
      <Kartu>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-wide text-[#94A3B8]">
                {["Kode", "Customer", "Produk", "Qty", "Status", "Deadline", "Total"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 font-semibold ${i === 6 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr
                  key={o.id}
                  onClick={() => setDetailId(o.id)}
                  className={`cursor-pointer transition hover:bg-[#F1F5F9] ${i % 2 ? "bg-[#FAFBFC]" : ""}`}
                >
                  <td className="px-4 py-3 font-bold text-[#0B1A5C]">{o.kode}</td>
                  <td className="px-4 py-3">{o.customer}</td>
                  <td className="px-4 py-3 text-[#475569]">{o.produk}</td>
                  <td className="px-4 py-3 tabular-nums">{o.qty}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeTahap(o.tahapSelesai, total)}`}>
                      {statusOf(o.tahapSelesai)}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[#475569]">{tanggalID(o.deadline)}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-[#0B1A5C]">{rp(o.total)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#94A3B8]">Gak ada order yang cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Kartu>

      {/* Detail + timeline 11 tahap */}
      <Modal open={!!detail} onClose={() => setDetailId(null)} title={detail ? `${detail.kode} — ${detail.customer}` : ""} lebar="max-w-md">
        {detail && (
          <div>
            <div className="mb-4 rounded-xl bg-[#F8FAFC] px-3.5 py-3 text-[12.5px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[#0B1A5C]">{detail.produk}</span>
                <span className="text-[#64748B]">{detail.qty} pcs · deadline {tanggalID(detail.deadline)}</span>
              </div>
              {detail.phone && <p className="mt-1 text-[#64748B]">HP: {detail.phone}</p>}
            </div>
            <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-[#475569]">
              <span>Progres produksi</span>
              <span>{detail.tahapSelesai}/{total} tahap</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div className="h-full rounded-full bg-[#FFC107] transition-all duration-500" style={{ width: `${(detail.tahapSelesai / total) * 100}%` }} />
            </div>
            <ol className="mt-4 space-y-1.5">
              {s.tahapan.map((t, i) => {
                const selesai = i < detail.tahapSelesai;
                const berjalan = i === detail.tahapSelesai;
                return (
                  <li
                    key={t}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold ${
                      berjalan ? "bg-[#FFC107]/20 text-[#0B1A5C] ring-1 ring-[#FFC107]" : selesai ? "text-[#334155]" : "text-[#94A3B8]"
                    }`}
                  >
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                      selesai ? "bg-emerald-100 text-emerald-700" : berjalan ? "bg-[#FFC107] text-[#3A2B00]" : "bg-[#F1F5F9]"
                    }`}>
                      {selesai ? "✓" : i + 1}
                    </span>
                    {t}
                    {berjalan && <span className="ml-auto rounded-full bg-[#FFC107] px-2 py-0.5 text-[9.5px] font-bold text-[#3A2B00]">BERJALAN</span>}
                  </li>
                );
              })}
            </ol>
            {detail.tahapSelesai < total ? (
              <BtnKuning onClick={() => lanjut(detail.id)}>Lanjut ke Tahap Berikutnya →</BtnKuning>
            ) : (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-[13px] font-bold text-emerald-700">
                Order ini sudah lewat semua tahap — terkirim.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Form tambah pesanan — struktur sama dengan app asli */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Tambah Pesanan" lebar="max-w-xl">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-[#F8FAFC] p-3.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Nomor Pesanan</p>
            <p className="mt-1 text-[14px] leading-relaxed text-[#64748B]">
              Nomor order digenerate otomatis saat disimpan (format: NSPYYMMDDXXXX)
            </p>
          </div>
          <label className="block">
            <span className="text-[13px] text-[#64748B]">Nama Customer</span>
            <input
              value={form.customer}
              onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
              placeholder="Nama"
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="text-[13px] text-[#64748B]">Nomor HP</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="0812xxxxxxx"
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
            />
          </label>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#64748B]">Produk</span>
              {totalQty > 0 && (
                <span className="text-[12px] font-semibold text-[#04123F]">Total: {totalQty} pcs</span>
              )}
            </div>
            <div className="mt-1.5 flex flex-col gap-3">
              {productRows.map((pRow, pi) => (
                <div key={pi} className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                  {pRow.custom ? (
                    <input
                      className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-[#04123F]"
                      placeholder="Nama produk custom"
                      value={pRow.product}
                      onChange={(e) => updateProductRow(pi, { product: e.target.value })}
                    />
                  ) : (
                    <select
                      className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-[15px] outline-none"
                      value={pRow.product}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") updateProductRow(pi, { custom: true, product: "" });
                        else updateProductRow(pi, { product: e.target.value });
                      }}
                    >
                      <option value="" disabled>Pilih produk...</option>
                      {productOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      <option value="__custom__">+ Tambah sendiri...</option>
                    </select>
                  )}
                  <input
                    className="w-[84px] rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-[15px] outline-none focus:border-[#04123F]"
                    placeholder="Qty"
                    inputMode="numeric"
                    value={pRow.qty}
                    onChange={(e) => updateProductRow(pi, { qty: e.target.value })}
                  />
                  {pRow.custom && (
                    <button
                      type="button"
                      className="shrink-0 rounded-lg px-2.5 py-2 text-[12px] font-semibold text-[#64748B] transition hover:bg-[#E2E8F0]"
                      title="Kembali ke daftar pilihan"
                      onClick={() => updateProductRow(pi, { custom: false, product: "" })}
                    >
                      List
                    </button>
                  )}
                  {productRows.length > 1 && (
                    <button
                      type="button"
                      className="shrink-0 rounded-lg p-2 text-[#94A3B8] transition hover:bg-red-400/10 hover:text-red-400"
                      title="Hapus produk ini"
                      onClick={() => setProductRows((rows) => rows.filter((_, idx) => idx !== pi))}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-2 w-full rounded-xl border border-[#E2E8F0] py-2.5 text-[13px] font-semibold text-[#475569] transition hover:bg-[#F1F5F9]"
              onClick={() => setProductRows((rows) => [...rows, { product: "", custom: false, qty: "" }])}
            >
              + Tambah Produk
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FotoUpload
              label="Preview Design"
              fotos={designPhotos}
              alt="Design"
              uploading={designUpload}
              onPick={(e) => uploadDemoFoto(e, setDesignPhotos)}
              onRemove={(i) => setDesignPhotos((ps) => ps.filter((_, idx) => idx !== i))}
            />
            <FotoUpload
              label="WO"
              catatan="Admin only"
              fotos={woPhotos}
              alt="WO"
              uploading={woUpload}
              onPick={(e) => uploadDemoFoto(e, setWoPhotos)}
              onRemove={(i) => setWoPhotos((ps) => ps.filter((_, idx) => idx !== i))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[13px] text-[#64748B]">Tanggal Order</span>
              <input
                type="date"
                value={form.created}
                onChange={(e) => setForm((f) => ({ ...f, created: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="text-[13px] text-[#64748B]">Tanggal Deadline</span>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
              />
            </label>
          </div>
          {formError && <p className="text-[13px] font-semibold text-red-500">{formError}</p>}
          <BtnKuning onClick={tambah}>Simpan Pesanan</BtnKuning>
        </div>
      </Modal>
    </div>
  );
}

/* ── Upload foto (Preview Design / WO) — mirror app asli, mode demo:
      file tidak diunggah ke server, hanya preview in-memory. ── */
function FotoUpload({
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
      <input id={inputId} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
    </div>
  );
}

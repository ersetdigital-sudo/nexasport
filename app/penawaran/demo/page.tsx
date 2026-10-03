"use client";

/**
 * Demo Pesanan — tracking 11 tahap produksi. Data dummy in-memory.
 * Urutan tahap dibaca dari store (bisa diubah di halaman Pengaturan).
 */
import { useMemo, useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { PageHead, Kartu, BtnKuning, Modal, badgeTahap, rp, tanggalID } from "@/components/penawaran/demo/ui";

export default function DemoPesanan() {
  const s = useDemo();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState({ customer: "", produk: "Jersey Atasan", qty: "24", deadline: "", total: "" });

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

  const tambah = () => {
    const qty = Number(draft.qty) || 0;
    if (!draft.customer.trim() || qty <= 0) {
      demoToast("Isi nama customer dan qty dulu");
      return;
    }
    const id = Math.max(0, ...s.orders.map((o) => o.id)) + 1;
    setDemo({
      orders: [
        {
          id,
          kode: `NS-${2410 + id}`,
          customer: draft.customer.trim(),
          produk: draft.produk,
          qty,
          tahapSelesai: 0,
          deadline: draft.deadline || new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
          mulai: new Date().toISOString().slice(0, 10),
          total: Number(draft.total) || qty * 95_000,
        },
        ...s.orders,
      ],
    });
    setFormOpen(false);
    setDraft({ customer: "", produk: "Jersey Atasan", qty: "24", deadline: "", total: "" });
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F8FAFC] px-3.5 py-3 text-[12.5px]">
              <span className="font-semibold text-[#0B1A5C]">{detail.produk}</span>
              <span className="text-[#64748B]">{detail.qty} pcs · deadline {tanggalID(detail.deadline)}</span>
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

      {/* Form tambah pesanan */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Tambah Pesanan">
        <div className="grid gap-3">
          {[
            ["Nama customer", "customer", "mis. Tim Futsal Benteng"],
            ["Qty (pcs)", "qty", "24"],
            ["Total nilai (Rp)", "total", "mis. 2.400.000"],
          ].map(([label, key, ph]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">{label}</span>
              <input
                value={draft[key as "customer"]}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                placeholder={ph}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#0B1A5C] focus:bg-white"
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Produk</span>
            <select
              value={draft.produk}
              onChange={(e) => setDraft((d) => ({ ...d, produk: e.target.value }))}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13.5px] outline-none"
            >
              {["Jersey Atasan", "Jersey Setelan", "Kaos Tim", "Jaket"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Deadline</span>
            <input
              type="date"
              value={draft.deadline}
              onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))}
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13.5px] outline-none focus:border-[#0B1A5C] focus:bg-white"
            />
          </label>
          <BtnKuning onClick={tambah}>Simpan Pesanan</BtnKuning>
        </div>
      </Modal>
    </div>
  );
}

"use client";

/**
 * Demo Maklon — tampilan DISAMAKAN dengan MaklonDashboard admin asli
 * (components/admin/MaklonDashboard.tsx): KPI Total/Produksi/Siap Dikirim/
 * Selesai, search + chip filter, tabel desktop (pas-tbl), kartu mobile
 * (pas-bento-card), sheet Detail Maklon & form Tambah Maklon (multi-baris
 * produk + foto design/WO).
 * Data tetap dummy in-memory (demo store) — terisolasi dari API/Supabase.
 */
import { useMemo, useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { DEFAULT_PRODUCTS } from "@/lib/product-options";
import { pcsLabel } from "@/lib/utils";
import { formatNumericDateID } from "@/lib/format-date";
import { PageHead, BtnKuning, Modal } from "@/components/penawaran/demo/ui";
import { DetailSheet } from "@/components/penawaran/demo/DetailSheet";
import EditSheet from "@/components/penawaran/demo/EditSheet";
import { FotoUpload } from "@/components/penawaran/demo/FotoUpload";
import { uploadToCloudinary, optimizeImageUrl, DEMO_UPLOAD_FOLDER } from "@/lib/cloudinary";

type FilterKey = "all" | "baru" | "produksi" | "kirim" | "selesai";
const FILTER_LABEL: Record<FilterKey, string> = {
  all: "Semua", baru: "Baru", produksi: "Produksi", kirim: "Siap Dikirim", selesai: "Selesai",
};

/** Status bucket — sama seperti bucket pesanan demo/admin asli. */
function statusOf(tahapSelesai: number, total: number): FilterKey {
  if (tahapSelesai >= total) return "selesai";
  if (tahapSelesai >= total - 1) return "kirim";
  if (tahapSelesai <= 1) return "baru";
  return "produksi";
}

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const formatDate = (iso: string) => formatNumericDateID(iso) || "-";

/** Nomor maklon demo — format sama dengan app asli: NSP + YYMMDD (WIB) + 4 acak. */
const ORDER_CHARSET = "ACDEFGHJKMNPQRSTUVWXYZ23456789";
const nomorMaklonDemo = () =>
  "NSP" +
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "2-digit", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replace(/\D/g, "") +
  Array.from({ length: 4 }, () => ORDER_CHARSET[Math.floor(Math.random() * ORDER_CHARSET.length)]).join("");

export default function DemoMaklon() {
  const s = useDemo();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  // Form Tambah Maklon — meniru AddForm admin asli: nama + HP + ukuran manual
  // (khas maklon) + baris produk multi-entry + foto design & WO + tanggal.
  const [form, setForm] = useState({ customer: "", phone: "", sizes: "", created: new Date().toISOString().slice(0, 10), deadline: "" });
  const [productRows, setProductRows] = useState<{ product: string; custom: boolean; qty: string }[]>([{ product: "", custom: false, qty: "" }]);
  const [productOptions, setProductOptions] = useState<string[]>([...DEFAULT_PRODUCTS]);
  const [designPhotos, setDesignPhotos] = useState<string[]>([]);
  const [woPhotos, setWoPhotos] = useState<string[]>([]);
  const [designUpload, setDesignUpload] = useState(false);
  const [woUpload, setWoUpload] = useState(false);
  const [formError, setFormError] = useState("");

  const maklon = useMemo(() => s.orders.filter((o) => o.maklon), [s.orders]);
  const total = s.tahapan.length;

  const filtered = useMemo(() => {
    const k = query.trim().toLowerCase();
    return maklon
      .filter((o) => {
        if (filter !== "all" && statusOf(o.tahapSelesai, total) !== filter) return false;
        if (!k) return true;
        return (o.kode + " " + o.customer + " " + o.produk).toLowerCase().includes(k);
      })
      .sort((a, b) => (a.id < b.id ? 1 : -1));
  }, [maklon, filter, query, total]);

  const stats = {
    total: maklon.length,
    produksi: maklon.filter((o) => ["produksi", "baru"].includes(statusOf(o.tahapSelesai, total))).length,
    kirim: maklon.filter((o) => statusOf(o.tahapSelesai, total) === "kirim").length,
    selesai: maklon.filter((o) => statusOf(o.tahapSelesai, total) === "selesai").length,
  };

  const detail = s.orders.find((o) => o.id === detailId) ?? null;

  const updateProductRow = (rowIdx: number, patch: Partial<{ product: string; custom: boolean; qty: string }>) =>
    setProductRows((rows) => rows.map((r, i) => (i === rowIdx ? { ...r, ...patch } : r)));

  // Upload foto sungguhan ke Cloudinary — alur sama dengan form admin asli.
  const uploadDemoFoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (fn: (ps: string[]) => string[]) => void,
    setUploading: (v: boolean) => void
  ) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const result = await uploadToCloudinary(file, { folder: DEMO_UPLOAD_FOLDER });
        setter((ps) => [...ps, optimizeImageUrl(result.url)]);
      }
    } catch (err) {
      console.error("[upload demo] exception", err);
      setFormError(err instanceof Error ? err.message : "Upload gagal. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({ customer: "", phone: "", sizes: "", created: new Date().toISOString().slice(0, 10), deadline: "" });
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
    setProductOptions((opts) => Array.from(new Set([...opts, ...names])));
    setDemo({
      orders: [
        {
          id,
          kode: nomorMaklonDemo(),
          customer: form.customer.trim(),
          phone: form.phone.trim(),
          produk: names.join(", "),
          sizes: form.sizes.trim() || undefined,
          qty,
          tahapSelesai: 0,
          deadline: form.deadline || new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
          mulai: form.created || new Date().toISOString().slice(0, 10),
          total: qty * 95_000,
          maklon: true,
        },
        ...s.orders,
      ],
    });
    setFormOpen(false);
    resetForm();
    demoToast("Maklon ditambahkan (mode demo)");
  };

  const demoAksiHapus = () => demoToast("Mode Demo — aksi hapus tidak tersedia");

  return (
    <div>
      <PageHead
        title="Maklon"
        action={<BtnKuning onClick={() => setFormOpen(true)}>+ Maklon</BtnKuning>}
      />

      {/* KPI — struktur & kelas sama dengan MaklonDashboard admin asli */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <div className="pas-card pas-kpi pas-kpi-hero p-4 sm:p-5">
          <p className="pas-kpi-label text-[13px]">Total Maklon</p>
          <div className="flex items-end gap-2.5 mt-2.5">
            <p className="pas-display pas-num text-[34px] leading-none">{stats.total}</p>
          </div>
        </div>
        <div className="pas-card pas-kpi p-4 sm:p-5">
          <p className="text-[13px] text-[var(--pas-muted)]">Sedang Produksi</p>
          <div className="flex items-end gap-2.5 mt-2.5">
            <p className="pas-display pas-num text-[30px] leading-none">{stats.produksi}</p>
          </div>
        </div>
        <div className="pas-card pas-kpi p-4 sm:p-5">
          <p className="text-[13px] text-[var(--pas-muted)]">Siap Dikirim</p>
          <div className="flex items-end gap-2.5 mt-2.5">
            <p className="pas-display pas-num text-[30px] leading-none text-[#3F5BA9]">{stats.kirim}</p>
          </div>
        </div>
        <div className="pas-card pas-kpi p-4 sm:p-5">
          <p className="text-[13px] text-[var(--pas-muted)]">Selesai</p>
          <div className="flex items-end gap-2.5 mt-2.5">
            <p className="pas-display pas-num text-[30px] leading-none">{stats.selesai}</p>
          </div>
        </div>
      </section>

      {/* Toolbar — search + chip filter, sama dengan admin asli */}
      <section className="mt-7 flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        <div className="pas-search w-full lg:max-w-[400px]">
          <svg className="pas-mag" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            className="pas-field w-full py-2.5 pr-4 text-[14px]"
            placeholder="Cari maklon, nama, kota..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="pas-seg pas-bento-chip-scroll">
          {(["all", "baru", "produksi", "kirim", "selesai"] as FilterKey[]).map((f) => (
            <button key={f} className={`pas-chip pas-bento-chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
              {FILTER_LABEL[f]}
            </button>
          ))}
        </div>
      </section>

      {/* Tabel desktop — kolom sama dengan MaklonDashboard admin asli */}
      <section className="pas-card mt-4 p-2 sm:p-4 hidden md:block w-full overflow-x-auto">
        <table className="pas-tbl w-full">
          <thead>
            <tr>
              <th className="w-[18%]">Pesanan</th>
              <th className="w-[18%]">Customer</th>
              <th className="w-[16%]">Produk</th>
              <th className="w-[18%]">Progres</th>
              <th className="w-[12%]">Order</th>
              <th className="w-[10%]">Status</th>
              <th className="w-[5%]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="text-[40px] opacity-30">📦</span>
                    <p className="text-[var(--pas-muted)] text-[15px] font-medium">Tidak ada maklon yang cocok</p>
                    <p className="text-[var(--pas-muted)] text-[13px]">Coba ubah filter atau kata kunci pencarian</p>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((o) => {
              const st = statusOf(o.tahapSelesai, total);
              const pct = ((o.tahapSelesai + 1) / total) * 100;
              const stageName = s.tahapan[o.tahapSelesai] ?? `Tahap ${o.tahapSelesai + 1}`;
              const ini = initials(o.customer);
              return (
                <tr key={o.id} onClick={() => setDetailId(o.id)}>
                  <td>
                    <span className="font-semibold pas-num">{o.kode}</span>
                    <br />
                    <span className="text-[12.5px] text-[var(--pas-muted)]">{pcsLabel(o.qty)}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="pas-avatar">{ini}</span>
                      <span>{o.customer}</span>
                    </div>
                  </td>
                  <td className="text-[var(--pas-muted)]">{o.produk}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="pas-mini">
                        <i style={{ width: `${pct}%` }} />
                      </span>
                      <span className="text-[12.5px] text-[var(--pas-muted)] pas-num whitespace-nowrap">
                        {o.tahapSelesai + 1}/{total}
                      </span>
                    </div>
                    <span className="text-[12.5px] text-[var(--pas-muted)]">{stageName}</span>
                  </td>
                  <td className="text-[12.5px] text-[var(--pas-muted)] whitespace-nowrap">
                    {formatDate(o.mulai)}
                  </td>
                  <td>
                    <span className={`pas-pill ${st}`}>{FILTER_LABEL[st]}</span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="text-[var(--pas-muted)] hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-blue-400/10"
                        title="Edit maklon"
                        onClick={(e) => { e.stopPropagation(); setEditId(o.id); }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1-1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="text-[var(--pas-muted)] hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-400/10"
                        title="Hapus maklon"
                        onClick={(e) => { e.stopPropagation(); demoAksiHapus(); }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                      <span className="text-[var(--pas-muted)]">›</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Kartu mobile — struktur sama dengan kartu bento admin asli */}
      <section className="mt-4 flex flex-col gap-3 md:hidden">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-[40px] opacity-30">📦</span>
            <p className="text-[var(--pas-muted)] text-[15px] font-medium">Tidak ada maklon yang cocok</p>
            <p className="text-[var(--pas-muted)] text-[13px]">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
        {filtered.map((o) => {
          const st = statusOf(o.tahapSelesai, total);
          const pct = ((o.tahapSelesai + 1) / total) * 100;
          const stageName = s.tahapan[o.tahapSelesai] ?? `Tahap ${o.tahapSelesai + 1}`;
          const ini = initials(o.customer);
          return (
            <div key={o.id} className="pas-bento-card cursor-pointer" onClick={() => setDetailId(o.id)}>
              {/* Baris 1: nomor + badge status (badge dijaga utuh satu baris). */}
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-[16px] pas-num min-w-0 truncate">{o.kode}</p>
                <span className={`pas-pill ${st} shrink-0 whitespace-nowrap`}>{FILTER_LABEL[st]}</span>
              </div>

              {/* Baris 2: avatar + nama customer + pcs */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="pas-bento-avatar">{ini}</span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium truncate">{o.customer}</p>
                  </div>
                </div>
                <p className="text-[14px] font-semibold pas-num shrink-0 ml-3">{pcsLabel(o.qty)}</p>
              </div>

              {/* Baris 3: nama produk */}
              <p className="text-[13px] text-[var(--pas-muted)] mt-3">{o.produk}</p>

              {/* Baris 4: progress bar + tahap */}
              <div className="mt-3">
                <span className="pas-mini w-full block">
                  <i style={{ width: `${pct}%` }} />
                </span>
                <p className="text-[12px] text-[var(--pas-muted)] mt-1.5 pas-num">
                  {o.tahapSelesai + 1}/{total} <span className="text-[var(--pas-ink-1)] font-medium">{stageName}</span>
                </p>
              </div>

              <div className="pas-bento-divider"></div>

              {/* Baris 5: tanggal order + deadline */}
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-[var(--pas-muted)]">Order: {formatDate(o.mulai)}</p>
                <p className="text-[12px] text-[var(--pas-muted)]">Deadline: {formatDate(o.deadline)}</p>
              </div>

              {/* Aksi kartu — baris sendiri, target sentuh 40px */}
              <div className="mt-3 flex items-center justify-end gap-1">
                <button
                  className="w-10 h-10 grid place-items-center rounded-lg text-[var(--pas-muted)] hover:text-blue-400 hover:bg-blue-400/10 transition"
                  title="Edit maklon"
                  aria-label="Edit maklon"
                  onClick={(e) => { e.stopPropagation(); setEditId(o.id); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1-1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="w-10 h-10 grid place-items-center rounded-lg text-[var(--pas-muted)] hover:text-red-400 hover:bg-red-400/10 transition"
                  title="Hapus maklon"
                  aria-label="Hapus maklon"
                  onClick={(e) => { e.stopPropagation(); demoAksiHapus(); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Detail — sheet sama seperti DetailSheet admin asli */}
      <DetailSheet
        open={!!detail}
        order={detail}
        tahapan={s.tahapan}
        st={detail ? statusOf(detail.tahapSelesai, total) : "baru"}
        stLabel={detail ? FILTER_LABEL[statusOf(detail.tahapSelesai, total)] : ""}
        title="Detail Maklon"
        onClose={() => setDetailId(null)}
        onSimpan={(tahapSelesai) => {
          setDemo({
            orders: s.orders.map((o) => (o.id === detailId ? { ...o, tahapSelesai } : o)),
          });
          setDetailId(null);
          demoToast("Perubahan disimpan (mode demo)");
        }}
        onSelesai={() => {
          setDemo({
            orders: s.orders.map((o) => (o.id === detailId ? { ...o, tahapSelesai: total } : o)),
          });
          setDetailId(null);
          demoToast("Maklon ditandai selesai (mode demo)");
        }}
      />

      {/* Edit — sheet sama dengan EditSheet admin asli (ikon pensil di tabel) */}
      <EditSheet
        open={!!editId}
        order={s.orders.find((o) => o.id === editId) ?? null}
        onClose={() => setEditId(null)}
      />

      {/* Form tambah maklon — struktur sama dengan AddForm admin asli */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} kicker="Maklon Baru" title="Tambah Maklon">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-[#F8FAFC] p-3.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Nomor Maklon</p>
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
          <label className="block">
            <span className="text-[13px] text-[#64748B]">Ukuran <span className="text-[#94A3B8]">(opsional — mis. XXL×10, XL×20)</span></span>
            <input
              value={form.sizes}
              onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
              placeholder="Contoh: XL×10, XXL×20"
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
            />
          </label>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#64748B]">Produk</span>
              {productRows.reduce((acc, p) => acc + (parseInt(p.qty, 10) || 0), 0) > 0 && (
                <span className="text-[12px] font-semibold text-[#04123F]">
                  Total: {productRows.reduce((acc, p) => acc + (parseInt(p.qty, 10) || 0), 0)} pcs
                </span>
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
              onPick={(e) => uploadDemoFoto(e, setDesignPhotos, setDesignUpload)}
              onRemove={(i) => setDesignPhotos((ps) => ps.filter((_, idx) => idx !== i))}
            />
            <FotoUpload
              label="WO"
              catatan="Admin only"
              fotos={woPhotos}
              alt="WO"
              uploading={woUpload}
              onPick={(e) => uploadDemoFoto(e, setWoPhotos, setWoUpload)}
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
          <BtnKuning onClick={tambah}>Simpan Maklon</BtnKuning>
        </div>
      </Modal>
    </div>
  );
}

"use client";

/**
 * Demo Pesanan — tampilan DISAMAKAN dengan dashboard admin asli
 * (/pesanan/orders): memakai kelas pas-* yang sama dari globals.css, jadi
 * KPI, toolbar, tabel, dan kartu mobile identik dengan app asli.
 * Data tetap dummy in-memory, terisolasi dari API/session.
 */
import { useMemo, useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { DEFAULT_PRODUCTS } from "@/lib/product-options";
import { pcsLabel } from "@/lib/utils";
import { formatNumericDateID } from "@/lib/format-date";
import { PageHead, BtnKuning, Modal } from "@/components/penawaran/demo/ui";
import KpiCard from "@/components/KpiCard";
import { DetailSheet } from "@/components/penawaran/demo/DetailSheet";
import { FotoUpload } from "@/components/penawaran/demo/FotoUpload";
import { uploadToCloudinary, optimizeImageUrl, DEMO_UPLOAD_FOLDER } from "@/lib/cloudinary";

/* ── Helper yang disamakan dengan PesananDashboard asli ── */
const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

type FilterKey = "all" | "baru" | "produksi" | "kirim" | "selesai";
const FILTER_LABEL: Record<FilterKey, string> = {
  all: "Semua", baru: "Baru", produksi: "Produksi", kirim: "Siap Dikirim", selesai: "Selesai",
};

const monthKeyOf = (iso: string) => (iso ? iso.slice(0, 7) : "");
const monthLabelOf = (key: string) => {
  const [y, m] = key.split("-");
  const idx = parseInt(m, 10) - 1;
  if (!y || isNaN(idx) || idx < 0 || idx > 11) return key;
  return `${MONTH_NAMES[idx]} ${y}`;
};

/** Status bucket (sama seperti admin asli): selesai → kirim → baru → produksi. */
function statusOf(tahapSelesai: number, total: number): FilterKey {
  if (tahapSelesai >= total) return "selesai";
  if (tahapSelesai >= total - 1) return "kirim";
  if (tahapSelesai <= 1) return "baru";
  return "produksi";
}

function deadlineStatus(deadline: string | null): { level: "normal" | "approaching" | "warning" | "critical" | "overdue" | null; diffDays: number } {
  if (!deadline) return { level: null, diffDays: 0 };
  const diffDays = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return { level: "overdue", diffDays };
  if (diffDays === 1) return { level: "critical", diffDays };
  if (diffDays === 2) return { level: "warning", diffDays };
  if (diffDays === 3) return { level: "approaching", diffDays };
  return { level: "normal", diffDays };
}

/** Badge keterangan deadline di kolom status (H-3/H-2/H-1/lewat). */
function deadlineNote(level: ReturnType<typeof deadlineStatus>["level"], diffDays: number): { text: string; cls: "warn" | "danger" } | null {
  switch (level) {
    case "overdue": {
      const late = Math.abs(diffDays);
      return { text: late > 0 ? `Lewat ${late} hari` : "Lewat deadline", cls: "danger" };
    }
    case "critical": return { text: "H-1", cls: "danger" };
    case "warning": return { text: "H-2", cls: "warn" };
    case "approaching": return { text: "H-3", cls: "warn" };
    default: return null;
  }
}

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const formatDate = (iso: string) => formatNumericDateID(iso) || "-";
/** Tanggal singkat untuk note KPI: "6 Okt" */
const shortDate = (iso: string) =>
  iso
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(`${iso}T00:00:00`))
    : "-";

/** Nomor pesanan demo — format sama dengan app asli: NSP + YYMMDD (WIB) + 4 acak. */
const ORDER_CHARSET = "ACDEFGHJKMNPQRSTUVWXYZ23456789";
const nomorPesananDemo = () =>
  "NSP" +
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "2-digit", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replace(/\D/g, "") +
  Array.from({ length: 4 }, () => ORDER_CHARSET[Math.floor(Math.random() * ORDER_CHARSET.length)]).join("");

export default function DemoPesanan() {
  const s = useDemo();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  // Form tambah pesanan — meniru AddForm app asli: customer + HP,
  // baris produk multi-entry (pilih dari daftar / tulis sendiri) + qty,
  // foto desain & WO (upload sungguhan ke Cloudinary, sama seperti app asli), tanggal order/deadline.
  const [form, setForm] = useState({ customer: "", phone: "", created: new Date().toISOString().slice(0, 10), deadline: "" });
  const [productRows, setProductRows] = useState<{ product: string; custom: boolean; qty: string }[]>([{ product: "", custom: false, qty: "" }]);
  const [productOptions, setProductOptions] = useState<string[]>([...DEFAULT_PRODUCTS]);
  const [designPhotos, setDesignPhotos] = useState<string[]>([]);
  const [woPhotos, setWoPhotos] = useState<string[]>([]);
  const [designUpload, setDesignUpload] = useState(false);
  const [woUpload, setWoUpload] = useState(false);
  const [formError, setFormError] = useState("");
  const totalQty = productRows.reduce((acc, p) => acc + (parseInt(p.qty, 10) || 0), 0);

  const total = s.tahapan.length;

  /* ── Statistik & filter — logika sama dengan ViewPesanan admin asli ── */
  const [selectedMonth, setSelectedMonth] = useState(() => monthKeyOf(new Date().toISOString()));

  const monthOptions = useMemo(() => {
    const keys = new Set<string>();
    s.orders.forEach((o) => {
      const k = monthKeyOf(o.mulai);
      if (k) keys.add(k);
    });
    keys.add(monthKeyOf(new Date().toISOString()));
    return Array.from(keys).sort().reverse();
  }, [s.orders]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return s.orders
      .filter((o) => {
        if (selectedMonth !== "all" && monthKeyOf(o.mulai) !== selectedMonth) return false;
        if (filter !== "all" && statusOf(o.tahapSelesai, total) !== filter) return false;
        if (!k) return true;
        return (o.kode + " " + o.customer + " " + o.produk).toLowerCase().includes(k);
      })
      .sort((a, b) => (a.id < b.id ? 1 : -1));
  }, [s.orders, selectedMonth, filter, q, total]);

  const stats = {
    total: s.orders.length,
    produksi: s.orders.filter((o) => ["produksi", "baru"].includes(statusOf(o.tahapSelesai, total))).length,
    kirim: s.orders.filter((o) => statusOf(o.tahapSelesai, total) === "kirim").length,
    selesai: s.orders.filter((o) => statusOf(o.tahapSelesai, total) === "selesai").length,
  };

  // Pesanan masuk dalam 7 hari terakhir (WIB) — delta KPI Total Pesanan.
  const baruMingguIni = useMemo(() => {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - 6);
    const cutoffKey = cutoff.toISOString().slice(0, 10);
    return s.orders.filter((o) => o.mulai && o.mulai.slice(0, 10) >= cutoffKey).length;
  }, [s.orders]);

  const nextDeadlineOrder = s.orders
    .filter((o) => o.deadline && o.tahapSelesai < total)
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1))[0] ?? null;
  const nextDeadline = nextDeadlineOrder?.deadline ?? null;
  const deadlineInfo = deadlineStatus(nextDeadline);

  const deadlineAlertCount = s.orders.filter((o) => {
    if (!o.deadline || o.tahapSelesai >= total) return false;
    const lvl = deadlineStatus(o.deadline).level;
    return lvl !== null && lvl !== "normal";
  }).length;
  const hasOverdue = s.orders.some((o) => o.tahapSelesai < total && o.deadline && deadlineStatus(o.deadline).level === "overdue");
  const hasWarning = s.orders.some((o) => o.tahapSelesai < total && o.deadline && ["approaching", "warning", "critical"].includes(deadlineStatus(o.deadline).level as string));

  const overdueCount = s.orders.filter((o) => o.tahapSelesai < total && o.deadline && deadlineStatus(o.deadline).level === "overdue").length;
  const produksiBadge =
    overdueCount > 0
      ? { text: `${overdueCount} lewat deadline`, cls: "pas-delta bad mb-0.5" }
      : deadlineAlertCount > 0
        ? { text: `${deadlineAlertCount} mendekati deadline`, cls: "pas-delta ok mb-0.5" }
        : { text: "on track", cls: "pas-delta good mb-0.5" };

  const detail = s.orders.find((o) => o.id === detailId) ?? null;

  const updateProductRow = (rowIdx: number, patch: Partial<{ product: string; custom: boolean; qty: string }>) =>
    setProductRows((rows) => rows.map((r, i) => (i === rowIdx ? { ...r, ...patch } : r)));

  // Upload foto sungguhan ke Cloudinary — alur sama dengan AddForm admin asli.
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
          kode: nomorPesananDemo(),
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

  const demoAksiHapus = () => demoToast("Mode Demo — aksi hapus tidak tersedia");

  return (
    <div>
      <PageHead
        title="Pesanan"
        action={<BtnKuning onClick={() => setFormOpen(true)}>+ Pesanan</BtnKuning>}
      />

      {/* KPI — struktur & kelas sama dengan admin asli */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        <KpiCard
          hero
          icon="total"
          label="Total Pesanan"
          value={stats.total}
          badge={<span className="pas-delta mb-0.5">+{baruMingguIni} minggu ini</span>}
        />
        <KpiCard
          icon="produksi"
          label="Sedang Produksi"
          value={stats.produksi}
          badge={<span className={produksiBadge.cls}>{produksiBadge.text}</span>}
        />
        <KpiCard
          icon="deadline"
          label="Deadline"
          value={deadlineAlertCount}
          valueClass={hasOverdue ? "text-red-500" : hasWarning ? "text-[var(--pas-orange)]" : "text-[#3F5BA9]"}
          badge={
            nextDeadline && deadlineInfo.level ? (
              deadlineInfo.level === "overdue" ? (
                <span className="pas-delta bad mb-0.5">lewat {Math.abs(deadlineInfo.diffDays)} hari</span>
              ) : (
                <span className="pas-delta ok mb-0.5">H-{deadlineInfo.diffDays}</span>
              )
            ) : undefined
          }
          note={
            nextDeadlineOrder
              ? `${nextDeadlineOrder.customer} · ${shortDate(nextDeadlineOrder.deadline)}`
              : "Belum ada deadline aktif"
          }
        />
        <KpiCard
          icon="selesai"
          label="Selesai"
          value={stats.selesai}
          badge={<span className="pas-delta good mb-0.5">{stats.selesai} bulan ini</span>}
        />
      </section>

      {/* Toolbar: cari + bulan + chip filter — sama seperti admin asli */}
      <section className="mt-7 flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-[620px]">
          <div className="pas-search w-full sm:max-w-[340px]">
            <svg className="pas-mag" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="pas-field w-full py-2.5 pr-4 text-[14px]"
              placeholder="Cari pesanan, nama, kota..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="pas-select-wrap shrink-0">
            <select
              className="pas-field appearance-none text-[13.5px] font-semibold pl-3.5 pr-9 py-2.5 cursor-pointer"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Filter bulan pesanan"
            >
              <option value="all">Semua bulan</option>
              {monthOptions.map((k) => (
                <option key={k} value={k}>{monthLabelOf(k)}</option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        <div className="pas-seg pas-bento-chip-scroll">
          {(["all", "baru", "produksi", "kirim", "selesai"] as FilterKey[]).map((f) => (
            <button key={f} className={`pas-chip pas-bento-chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
              {FILTER_LABEL[f]}
            </button>
          ))}
        </div>
      </section>

      {/* jumlah yang tampil setelah filter */}
      <p className="mt-2.5 text-[12.5px] text-[var(--pas-muted)]">
        Menampilkan <b className="text-[var(--pas-ink-1)]">{filtered.length}</b> dari {s.orders.length} pesanan
        <span> · {selectedMonth === "all" ? "semua bulan" : monthLabelOf(selectedMonth)}</span>
      </p>

      {/* Tabel desktop — kelas pas-tbl sama dengan admin asli */}
      <section className="pas-card mt-4 p-2 sm:p-4 hidden md:block w-full overflow-x-auto">
        <table className="pas-tbl w-full">
          <thead>
            <tr>
              <th className="w-[16%]">Pesanan</th>
              <th className="w-[18%]">Customer</th>
              <th className="w-[16%]">Produk</th>
              <th className="w-[16%]">Progres</th>
              <th className="w-[10%]">Order</th>
              <th className="w-[14%]">Deadline</th>
              <th className="w-[10%]">Status</th>
              <th className="w-[5%]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="text-[40px] opacity-30">📋</span>
                    <p className="text-[var(--pas-muted)] text-[15px] font-medium">Tidak ada pesanan yang cocok</p>
                    <p className="text-[var(--pas-muted)] text-[13px]">Coba ubah filter atau kata kunci pencarian</p>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((o) => {
              const st = statusOf(o.tahapSelesai, total);
              const pct = ((o.tahapSelesai + 1) / total) * 100;
              const stageName = s.tahapan[o.tahapSelesai] ?? `Tahap ${o.tahapSelesai + 1}`;
              const dlStatus = deadlineStatus(o.deadline);
              const dlNote = deadlineNote(dlStatus.level, dlStatus.diffDays);
              return (
                <tr key={o.id} onClick={() => setDetailId(o.id)}>
                  <td>
                    <span className="font-semibold pas-num">{o.kode}</span>
                    <br />
                    <span className="text-[12.5px] text-[var(--pas-muted)]">{pcsLabel(o.qty)}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="pas-avatar">{initials(o.customer)}</span>
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
                  <td className="text-[12.5px] text-[var(--pas-muted)] whitespace-nowrap">{formatDate(o.mulai)}</td>
                  <td className="text-[12.5px] whitespace-nowrap">
                    {o.deadline ? (
                      <span
                        className={
                          dlStatus.level === "overdue" ? "text-red-700 font-semibold"
                            : dlStatus.level === "critical" ? "text-red-500 font-semibold"
                              : dlStatus.level === "warning" ? "text-[var(--pas-orange)] font-semibold"
                                : dlStatus.level === "approaching" ? "text-amber-500 font-medium"
                                  : "text-[var(--pas-muted)]"
                        }
                      >
                        <span className="block">
                          {["overdue", "critical", "warning", "approaching"].includes(dlStatus.level as string) && (
                            <svg
                              width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                              className={`inline-block mr-1 -mt-px ${dlStatus.level === "overdue" ? "text-red-700" : dlStatus.level === "critical" ? "text-red-500" : dlStatus.level === "warning" ? "text-[var(--pas-orange)]" : "text-amber-500"}`}
                            >
                              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <path d="M12 9v4M12 17h.01" />
                            </svg>
                          )}
                          {formatDate(o.deadline)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[var(--pas-muted)]">-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`pas-pill ${st}`}>{FILTER_LABEL[st]}</span>
                      {dlNote && <span className={`pas-pill ${dlNote.cls}`}>{dlNote.text}</span>}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        className="text-[var(--pas-muted)] hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-blue-400/10"
                        title="Edit pesanan"
                        onClick={(e) => { e.stopPropagation(); setDetailId(o.id); }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="text-[var(--pas-muted)] hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-400/10"
                        title="Hapus pesanan"
                        onClick={(e) => { e.stopPropagation(); demoAksiHapus(); }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
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
            <span className="text-[40px] opacity-30">📋</span>
            <p className="text-[var(--pas-muted)] text-[15px] font-medium">Tidak ada pesanan yang cocok</p>
            <p className="text-[var(--pas-muted)] text-[13px]">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
        {filtered.map((o) => {
          const st = statusOf(o.tahapSelesai, total);
          const pct = ((o.tahapSelesai + 1) / total) * 100;
          const stageName = s.tahapan[o.tahapSelesai] ?? `Tahap ${o.tahapSelesai + 1}`;
          const dlStatus = deadlineStatus(o.deadline);
          const dlNote = deadlineNote(dlStatus.level, dlStatus.diffDays);
          return (
            <div key={o.id} className="pas-bento-card cursor-pointer" onClick={() => setDetailId(o.id)}>
              {/* Baris 1: nomor pesanan + badge status */}
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-[16px] pas-num min-w-0 truncate">{o.kode}</p>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className={`pas-pill ${st} whitespace-nowrap`}>{FILTER_LABEL[st]}</span>
                  {dlNote && <span className={`pas-pill ${dlNote.cls} whitespace-nowrap`}>{dlNote.text}</span>}
                </span>
              </div>

              {/* Baris 2: avatar + nama customer + pcs */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="pas-bento-avatar">{initials(o.customer)}</span>
                  <p className="text-[14px] font-medium truncate">{o.customer}</p>
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
                <p
                  className={
                    dlStatus.level === "overdue" ? "text-[12px] text-red-700 font-semibold"
                      : dlStatus.level === "critical" ? "text-[12px] text-red-500 font-semibold"
                        : dlStatus.level === "warning" ? "text-[12px] text-[var(--pas-orange)] font-semibold"
                          : dlStatus.level === "approaching" ? "text-[12px] text-amber-500 font-medium"
                            : "text-[12px] text-[var(--pas-muted)]"
                  }
                >
                  {["overdue", "critical", "warning", "approaching"].includes(dlStatus.level as string) && "⚠ "}
                  Deadline: {formatDate(o.deadline)}
                </p>
              </div>

              {/* Aksi kartu — target sentuh 40px */}
              <div className="mt-3 flex items-center justify-end gap-1">
                <button
                  className="w-10 h-10 grid place-items-center rounded-lg text-[var(--pas-muted)] hover:text-blue-400 hover:bg-blue-400/10 transition"
                  title="Edit"
                  aria-label="Edit pesanan"
                  onClick={(e) => { e.stopPropagation(); setDetailId(o.id); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="w-10 h-10 grid place-items-center rounded-lg text-[var(--pas-muted)] hover:text-red-400 hover:bg-red-400/10 transition"
                  title="Hapus"
                  aria-label="Hapus pesanan"
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
          demoToast("Pesanan ditandai selesai (mode demo)");
        }}
      />

      {/* Form tambah pesanan — struktur sama dengan app asli */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} kicker="Pesanan Baru" title="Tambah Pesanan">
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
          <BtnKuning onClick={tambah}>Simpan Pesanan</BtnKuning>
        </div>
      </Modal>
    </div>
  );
}



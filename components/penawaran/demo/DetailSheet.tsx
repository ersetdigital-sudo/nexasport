"use client";

/**
 * Sheet detail pesanan demo — disamakan dengan DetailSheet admin asli
 * (components/admin/PesananDashboard.tsx): topbar sticky + status hero +
 * progress produksi + timeline produksi yang bisa diklik ("klik untuk ubah") +
 * info pesanan + footer Simpan Perubahan / Tandai Selesai.
 * Data tetap in-memory (mode demo) — tidak ada call ke API/Supabase.
 */
import { useEffect, useState } from "react";
import { STEP_PROGRESS } from "@/lib/types";
import { formatDateTimeWIB, formatShortDateID } from "@/lib/format-date";
import { pcsLabel } from "@/lib/utils";

type DemoDetailOrder = {
  kode: string;
  customer: string;
  phone?: string;
  produk: string;
  qty: number;
  tahapSelesai: number;
  deadline: string;
  mulai: string;
};

export function DetailSheet({
  open,
  order,
  tahapan,
  st,
  stLabel,
  title = "Detail Pesanan",
  onClose,
  onSimpan,
  onSelesai,
}: {
  open: boolean;
  order: DemoDetailOrder | null;
  tahapan: string[];
  /** Kelas & label status pesanan tersimpan — dihitung di halaman (statusOf/FILTER_LABEL). */
  st: string;
  stLabel: string;
  /** Judul topbar — "Detail Pesanan" untuk pesanan, "Detail Maklon" untuk maklon. */
  title?: string;
  onClose: () => void;
  onSimpan: (tahapSelesai: number) => void;
  onSelesai: () => void;
}) {
  const [step, setStep] = useState(1);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Setiap ganti order, step kembali mengikuti kondisi tersimpannya.
  useEffect(() => {
    if (order) {
      setStep(order.tahapSelesai >= tahapan.length ? tahapan.length : order.tahapSelesai + 1);
      setCopiedPhone(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.kode, order?.tahapSelesai]);

  if (!open || !order) return null;

  const total = tahapan.length;
  const selesai = order.tahapSelesai >= total;
  const pct = STEP_PROGRESS[step] ?? Math.round((step / total) * 100);
  const tgl = (iso: string) => formatShortDateID(iso) || "-";

  const salinHp = async () => {
    try {
      await navigator.clipboard.writeText(order.phone || "");
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      /* clipboard tidak tersedia — abaikan */
    }
  };

  return (
    <div className="pas-sheet open">
      <div className="pas-veil" onClick={onClose} />
      <div className="pas-panel p-0" style={{ display: "flex", flexDirection: "column" }}>
        {/* ── TOPBAR ── */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3.5 border-b border-[var(--pas-line)]"
          style={{ background: "rgba(245,247,250,.85)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
        >
          <button
            className="w-9 h-9 rounded-[10px] border border-[var(--pas-line)] bg-[var(--pas-surface)] grid place-items-center text-[var(--pas-muted)] hover:text-[var(--pas-ink-1)] hover:border-[rgba(4,18,63,.22)] transition shrink-0"
            onClick={onClose}
            aria-label="Kembali"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="min-w-0 flex-1">
            <div className="pas-display text-[16px] leading-tight">{title}</div>
            <div className="text-[12px] text-[var(--pas-muted)] pas-num mt-0.5">{order.kode}</div>
          </div>
          <span className={`pas-pill ${st} text-[11px]`}>{stLabel}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8" style={{ scrollbarColor: "var(--pas-line) transparent" }}>
          {/* ── STATUS HERO ── */}
          <div className="rounded-2xl border border-[var(--pas-line)] bg-[var(--pas-surface)] shadow-[0_1px_3px_rgba(0,0,0,.04),0_4px_12px_rgba(0,0,0,.04)] p-6 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[rgba(4,18,63,.12)] grid place-items-center text-[var(--pas-accent)] text-[22px]">
              {selesai ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              )}
            </div>
            <div className="pas-display text-[18px] leading-tight">{tahapan[step - 1] ?? `Tahap ${step}`}</div>
            <p className="text-[13px] text-[var(--pas-muted)] max-w-[300px] leading-relaxed">
              {selesai ? (
                "Pesanan sudah selesai dan diterima oleh customer."
              ) : (
                <>
                  <span className="pas-stencil text-[9px] text-[var(--pas-muted)] block">Terakhir Diupdate</span>
                  <span className="mt-1 block text-[14px] font-semibold">{formatDateTimeWIB(new Date().toISOString())}</span>
                </>
              )}
            </p>
          </div>

          {/* ── PROGRESS ── */}
          <p className="pas-stencil text-[9px] text-[var(--pas-muted)] mt-6 mb-2">Progress Produksi</p>
          <div className="rounded-2xl border border-[var(--pas-line)] bg-[var(--pas-surface)] shadow-[0_1px_3px_rgba(0,0,0,.04)] p-4">
            <div className="flex items-end justify-between mb-3">
              <div className="pas-display text-[28px] leading-none pas-num text-[var(--pas-accent)]">{pct}%</div>
              <div className="text-[13px] font-semibold text-[var(--pas-ink-2)]">Tahap {step} dari {total}</div>
            </div>
            <div className="h-[6px] rounded-full bg-[rgba(4,18,63,.08)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--pas-accent)]" style={{ width: `${pct}%`, transition: "width .6s cubic-bezier(.22,1,.36,1)" }} />
            </div>
          </div>

          {/* ── TIMELINE STEPPER ── */}
          <p className="pas-stencil text-[9px] text-[var(--pas-muted)] mt-6 mb-2">Timeline Produksi</p>
          <div className="rounded-2xl border border-[var(--pas-line)] bg-[var(--pas-surface)] shadow-[0_1px_3px_rgba(0,0,0,.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--pas-line)] flex items-center justify-between">
              <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Urutan Tahapan</span>
              <span className="pas-stencil text-[9px] text-[var(--pas-muted)] opacity-50">klik untuk ubah</span>
            </div>
            <div className="px-4 py-2">
              {tahapan.map((t, i) => {
                const isDone = i + 1 < step;
                const isCur = i + 1 === step;
                return (
                  <div key={t} className="flex items-start gap-3.5 relative" style={{ padding: "5px 0" }}>
                    {i < tahapan.length - 1 && (
                      <div className="absolute left-[10px] top-[25px] bottom-[-5px] w-[2px] rounded-full" style={{ background: isDone ? "var(--pas-accent)" : "var(--pas-line)" }} />
                    )}
                    <button
                      type="button"
                      className="flex items-start gap-3.5 w-full text-left bg-transparent border-0 p-0 cursor-pointer"
                      onClick={() => setStep(i + 1)}
                    >
                      <span
                        className="w-[22px] h-[22px] rounded-full grid place-items-center text-[9px] font-bold shrink-0 mt-[1px] transition-all duration-200"
                        style={{
                          background: isDone ? "var(--pas-accent)" : "var(--pas-surface)",
                          border: isDone || isCur ? "2px solid var(--pas-accent)" : "2px solid var(--pas-line)",
                          color: isDone ? "#fff" : isCur ? "var(--pas-accent)" : "var(--pas-muted)",
                          boxShadow: isDone ? "none" : isCur ? "0 0 0 4px rgba(4,18,63,.12)" : "none",
                        }}
                      >
                        {isDone ? "✓" : i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13.5px] leading-snug ${isCur ? "font-bold text-[var(--pas-ink-1)]" : isDone ? "font-medium text-[var(--pas-ink-2)]" : "text-[var(--pas-muted)]"}`}>
                          {i + 1}. {t}
                        </div>
                        {isDone && <div className="text-[11px] text-[var(--pas-muted)] opacity-70 mt-0.5">Selesai</div>}
                        {isCur && <div className="text-[11px] text-[var(--pas-muted)] opacity-70 mt-0.5">Sedang dikerjakan</div>}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── INFO PESANAN ── */}
          <p className="pas-stencil text-[9px] text-[var(--pas-muted)] mt-6 mb-2">Informasi Pesanan</p>
          <div className="rounded-2xl border border-[var(--pas-line)] bg-[var(--pas-surface)] shadow-[0_1px_3px_rgba(0,0,0,.04)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--pas-line)]" style={{ background: "rgba(4,18,63,.03)" }}>
              <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Data Order</span>
            </div>
            <div className="grid grid-cols-2">
              <div className="col-span-2 px-4 py-3 border-b border-[var(--pas-line)]">
                <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Customer</span>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold truncate">{order.customer || "-"}</p>
                    <p className="text-[13px] text-[var(--pas-muted)] pas-num mt-0.5">{order.phone || "-"}</p>
                  </div>
                  {order.phone && (
                    <button type="button" onClick={salinHp} className="pas-btn-ghost px-3 py-2 text-[12px] shrink-0" title="Salin nomor HP customer" aria-label="Salin nomor HP customer">
                      {copiedPhone ? "Tersalin ✓" : "Salin No. HP"}
                    </button>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 border-b border-r border-[var(--pas-line)]">
                <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Tanggal Order</span>
                <p className="mt-1 text-[14px] font-semibold">{tgl(order.mulai)}</p>
              </div>
              <div className="px-4 py-3 border-b border-[var(--pas-line)]">
                <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Deadline</span>
                <p className="mt-1 text-[14px] font-semibold text-[var(--pas-orange)]">{tgl(order.deadline)}</p>
              </div>
              <div className="px-4 py-3 border-b border-r border-[var(--pas-line)]">
                <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Status Produksi</span>
                <p className="mt-1 text-[14px] font-semibold">{tahapan[step - 1] ?? `Tahap ${step}`}</p>
              </div>
              <div className="px-4 py-3 border-b border-[var(--pas-line)]">
                <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Progress</span>
                <p className="mt-1 text-[14px] font-semibold">{pct}%</p>
              </div>
              <div className="col-span-2 px-4 py-3 border-b border-[var(--pas-line)]">
                <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Produk</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {order.produk.split(",").map((nama, pi) => (
                    <span key={pi} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold bg-[rgba(4,18,63,.06)] border border-[rgba(4,18,63,.12)] text-[var(--pas-ink-1)]">
                      {nama.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3 border-b border-r border-[var(--pas-line)]">
                <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Jumlah</span>
                <p className="mt-1 text-[14px] font-semibold">{pcsLabel(order.qty)}</p>
              </div>
              <div className="px-4 py-3 border-b border-[var(--pas-line)]">
                <span className="pas-stencil text-[9px] text-[var(--pas-muted)]">Ekspedisi / Resi</span>
                <p className="mt-1 text-[13px] text-[var(--pas-muted)]">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="sticky bottom-0 flex gap-2.5 px-5 py-4 border-t border-[var(--pas-line)]" style={{ background: "linear-gradient(180deg,rgba(245,247,250,0),var(--pas-bg) 30%)" }}>
          <button
            className="flex-1 py-3.5 rounded-[10px] text-[12px] font-bold text-white border-0 cursor-pointer transition-all"
            style={{ fontFamily: "var(--font-display), system-ui, sans-serif", letterSpacing: ".04em", textTransform: "uppercase", background: "var(--pas-accent)", boxShadow: "0 2px 8px rgba(4,18,63,.18)" }}
            onClick={() => onSimpan(step - 1)}
          >
            Simpan Perubahan
          </button>
          <button
            className="px-5 py-3.5 rounded-[10px] text-[12px] font-bold border border-[var(--pas-line)] bg-[var(--pas-surface)] text-[var(--pas-ink-1)] cursor-pointer transition-all"
            style={{ fontFamily: "var(--font-display), system-ui, sans-serif", letterSpacing: ".04em", textTransform: "uppercase" }}
            onClick={onSelesai}
          >
            Tandai Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

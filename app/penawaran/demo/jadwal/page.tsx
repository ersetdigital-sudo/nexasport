"use client";

/**
 * Demo Jadwal Produksi — papan KANBAN disamakan dengan ViewJadwal admin asli
 * (components/admin/PesananDashboard.tsx): lane per pasangan tahap (buildLanes),
 * kartu pas-order-card dengan avatar + progress bar, drag & drop antar lane
 * (mouse + touch), klik kartu membuka DetailSheet. Data tetap dummy in-memory
 * (demo store) — "drop" hanya mengubah tahapSelesai, tanpa API/Supabase.
 */
import { useMemo, useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { pcsLabel } from "@/lib/utils";
import { PageHead } from "@/components/penawaran/demo/ui";
import { DetailSheet } from "@/components/penawaran/demo/DetailSheet";

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

/** Lane = pasangan 2 tahap — sama seperti buildLanes di admin. */
function buildLanes(tahapan: string[]) {
  const list = tahapan.length > 0 ? tahapan : ["Desain"];
  const lanes: { key: string; name: string; from: number; to: number }[] = [];
  for (let i = 0; i < list.length; i += 2) {
    const names = [list[i], list[i + 1]].filter(Boolean).join(" & ");
    lanes.push({
      key: `lane-${lanes.length + 1}`,
      name: names || `Tahap ${i + 1}`,
      from: i + 1,
      to: Math.min(i + 2, list.length),
    });
  }
  return lanes;
}

/** Warna fase — tema cuma punya 4 warna, dipakai berulang (sama seperti admin). */
const LANE_COLOR_CYCLE = [
  "var(--lane-desain)",
  "var(--lane-produksi)",
  "var(--lane-finishing)",
  "var(--lane-kirim)",
];

export default function DemoJadwal() {
  const s = useDemo();
  const [detailId, setDetailId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overLane, setOverLane] = useState<string | null>(null);

  const total = s.tahapan.length;
  const lanes = useMemo(() => buildLanes(s.tahapan), [s.tahapan]);

  // Papan hanya memuat order aktif (belum selesai) — sama seperti admin.
  const active = s.orders.filter((o) => o.tahapSelesai < total);

  const detail = s.orders.find((o) => o.id === detailId) ?? null;

  function barClass(pct: number) {
    if (pct >= 100) return "done";
    if (pct >= 66) return "high";
    if (pct >= 33) return "mid";
    return "low";
  }

  // Drop = geser tahap berjalan ke tengah lane tujuan (in-memory saja).
  function handleDrop(orderId: number, laneKey: string) {
    const laneIdx = lanes.findIndex((l) => l.key === laneKey);
    if (laneIdx < 0) return;
    const targetStep = lanes[laneIdx].from;
    const order = s.orders.find((o) => o.id === orderId);
    if (!order) return;
    const targetDone = Math.min(targetStep - 1, total);
    if (order.tahapSelesai === targetDone) return;
    setDemo({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, tahapSelesai: targetDone } : o)),
    });
    demoToast(`${order.kode} dipindah ke ${lanes[laneIdx].name}`);
  }

  const laneProps = (variant: string, key: string) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (draggingId !== null) setOverLane(`${variant}:${key}`);
    },
    onDragLeave: () => setOverLane((v) => (v === `${variant}:${key}` ? null : v)),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("text/plain");
      const id = raw ? parseInt(raw, 10) : draggingId;
      setOverLane(null);
      setDraggingId(null);
      if (id) handleDrop(id, key);
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (draggingId === null) return;
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const laneEl = el?.closest("[data-lane-key]") as HTMLElement | null;
      const k = laneEl?.dataset.laneKey || null;
      setOverLane(k ? `${variant}:${k}` : null);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const laneEl = el?.closest("[data-lane-key]") as HTMLElement | null;
      const k = laneEl?.dataset.laneKey || null;
      const id = draggingId;
      setOverLane(null);
      setDraggingId(null);
      if (id && k) handleDrop(id, k);
    },
  });

  return (
    <div>
      <PageHead
        title="Jadwal Produksi"
        action={
          <span className="rounded-xl bg-[#F1F5F9] px-3 py-2 text-[12.5px] font-semibold text-[#475569]">
            {active.length} pesanan aktif
          </span>
        }
      />
      <p className="text-[13.5px] text-[#64748B] mb-4">
        Papan produksi — pesanan dikelompokkan per fase. Geser kartu untuk update tahap.
      </p>

      {(["desktop", "mobile"] as const).map((variant) => (
        <div key={variant} className={variant === "desktop" ? "pas-board hidden md:flex" : "flex flex-col md:hidden"}>
          {lanes.map((lane, i) => {
            const items = active.filter((o) => {
              const berjalan = Math.min(o.tahapSelesai + 1, total);
              return berjalan >= lane.from && berjalan <= lane.to;
            });
            const isOver = overLane === `${variant}:${lane.key}`;
            return (
              <div
                key={`${variant}:${lane.name}`}
                className={`pas-lane ${isOver ? "pas-lane-over" : ""}`}
                data-lane-key={lane.key}
                {...laneProps(variant, lane.key)}
              >
                <div className="pas-lane-head">
                  <span className="pas-lane-title">
                    <span className="pas-lane-dot" style={{ background: LANE_COLOR_CYCLE[i % LANE_COLOR_CYCLE.length] }} />
                    {lane.name}
                  </span>
                  <span className="pas-lane-count">{items.length}</span>
                </div>
                <div className="pas-lane-body" data-lane-key={lane.key}>
                  {items.length === 0 ? (
                    <div className="pas-lane-empty">
                      <div className="pas-lane-empty-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M9 12h6M12 9v6" />
                        </svg>
                      </div>
                      <p className="pas-lane-empty-text">Belum ada pesanan</p>
                      <p className="pas-lane-empty-sub">Pesanan akan muncul di sini</p>
                    </div>
                  ) : (
                    items.map((o) => {
                      const berjalan = Math.min(o.tahapSelesai + 1, total);
                      const pct = Math.round((berjalan / total) * 100);
                      const stepName = s.tahapan[berjalan - 1] || `Tahap ${berjalan}`;
                      const isDragging = draggingId === o.id;
                      return (
                        <div
                          key={o.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", String(o.id));
                            e.dataTransfer.effectAllowed = "move";
                            setDraggingId(o.id);
                          }}
                          onDragEnd={() => { setDraggingId(null); setOverLane(null); }}
                          onTouchStart={() => setDraggingId(o.id)}
                          onClick={() => { if (!isDragging) setDetailId(o.id); }}
                          className={`pas-order-card ${isDragging ? "pas-dragging" : ""}`}
                          data-lane={lane.key}
                          style={{ opacity: isDragging ? 0.55 : 1, touchAction: "none" }}
                        >
                          <div className="pas-card-top">
                            <div className="flex items-center gap-2.5">
                              <span className="pas-card-avatar">{initials(o.customer)}</span>
                              <span className="pas-card-id">{o.kode}</span>
                            </div>
                            <span className="pas-card-pcs">{pcsLabel(o.qty)}</span>
                          </div>
                          <div className="pas-card-body">
                            <p className="pas-card-customer">{o.customer}</p>
                            <p className="pas-card-product">{o.produk}</p>
                          </div>
                          <div className="pas-card-progress">
                            <div className="pas-card-bar">
                              <div className={`pas-card-bar-fill ${barClass(pct)}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="pas-card-pct">{pct}%</span>
                          </div>
                          <div className="pas-card-step">
                            <span className="pas-card-step-dot" />
                            {stepName}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

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
    </div>
  );
}

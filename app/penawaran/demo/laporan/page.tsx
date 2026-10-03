"use client";

/**
 * Demo Laporan — DISAMAKAN dengan ViewLaporan admin asli
 * (components/admin/PesananDashboard.tsx): picker bulan, Ringkasan
 * Operasional (4 KPI), Penjualan per Produk (donut + legend + bar + KPI +
 * rincian), Kapasitas Produksi (track + detail), Order per Minggu, dan
 * Beban per Fase Produksi. Semua angka dihitung dari data dummy in-memory
 * (demo store) — kapasitas diatur di halaman Pengaturan demo.
 */
import { useMemo, useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { productFamily } from "@/lib/product-options";
import { PageHead } from "@/components/penawaran/demo/ui";

const DEFAULT_KAPASITAS = 2500;
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
/** Palet donut/legend; diulang kalau jumlah produk melebihi jumlah warna. */
const CAT_COLORS = ["#04123F", "#FEC40B", "#FEC40B", "#6B7280", "#8A6A00", "#3F5BA9"];

function monthLabelOf(key: string): string {
  const [y, m] = key.split("-");
  const idx = parseInt(m, 10) - 1;
  if (!y || isNaN(idx) || idx < 0 || idx > 11) return key;
  return `${MONTH_NAMES[idx]} ${y}`;
}

/** Label produk untuk laporan; nama kosong tetap dihitung. */
function productLabel(name: string | null | undefined): string {
  return (name || "").trim() || "Tanpa nama produk";
}

/** Lane = pasangan 2 tahap — sama seperti buildLanes di admin. */
function buildLanes(tahapan: string[]) {
  const lanes: { key: string; name: string; from: number; to: number }[] = [];
  for (let i = 0; i < tahapan.length; i += 2) {
    const names = [tahapan[i], tahapan[i + 1]].filter(Boolean).join(" & ");
    lanes.push({
      key: `lane-${lanes.length + 1}`,
      name: names || `Tahap ${i + 1}`,
      from: i + 1,
      to: Math.min(i + 2, tahapan.length),
    });
  }
  return lanes;
}

export default function DemoLaporan() {
  const s = useDemo();
  const total = s.tahapan.length;

  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );

  // Bulan yang tersedia — dari tanggal mulai order, plus bulan berjalan.
  const monthOptions = useMemo(() => {
    const keys = new Set<string>();
    s.orders.forEach((o) => {
      const k = (o.mulai || "").slice(0, 7);
      if (k) keys.add(k);
    });
    keys.add(new Date().toISOString().slice(0, 7));
    return Array.from(keys).sort().reverse();
  }, [s.orders]);

  const monthOrders = useMemo(
    () => s.orders.filter((o) => (o.mulai || "").slice(0, 7) === selectedMonth),
    [s.orders, selectedMonth]
  );

  const totalOrders = monthOrders.length;
  const totalPcs = monthOrders.reduce((a, o) => a + o.qty, 0);

  // Rata-rata waktu produksi = selisih mulai sampai deadline untuk order
  // yang sudah selesai (data demo punya pasangan tanggal ini).
  const durations = monthOrders
    .filter((o) => o.tahapSelesai >= total)
    .map((o) => {
      const start = new Date(o.mulai).getTime();
      const end = new Date(o.deadline).getTime();
      if (isNaN(start) || isNaN(end) || end < start) return null;
      return (end - start) / 86400000;
    })
    .filter((v): v is number => v !== null);

  const avgTime = durations.length
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : null;

  // Kapasitas produksi — beban bulan terpilih vs setting (demo store)
  const capacity = s.kapasitas ?? DEFAULT_KAPASITAS;
  const capPct = capacity > 0 ? Math.round((totalPcs / capacity) * 100) : 0;
  const isOver = totalPcs > capacity;
  const isWarn = !isOver && capPct >= 85;
  const excess = Math.max(totalPcs - capacity, 0);
  const capClass = isOver ? "danger" : isWarn ? "warn" : "produksi";

  // Penjualan per produk — label = nama produk apa adanya, urut pcs terbanyak
  const cats = useMemo(() => {
    const acc: Record<string, number> = {};
    monthOrders.forEach((o) => {
      const label = productLabel(o.produk);
      if (o.qty > 0) acc[label] = (acc[label] || 0) + o.qty;
    });
    return Object.keys(acc)
      .filter((label) => acc[label] > 0)
      .sort((a, b) => acc[b] - acc[a] || a.localeCompare(b, "id"))
      .map((label, i) => ({
        label,
        pcs: acc[label],
        color: CAT_COLORS[i % CAT_COLORS.length],
      }));
  }, [monthOrders]);

  const catTotal = cats.reduce((a, c) => a + c.pcs, 0);

  // Komposisi Atasan vs Setelan — dimensi produksi
  const families = useMemo(() => {
    const acc = { Atasan: 0, Setelan: 0, Lainnya: 0 };
    cats.forEach((c) => {
      const fam = productFamily(c.label);
      if (fam) acc[fam] += c.pcs;
      else acc.Lainnya += c.pcs;
    });
    return (["Setelan", "Atasan", "Lainnya"] as const)
      .map((label) => ({ label, pcs: acc[label] }))
      .filter((f) => f.pcs > 0);
  }, [cats]);
  const catMax = Math.max(...cats.map((c) => c.pcs), 1);
  const CIRC = 2 * Math.PI * 46;

  // Segmen donut dihitung berurutan — dashoffset bergantung akumulasi share
  let accShare = 0;
  const donutSegments = cats.map((c) => {
    const share = catTotal > 0 ? c.pcs / catTotal : 0;
    const len = share * CIRC;
    const seg = (
      <circle
        key={c.label}
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke={c.color}
        strokeWidth="15"
        strokeDasharray={`${len.toFixed(2)} ${(CIRC - len).toFixed(2)}`}
        strokeDashoffset={(-accShare * CIRC).toFixed(2)}
      >
        <title>{`${c.label}: ${c.pcs.toLocaleString("id-ID")} pcs`}</title>
      </circle>
    );
    accShare += share;
    return seg;
  });

  // Order per minggu pada bulan terpilih (W1 = tgl 1-7, dst)
  const weeks = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    monthOrders.forEach((o) => {
      const day = Number((o.mulai || "").slice(8, 10));
      if (isNaN(day)) return;
      buckets[Math.min(Math.floor((day - 1) / 7), 4)] += 1;
    });
    return buckets
      .map((value, i) => ({ label: `W${i + 1}`, value }))
      .filter((w, i) => !(i === 4 && w.value === 0));
  }, [monthOrders]);

  const weekMax = Math.max(...weeks.map((w) => w.value), 1);
  const weekTotal = weeks.reduce((a, w) => a + w.value, 0);

  // Beban per fase — real-time, tidak ikut filter bulan
  const byStage = buildLanes(s.tahapan).map((l) => ({
    name: l.name,
    n: s.orders.filter((o) => {
      const berjalan = Math.min(o.tahapSelesai + 1, total);
      return berjalan >= l.from && berjalan <= l.to && o.tahapSelesai < total;
    }).length,
  }));
  const max = Math.max(...byStage.map((b) => b.n), 1);

  const periode = monthLabelOf(selectedMonth);
  const nf = (n: number) => n.toLocaleString("id-ID");
  const pctOf = (v: number, t: number) => (t > 0 ? ((v / t) * 100).toFixed(1) : "0.0");

  return (
    <div>
      <PageHead kicker="Data" title="Laporan" />
      <div className="space-y-6">
        {/* Peringatan kapasitas */}
        {isOver && (
          <div className="pas-alert over">
            <span className="ic">!</span>
            <div>
              <b>
                Kapasitas produksi terlampaui — {capPct}% ({nf(totalPcs)} / {nf(capacity)} pcs)
              </b>
              Beban bulan ini melebihi kapasitas sebesar <b>+{nf(excess)} pcs</b>. Risiko
              keterlambatan SLA 7-10 hari.
              <ul>
                <li>Tahan atau jadwalkan ulang order baru ke bulan berikutnya</li>
                <li>Tambah shift, atau alihkan sebagian ke maklon</li>
                <li>Cek fase dengan beban tertinggi di &ldquo;Beban per Fase Produksi&rdquo;</li>
              </ul>
            </div>
          </div>
        )}
        {isWarn && (
          <div className="pas-alert warn">
            <span className="ic">!</span>
            <div>
              <b>
                Kapasitas hampir penuh — {capPct}% ({nf(totalPcs)} / {nf(capacity)} pcs)
              </b>
              Sisa kapasitas tinggal <b>{nf(capacity - totalPcs)} pcs</b>. Pantau order masuk
              sebelum melewati batas.
            </div>
          </div>
        )}

        {/* Pilih bulan */}
        <div className="pas-picker">
          <div className="flex items-center gap-2.5">
            <span className="pas-picker-ic">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <path d="M8 2v4M16 2v4M3 10h18" />
              </svg>
            </span>
            <b className="text-[13.5px] font-bold text-ink">Pilih Bulan</b>
          </div>
          <div className="pas-select-wrap">
            <select
              className="pas-field appearance-none text-[13.5px] font-semibold pl-3.5 pr-9 py-2.5 cursor-pointer"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Pilih bulan laporan"
            >
              {monthOptions.map((k) => (
                <option key={k} value={k}>
                  {monthLabelOf(k)}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <span className="flex-1" />
          <span className="text-[11.5px] text-[var(--pas-muted)] font-medium">
            Berlaku untuk Ringkasan, Penjualan per Produk, Kapasitas &amp; Order per Minggu
          </span>
        </div>

        {/* Ringkasan Operasional */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-semibold text-ink">Ringkasan Operasional</h2>
            <span className="text-[13px] text-[var(--pas-muted)]">
              Periode: <b>{periode}</b>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="pas-card p-[18px] flex flex-col">
              <div className="flex items-center gap-2 text-[var(--pas-muted)] text-[13px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                Total Pesanan
              </div>
              <p className="pas-display pas-num text-[32px] mt-auto pt-1">{totalOrders}</p>
              <p className="text-[12px] text-[var(--pas-muted)] mt-0.5">semua status</p>
            </div>

            <div className="pas-card p-[18px] flex flex-col">
              <div className="flex items-center gap-2 text-[var(--pas-muted)] text-[13px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Total Item
              </div>
              <p className="pas-display pas-num text-[32px] mt-auto pt-1">
                {nf(totalPcs)} <span className="text-[16px]">pcs</span>
              </p>
              <p className="text-[12px] text-[var(--pas-muted)] mt-0.5">dari {totalOrders} pesanan</p>
            </div>

            <div className="pas-card p-[18px] flex flex-col">
              <div className="flex items-center gap-2 text-[var(--pas-muted)] text-[13px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Rata-rata Waktu
              </div>
              <p className="pas-display pas-num text-[32px] mt-auto pt-1">
                {avgTime === null ? (
                  "–"
                ) : (
                  <>
                    {avgTime.toFixed(1).replace(".", ",")}{" "}
                    <span className="text-[16px]">hari</span>
                  </>
                )}
              </p>
              <p className="text-[12px] text-[var(--pas-muted)] mt-0.5">
                {durations.length > 0
                  ? `dari ${durations.length} order selesai · SLA 7-10 hari`
                  : "belum ada order selesai di periode ini"}
              </p>
            </div>

            <div className="pas-card p-[18px] flex flex-col">
              <div className="flex items-center gap-2 text-[var(--pas-muted)] text-[13px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                Aktif Produksi
              </div>
              <p className="pas-display pas-num text-[32px] mt-auto pt-1">
                {s.orders.filter((o) => o.tahapSelesai < total).length}
              </p>
              <p className="text-[12px] text-[var(--pas-muted)] mt-0.5">pesanan dalam proses</p>
              <span className="pas-pill warn mt-1.5 self-start">real-time · tidak ikut filter bulan</span>
            </div>
          </div>
        </div>

        {/* Penjualan per Produk */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-semibold text-ink">Penjualan per Produk</h2>
            <span className="text-[13px] text-[var(--pas-muted)]">
              Total terjual — <b>{periode}</b>
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-4">
            <div className="pas-card p-[18px] flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[13px] font-semibold text-ink">Proporsi Produk</p>
                <span className="text-[11px] text-[var(--pas-muted)]">per nama produk</span>
              </div>

              {families.length > 0 && (
                <p className="text-[11.5px] text-[var(--pas-muted)] mb-3">
                  Komposisi:{" "}
                  {families.map((f, i) => (
                    <span key={f.label}>
                      {i > 0 && " · "}
                      <b className="text-ink">{f.label}</b>{" "}
                      <span className="pas-num">{nf(f.pcs)}</span> pcs
                    </span>
                  ))}
                </p>
              )}

              {catTotal === 0 ? (
                <p className="text-[12.5px] text-[var(--pas-muted)] py-10 text-center">
                  Belum ada penjualan pada periode ini.
                </p>
              ) : (
                <>
                  <div className="pas-donut-wrap">
                    <div className="pas-donut">
                      <svg
                        viewBox="0 0 120 120"
                        width="100%"
                        height="100%"
                        role="img"
                        aria-label="Donut proporsi produk"
                      >
                        <circle cx="60" cy="60" r="46" fill="none" stroke="#E9EFF7" strokeWidth="15" />
                        <g transform="rotate(-90 60 60)">{donutSegments}</g>
                      </svg>
                      <div className="pas-donut-center">
                        <b className="pas-num">{nf(catTotal)}</b>
                        <small>total pcs</small>
                      </div>
                    </div>

                    <div className="pas-legend">
                      {cats.map((c) => (
                        <div key={c.label} className="pas-legend-row">
                          <span className="sw" style={{ background: c.color }} />
                          {c.label}
                          <span className="q pas-num">{nf(c.pcs)} pcs</span>
                          <b className="pas-num">{pctOf(c.pcs, catTotal)}%</b>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-3">
                    {cats.map((c) => (
                      <div key={c.label} className="pas-cbar">
                        <div className="top">
                          <span>{c.label}</span>
                          <b className="pas-num">
                            {nf(c.pcs)} pcs · {pctOf(c.pcs, catTotal)}%
                          </b>
                        </div>
                        <div className="tr">
                          <i
                            style={{
                              width: `${(c.pcs / catMax) * 100}%`,
                              background: c.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="text-[11.5px] text-[var(--pas-muted)] mt-3.5">
                      {cats.length} produk aktif dari {monthOrders.length} pesanan pada periode ini.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-4 min-w-0">
              <div className="grid sm:grid-cols-2 gap-4">
                {cats.map((c) => (
                  <div key={c.label} className="pas-card pas-kpi p-4">
                    <div className="flex items-center gap-2 text-[var(--pas-muted)] text-[12px] font-semibold">
                      <span
                        className="w-[11px] h-[11px] rounded-[3px] flex-none"
                        style={{ background: c.color }}
                      />
                      {c.label}
                    </div>
                    <p className="pas-display pas-num text-[26px] mt-1">
                      {nf(c.pcs)} <span className="text-[14px]">pcs</span>
                    </p>
                    <p className="text-[11.5px] text-[var(--pas-muted)] mt-0.5">
                      <b>{pctOf(c.pcs, catTotal)}%</b> dari total item
                    </p>
                  </div>
                ))}
              </div>

              <div className="pas-card p-[18px]">
                <p className="text-[13px] font-semibold text-ink mb-2">Rincian</p>
                <div className="overflow-x-auto">
                  <table className="pas-tbl pas-tbl-static">
                    <thead>
                      <tr>
                        <th>Produk</th>
                        <th className="num">Pcs</th>
                        <th className="num">% total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cats.length === 0 && (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", color: "var(--pas-muted)" }}>
                            Belum ada penjualan pada periode ini.
                          </td>
                        </tr>
                      )}
                      {cats.map((c) => (
                        <tr key={c.label}>
                          <td>{c.label}</td>
                          <td className="num pas-num">{nf(c.pcs)}</td>
                          <td className="num pas-num">{pctOf(c.pcs, catTotal)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kapasitas Produksi */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-semibold text-ink">Kapasitas Produksi</h2>
          </div>

          <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4 items-start">
            <div className="pas-card p-[18px]">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[13px] font-semibold text-ink">Kapasitas terpakai</p>
                <span className="text-[11px] text-[var(--pas-muted)]">{periode}</span>
              </div>

              <div className="pas-cap-big pas-num mt-3">
                <span>
                  <span className={isOver ? "pas-over" : ""}>{nf(totalPcs)}</span>{" "}
                  <small>/ {nf(capacity)} pcs</small>
                </span>
                <span className={`pas-pill ${capClass}`}>{capPct}%</span>
              </div>

              <div className={`pas-cap-track ${isOver ? "over" : isWarn ? "warn" : ""}`}>
                <i style={{ width: `${isOver ? 100 : Math.min(capPct, 100)}%` }} />
                {isOver && totalPcs > 0 && (
                  <span className="pas-cap-mark" style={{ left: `${(capacity / totalPcs) * 100}%` }} />
                )}
              </div>

              <div className="pas-cap-row">
                <span>0</span>
                {isOver ? (
                  <span>
                    Kelebihan: <b className="pas-over">+{nf(excess)} pcs</b>
                  </span>
                ) : (
                  <span>
                    Sisa: <b>{nf(capacity - totalPcs)} pcs</b>
                  </span>
                )}
                <span>{nf(capacity)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
                <div className="pas-legend-row">
                  Kapasitas/bulan
                  <b className="pas-num q">{nf(capacity)} pcs</b>
                </div>
                <div className="pas-legend-row">
                  Rata-rata pcs/order
                  <b className="pas-num q">
                    {totalOrders > 0 ? `${nf(Math.round(totalPcs / totalOrders))} pcs` : "–"}
                  </b>
                </div>
              </div>

              <p className="text-[11.5px] text-[var(--pas-muted)] mt-3">
                {isOver
                  ? `Garis emas = batas kapasitas (${nf(capacity)} pcs). Bar penuh karena beban melewati batas.`
                  : isWarn
                    ? "Sisa kapasitas menipis — pertimbangkan tahan order baru atau tambah shift."
                    : `Kapasitas masih longgar — sisa ${nf(capacity - totalPcs)} pcs untuk order baru bulan ini.`}
              </p>
            </div>

            <div className="pas-card p-[18px]">
              <p className="text-[13px] font-semibold text-ink mb-2">Detail</p>
              <table className="pas-tbl pas-tbl-static">
                <tbody>
                  <tr>
                    <td>Masuk/diproses bulan ini</td>
                    <td className="num">
                      <b className={isOver ? "pas-over" : ""}>{nf(totalPcs)} pcs</b>
                    </td>
                  </tr>
                  <tr>
                    <td>{isOver ? "Kelebihan beban" : "Sisa kapasitas"}</td>
                    <td className="num">
                      {isOver ? (
                        <b className="pas-over">+{nf(excess)} pcs</b>
                      ) : (
                        <b>{nf(capacity - totalPcs)} pcs</b>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td className="num">
                      <span className={`pas-pill ${capClass}`}>
                        {isOver ? "Over kapasitas" : isWarn ? "Hampir penuh" : "Aman"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[11px] text-[var(--pas-muted)] mt-3">
                Kapasitas per bulan diatur di halaman <b>Pengaturan</b> · default{" "}
                {nf(DEFAULT_KAPASITAS)} pcs
              </p>
            </div>
          </div>
        </div>

        {/* Chart + fase */}
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4">
          <div className="pas-card p-[18px]">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink">Order per Minggu</p>
              <span className="text-[10px] text-[var(--pas-muted)]">
                {weekTotal} pesanan · {periode}
              </span>
            </div>
            <p className="text-[11.5px] text-[var(--pas-muted)] mt-1.5">
              Jumlah <b>pesanan masuk</b> tiap minggu pada bulan terpilih (W1 = tanggal 1-7, dst).
            </p>
            <div className="flex gap-2.5 mt-4" style={{ height: 180 }}>
              {weeks.map((w) => (
                <div key={w.label} className="flex flex-col items-center" style={{ flex: 1, minWidth: 0 }}>
                  <span className="pas-num text-[12px] font-semibold" style={{ color: "var(--pas-ink-2)" }}>
                    {w.value}
                  </span>
                  <div className="relative w-full flex-1 min-h-0 mt-1.5">
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: `${Math.max((w.value / weekMax) * 100, 3)}%`,
                        background: "var(--pas-accent)",
                        opacity: w.value === weekMax ? 1 : 0.45,
                        borderRadius: "6px 6px 3px 3px",
                        transition: "height 0.3s ease",
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-[var(--pas-muted)] mt-2">{w.label}</span>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between gap-2 flex-wrap mt-3 pt-3 text-[11.5px] text-[var(--pas-muted)] font-semibold"
              style={{ borderTop: "1px solid var(--pas-line)" }}
            >
              <span>
                <span
                  className="inline-block w-[9px] h-[9px] rounded-[3px] mr-1.5"
                  style={{ background: "var(--pas-accent)" }}
                />
                Minggu tertinggi
              </span>
              <span>
                Rata-rata{" "}
                {weeks.length ? (weekTotal / weeks.length).toFixed(1).replace(".", ",") : "0"}{" "}
                pesanan/minggu
              </span>
            </div>
          </div>

          <div className="pas-card p-[18px] flex flex-col">
            <p className="text-[13px] font-semibold text-ink">Beban per Fase Produksi</p>
            <div className="flex-1 flex flex-col justify-between gap-[13px] mt-4">
              {byStage.map((b) => (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="text-[12.5px] w-[148px] text-[var(--pas-muted)] flex-none">
                    {b.name}
                  </span>
                  <span
                    className="pas-mini"
                    style={{ flex: 1, width: "auto", height: 8 }}
                  >
                    <i style={{ width: `${(b.n / max) * 100}%` }} />
                  </span>
                  <span className="pas-num text-[13px] w-6 text-right">{b.n}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--pas-muted)] mt-4 text-center">
              Jumlah pesanan aktif per fase (real-time)
            </p>
          </div>
        </div>

        <p className="text-[12px] text-[var(--pas-muted)] text-center">
          * Angka dihitung dari data order. Kapasitas produksi per bulan diatur di halaman Pengaturan.
        </p>
      </div>
    </div>
  );
}

"use client";

/**
 * Demo Customer — DISAMAKAN dengan ViewCustomer + CustomerPanel admin asli
 * (components/admin/PesananDashboard.tsx): 3 kartu ringkasan, tabel desktop
 * (pas-tbl) + kartu mobile, pengelompokan berdasarkan nomor HP ternormalisasi
 * (nama berbeda jadi alias), klik baris membuka drawer detail customer
 * (pas-sheet) dengan riwayat pesanan yang bisa dibuka ke DetailSheet.
 * Data tetap dummy in-memory (demo store) — tidak ada call ke API/Supabase.
 */
import { useMemo, useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { formatNumericDateID } from "@/lib/format-date";
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

const formatDate = (iso: string) => formatNumericDateID(iso) || "-";

/** Bentuk kanonik nomor HP — sama seperti normalizePhone admin asli. */
function normalizePhone(raw: string | null | undefined): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits.slice(2).replace(/^0+/, "");
  return digits.replace(/^0+/, "");
}

/** Rapikan spasi berlebih + buang spasi di ujung. */
function cleanName(name: string | null | undefined): string {
  return String(name ?? "").replace(/\s+/g, " ").trim();
}

/** Label pendek alias: teks setelah kurung pertama kalau ada. */
function aliasOf(name: string): string {
  const n = cleanName(name);
  const open = n.indexOf("(");
  const raw = open >= 0 ? n.slice(open + 1) : n;
  const cleaned = raw.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return n;
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

type DemoOrder = {
  id: number;
  kode: string;
  customer: string;
  phone?: string;
  produk: string;
  qty: number;
  tahapSelesai: number;
  mulai: string;
};

type CustomerGroup = {
  key: string;
  phone: string;
  displayName: string;
  aliases: string[];
  orders: DemoOrder[];
  aktif: number;
  totalPcs: number;
  lastOrderAt: string;
};

/** Pengelompokan customer — sama seperti groupCustomers admin asli. */
function groupCustomers(orders: DemoOrder[], total: number): CustomerGroup[] {
  const map = new Map<string, DemoOrder[]>();

  orders.forEach((o) => {
    const phone = normalizePhone(o.phone);
    const key = phone || `nama:${cleanName(o.customer).toLowerCase()}`;
    const list = map.get(key);
    if (list) list.push(o);
    else map.set(key, [o]);
  });

  const groups: CustomerGroup[] = [];
  map.forEach((list, key) => {
    const sorted = [...list].sort((a, b) => {
      const diff = new Date(b.mulai).getTime() - new Date(a.mulai).getTime();
      if (diff !== 0) return diff;
      return b.id - a.id;
    });

    const aliases: string[] = [];
    sorted.forEach((o) => {
      const a = aliasOf(o.customer);
      if (a && aliases.indexOf(a) < 0) aliases.push(a);
    });

    const pctOf = (o: DemoOrder) =>
      Math.min(100, Math.round(((o.tahapSelesai + 1) / total) * 100));

    groups.push({
      key,
      phone: cleanName(sorted[0].phone || ""),
      displayName: cleanName(sorted[0].customer) || "(tanpa nama)",
      aliases,
      orders: sorted,
      aktif: sorted.filter((o) => o.tahapSelesai < total).length,
      totalPcs: sorted.reduce((a, o) => a + o.qty, 0),
      lastOrderAt: sorted[0].mulai,
    });
  });

  return groups.sort((a, b) => {
    const diff = new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime();
    if (diff !== 0) return diff;
    return a.displayName.localeCompare(b.displayName);
  });
}

export default function DemoCustomer() {
  const s = useDemo();
  const total = s.tahapan.length;
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const groups = useMemo(() => groupCustomers(s.orders, total), [s.orders, total]);
  const aktifCount = groups.filter((g) => g.aktif > 0).length;
  const selected = groups.find((g) => g.key === selectedKey) ?? null;
  const detail = s.orders.find((o) => o.id === detailId) ?? null;

  return (
    <div>
      <PageHead kicker="Data" title="Customer" />
      <p className="text-[13.5px] text-[#64748B] mb-4">
        Satu baris = satu customer, digabung berdasarkan nomor HP. Nama berbeda yang ditulis di
        tiap pesanan tetap disimpan sebagai alias.
      </p>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="pas-card p-[18px]">
          <p className="text-[12px] text-[var(--pas-muted)] font-semibold">Total Customer</p>
          <p className="pas-display pas-num text-[26px] mt-1">{groups.length}</p>
          <p className="text-[11.5px] text-[var(--pas-muted)] mt-0.5">nomor HP unik</p>
        </div>
        <div className="pas-card p-[18px]">
          <p className="text-[12px] text-[var(--pas-muted)] font-semibold">Sedang Aktif</p>
          <p className="pas-display pas-num text-[26px] mt-1">{aktifCount}</p>
          <p className="text-[11.5px] text-[var(--pas-muted)] mt-0.5">punya pesanan berjalan</p>
        </div>
        <div className="pas-card p-[18px]">
          <p className="text-[12px] text-[var(--pas-muted)] font-semibold">Total Pesanan</p>
          <p className="pas-display pas-num text-[26px] mt-1">{s.orders.length}</p>
          <p className="text-[11.5px] text-[var(--pas-muted)] mt-0.5">seluruh periode</p>
        </div>
      </div>

      {/* tabel (desktop) */}
      <div className="pas-card p-2 sm:p-4 overflow-x-auto hidden md:block">
        <table className="pas-tbl">
          <thead>
            <tr>
              <th className="w-[36%]">Customer</th>
              <th className="w-[20%]">Nomor HP</th>
              <th className="num w-[13%]">Total Order</th>
              <th className="w-[14%]">Status</th>
              <th className="w-[17%]">Terakhir Order</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.key} onClick={() => setSelectedKey(g.key)}>
                <td>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="pas-avatar shrink-0">{initials(g.displayName)}</span>
                    <span className="min-w-0">
                      <span className="block truncate">{g.displayName}</span>
                      <span className="block text-[12px] text-[var(--pas-muted)] mt-0.5">
                        {g.aliases.length > 1
                          ? `${g.orders.length} pesanan · ${g.aliases.length} nama berbeda`
                          : `${g.orders.length} pesanan`}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="pas-num text-[var(--pas-muted)]">{g.phone || "-"}</td>
                <td className="num pas-num font-semibold">{g.orders.length}</td>
                <td>
                  {g.aktif ? (
                    <span className="pas-pill produksi">{g.aktif} aktif</span>
                  ) : (
                    <span className="pas-pill selesai">selesai</span>
                  )}
                </td>
                <td className="text-[var(--pas-muted)]">{formatDate(g.lastOrderAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {groups.length === 0 && (
          <p className="text-[13px] text-[var(--pas-muted)] px-3 py-6 text-center">
            Belum ada customer.
          </p>
        )}
      </div>

      {/* cards (mobile) */}
      <div className="flex flex-col gap-3 md:hidden">
        {groups.length === 0 && (
          <div className="pas-card p-[18px] text-center">
            <p className="text-[var(--pas-muted)] text-[14px] font-medium">Belum ada customer</p>
          </div>
        )}
        {groups.map((g) => (
          <div
            key={g.key}
            className="pas-card p-[18px] cursor-pointer"
            onClick={() => setSelectedKey(g.key)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="pas-avatar shrink-0">{initials(g.displayName)}</span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold truncate">{g.displayName}</p>
                  <p className="text-[12px] text-[var(--pas-muted)] pas-num truncate mt-0.5">
                    {g.phone || "-"}
                  </p>
                </div>
              </div>
              {g.aktif ? (
                <span className="pas-pill produksi shrink-0">{g.aktif} aktif</span>
              ) : (
                <span className="pas-pill selesai shrink-0">selesai</span>
              )}
            </div>

            <div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-[var(--pas-line)]">
              <div>
                <p className="text-[11px] text-[var(--pas-muted)] uppercase tracking-wider font-semibold">
                  Total Order
                </p>
                <p className="pas-display pas-num text-[20px] mt-0.5">{g.orders.length}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[var(--pas-muted)] uppercase tracking-wider font-semibold">
                  Terakhir
                </p>
                <p className="text-[12.5px] mt-0.5" style={{ color: "var(--pas-ink-2)" }}>
                  {formatDate(g.lastOrderAt)}
                </p>
              </div>
            </div>

            {g.aliases.length > 1 && (
              <p className="text-[11.5px] text-[var(--pas-muted)] mt-2.5">
                {g.aliases.length} nama: {g.aliases.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Drawer detail customer — sama seperti CustomerPanel admin asli */}
      {selected && (
        <div className="pas-sheet open">
          <div className="pas-veil" onClick={() => setSelectedKey(null)} />
          <div className="pas-panel p-0" style={{ display: "flex", flexDirection: "column" }}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-[18px] pb-4 border-b border-[var(--pas-line)]">
                <div className="flex items-start gap-3 pr-8">
                  <span className="pas-avatar text-[16px] w-11 h-11 flex items-center justify-center flex-none">
                    {initials(selected.displayName)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="pas-display text-[17px] truncate">{selected.displayName}</p>
                    <p className="text-[13px] text-[var(--pas-muted)] pas-num mt-0.5">
                      {selected.phone || "tanpa nomor HP"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="pas-btn-ghost px-3 py-2 text-sm shrink-0"
                    onClick={() => setSelectedKey(null)}
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mt-4">
                  <div className="pas-legend-row">
                    Order
                    <b className="pas-num q">{selected.orders.length}</b>
                  </div>
                  <div className="pas-legend-row">
                    PCS
                    <b className="pas-num q">{selected.totalPcs}</b>
                  </div>
                  <div className="pas-legend-row">
                    Aktif
                    <b className="pas-num q">{selected.aktif}</b>
                  </div>
                </div>

                {selected.aliases.length > 1 && (
                  <p className="text-[11.5px] text-[var(--pas-muted)] mt-3">
                    <b>{selected.orders.length} pesanan</b> — {selected.aliases.join(", ")}
                  </p>
                )}
              </div>

              {/* Riwayat pesanan */}
              <div className="flex-1 overflow-y-auto p-[18px] pt-4">
                <p className="text-[13px] font-semibold text-ink mb-3">Riwayat Pesanan</p>
                <div className="flex flex-col gap-2.5">
                  {selected.orders.map((o) => {
                    const st = statusOf(o.tahapSelesai, total);
                    const pct = Math.min(100, Math.round(((o.tahapSelesai + 1) / total) * 100));
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setDetailId(o.id)}
                        className="pas-card p-3.5 text-left w-full"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-[13.5px] pas-num">{o.kode}</p>
                            <p className="text-[12px] text-[var(--pas-muted)] mt-0.5 truncate">
                              {cleanName(o.customer) || "-"}
                            </p>
                          </div>
                          <span className={`pas-pill ${st} shrink-0`}>{FILTER_LABEL[st]}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-2.5">
                          <span className="text-[11.5px] text-[var(--pas-muted)]">
                            {formatDate(o.mulai)}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="pas-mini" style={{ width: 56 }}>
                              <i style={{ width: `${pct}%` }} />
                            </span>
                            <span className="text-[11.5px] text-[var(--pas-muted)] pas-num">{pct}%</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[var(--pas-muted)] mt-3">
                  Nama di setiap kartu adalah label yang tercatat pada pesanan aslinya.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail pesanan dari drawer customer */}
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

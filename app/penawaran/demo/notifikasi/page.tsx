"use client";

/**
 * Demo Notifikasi — DISAMAKAN dengan ViewNotif admin asli
 * (components/admin/PesananDashboard.tsx): intro eyebrow + heading besar,
 * hero gradient dengan switch + countdown WIB yang berjalan, 3 kartu statistik,
 * kartu pengaturan (jam kirim, hari reminder, nomor admin, Simpan/Edit/Test),
 * dan riwayat kirim (kartu mobile + tabel desktop). Semua data dummy
 * in-memory (demo store) — tidak ada call ke API/Supabase.
 */
import { useEffect, useMemo, useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { formatDayMonthID, formatTimeID } from "@/lib/format-date";
import { PageHead } from "@/components/penawaran/demo/ui";

/** Status chip — sama seperti NotifStatusChip admin asli. */
function NotifStatusChip({ status }: { status: string }) {
  const ok = status === "sent";
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] whitespace-nowrap"
      style={{ color: ok ? "var(--accent)" : "#04123F" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {ok ? (
          <path d="M20 6L9 17l-5-5" />
        ) : (
          <>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </>
        )}
      </svg>
      {ok ? "Sukses" : "Gagal"}
    </span>
  );
}

type LogRow = {
  id: number;
  status: string;
  created_at: string;
  order_number: string;
  diff_days: number;
  phone: string;
};

export default function DemoNotifikasi() {
  const s = useDemo();
  const total = s.tahapan.length;
  const [enabled, setEnabled] = useState(s.notifAktif);
  const [time, setTime] = useState("08:00");
  const [days, setDays] = useState("3,2,1");
  const [phone1, setPhone1] = useState("6281234567890");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [cdH, setCdH] = useState("00");
  const [cdM, setCdM] = useState("00");
  const [cdS, setCdS] = useState("00");
  const [cdLabel, setCdLabel] = useState("menghitung...");

  // Riwayat demo → bentuk log admin (status Terkirim = sent).
  const logs: LogRow[] = useMemo(
    () =>
      s.notifRiwayat.map((r, i) => ({
        id: i + 1,
        status: r.status === "Terkirim" ? "sent" : "failed",
        created_at: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
        order_number: r.kode,
        diff_days: r.hke,
        phone: phone1 || "6281234567890",
      })),
    [s.notifRiwayat, phone1]
  );

  const activePhones = [phone1, phone2, phone3].filter(Boolean);
  const activeDays = days.split(",").map((d) => d.trim()).filter(Boolean);
  const dayLabels: Record<string, string> = { "3": "H-3", "2": "H-2", "1": "H-1", "0": "Hari-H" };

  // Order yang sudah melewati deadline — angka sama dengan KPI Deadline di tab Pesanan.
  const overdueOrders = s.orders
    .filter((o) => o.tahapSelesai < total && o.deadline)
    .map((o) => ({ order: o, diffDays: Math.ceil((new Date(o.deadline).getTime() - Date.now()) / 86400000) }))
    .filter((x) => x.diffDays <= 0);
  const worstOverdue = overdueOrders.reduce<{ kode: string; days: number } | null>((worst, x) => {
    const days = Math.abs(x.diffDays);
    return !worst || days > worst.days ? { kode: x.order.kode, days } : worst;
  }, null);
  const hasOverdue = overdueOrders.length > 0;

  const deadlinesMonitored = s.orders.filter((o) => {
    if (!o.deadline || o.tahapSelesai >= total) return false;
    const diff = Math.ceil((new Date(o.deadline).getTime() - Date.now()) / 86400000);
    return diff >= 0 && diff <= Math.max(...activeDays.map(Number), 0);
  }).length;

  // Countdown WIB — logika sama seperti admin asli.
  useEffect(() => {
    let prev = "";
    function tick() {
      const now = new Date();
      const wibMs = now.getTime() + (now.getTimezoneOffset() + 420) * 60000;
      const wib = new Date(wibMs);
      const [cfgH, cfgM] = time.split(":").map(Number);
      const target = new Date(wib);
      target.setHours(cfgH, cfgM, 0, 0);
      if (target <= wib) target.setDate(target.getDate() + 1);
      const diffSec = Math.max(0, Math.floor((target.getTime() - wib.getTime()) / 1000));
      const hh = String(Math.floor(diffSec / 3600)).padStart(2, "0");
      const mm = String(Math.floor((diffSec % 3600) / 60)).padStart(2, "0");
      const ss = String(diffSec % 60).padStart(2, "0");
      const key = `${hh}:${mm}:${ss}`;
      if (key !== prev) { setCdH(hh); setCdM(mm); setCdS(ss); prev = key; }
      const sameDay = target.toDateString() === wib.toDateString();
      const jam = `${String(cfgH).padStart(2, "0")}:${String(cfgM).padStart(2, "0")}`;
      setCdLabel(`kirim ${sameDay ? "hari ini" : "besok"} pukul ${jam} WIB`);
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [time]);

  const toggleDay = (v: string) => {
    const next = activeDays.includes(v)
      ? activeDays.filter((d) => d !== v)
      : [...activeDays, v].sort((a, b) => Number(b) - Number(a));
    setDays(next.join(","));
  };

  const saveSettings = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setIsSaved(true);
      setDemo({ notifAktif: enabled });
      demoToast("Pengaturan tersimpan (mode demo)");
    }, 400);
  };

  const toggleEnabled = async () => {
    const next = !enabled;
    setEnabled(next);
    setDemo({ notifAktif: next });
    demoToast(next ? "Notifikasi diaktifkan (mode demo)" : "Notifikasi dimatikan (mode demo)");
  };

  const testNotif = async () => {
    if (activePhones.length === 0) { demoToast("Isi nomor HP admin terlebih dahulu"); return; }
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      const target = deadlinesMonitored;
      if (target === 0) demoToast("Tidak ada order yang mendekati deadline untuk dikirim");
      else demoToast(`Terkirim ke ${activePhones.length} nomor (mode demo)`);
      // Riwayat baru ikut muncul (in-memory).
      setDemo({
        notifRiwayat: [
          ...s.orders
            .filter((o) => {
              if (o.tahapSelesai >= total || !o.deadline) return false;
              const diff = Math.ceil((new Date(o.deadline).getTime() - Date.now()) / 86400000);
              return diff >= 0 && diff <= Math.max(...activeDays.map(Number), 0);
            })
            .map((o) => ({
              kode: o.kode,
              tahap: s.tahapan[Math.min(o.tahapSelesai + 1, total) - 1] || "-",
              hke: Math.max(0, Math.ceil((new Date(o.deadline).getTime() - Date.now()) / 86400000)),
              jam: `${time} WIB`,
              status: "Terkirim",
            })),
          ...s.notifRiwayat,
        ],
      });
    }, 600);
  };

  return (
    <div>
      <PageHead kicker="Data" title="Notifikasi" />
      {/* ── CSS VARS (cream design system) ── */}
      <style>{`
        .notif-wrap{--cream:#F3F4F6;--cream-2:#F3F4F6;--paper:#FFFFFF;--ink:#04123F;--ink-2:#374151;--ink-soft:#6B7280;--line:#E5E7EB;--line-2:#F3F4F6;--green:#04123F;--green-2:#0A1E5C;--accent:#04123F;--mint:#E8EEFB;--mint-line:#DCE4F2;--danger:#04123F;--danger-bg:#FFF8DC;--danger-line:#DCE4F2}
        .notif-wrap .n-card{background:var(--paper);border:1px solid var(--line);border-radius:22px;box-shadow:0 1px 1px rgba(4,18,63,.03),0 22px 44px -32px rgba(4,18,63,.28)}
        .notif-wrap .n-eyebrow{font-size:10.5px;text-transform:uppercase;letter-spacing:.2em;color:var(--ink-soft);font-family:var(--font-geist-mono),ui-monospace,monospace}
        .notif-wrap .n-hero{position:relative;overflow:hidden;border-radius:26px;background:linear-gradient(145deg,#0A1B45 0%,#7F1D1D 52%,#04123F 100%);box-shadow:0 30px 70px -40px rgba(4,18,63,.75),inset 0 1px 0 rgba(255,255,255,.1)}
        .notif-wrap .n-hero-glow{position:absolute;inset:auto -8% 40% auto;width:520px;height:520px;background:radial-gradient(circle,rgba(255,246,214),.20),transparent 62%);pointer-events:none}
        .notif-wrap .n-hero-grid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:100% 36px,36px 100%;mask-image:radial-gradient(120% 90% at 70% 0%,#000 25%,transparent 75%)}
        .notif-wrap .n-stat{border:1px solid var(--line);border-radius:18px;background:linear-gradient(180deg,#fff,#F9FAFB);padding:18px 18px 16px;transition:transform .22s ease,box-shadow .22s ease}
        .notif-wrap .n-stat:hover{transform:translateY(-2px);box-shadow:0 18px 34px -26px rgba(4,18,63,.32)}
        .notif-wrap .n-field{width:100%;background:#F9FAFB;border:1px solid var(--line);border-radius:14px;padding:22px 14px 9px;font-size:15px;color:var(--ink);transition:border-color .18s ease,box-shadow .18s ease,background .18s ease;font-family:var(--font-geist),system-ui,sans-serif}
        .notif-wrap .n-field:focus{outline:none;background:#fff;border-color:var(--accent);box-shadow:0 0 0 4px rgba(4,18,63,.16)}
        .notif-wrap .n-fw{position:relative}
        .notif-wrap .n-fw label{position:absolute;left:14px;top:8px;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);pointer-events:none;transition:color .18s ease;font-family:var(--font-geist-mono),ui-monospace,monospace}
        .notif-wrap .n-fw .n-field:focus + label{color:var(--accent)}
        .notif-wrap .n-chip{position:relative;border:1px solid var(--line);background:#F9FAFB;color:var(--ink-2);border-radius:12px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s cubic-bezier(.2,.85,.25,1);font-family:var(--font-geist-mono),ui-monospace,monospace}
        .notif-wrap .n-chip:hover{transform:translateY(-1px);border-color:#DCE2EA}
        .notif-wrap .n-chip.on{background:var(--green);border-color:var(--green);color:#F3F4F6;box-shadow:0 8px 18px -12px rgba(4,18,63,.7)}
        .notif-wrap .n-btn{border-radius:13px;font-size:14px;font-weight:600;transition:transform .16s ease,background .2s ease,box-shadow .2s ease;font-family:var(--font-geist),system-ui,sans-serif}
        .notif-wrap .n-btn-primary{background:var(--green);color:#F3F4F6;box-shadow:0 12px 26px -16px rgba(4,18,63,.85)}
        .notif-wrap .n-btn-primary:hover{background:var(--green-2);transform:translateY(-1px)}
        .notif-wrap .n-btn-ghost{background:#fff;color:var(--ink);border:1px solid var(--line);font-weight:500}
        .notif-wrap .n-btn-ghost:hover{background:var(--cream-2);border-color:#DCE2EA}
        .notif-wrap .n-divider{height:1px;background:linear-gradient(90deg,transparent,var(--line),transparent)}
        .notif-wrap .n-dt{position:relative;min-width:72px;padding:12px 4px 10px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(6px);text-align:center;overflow:hidden}
        .notif-wrap .n-dt::before{content:"";position:absolute;inset:0 0 auto 0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent)}
        .notif-wrap .n-dt b{display:block;font-family:var(--font-geist-mono),monospace;font-size:38px;line-height:1;font-weight:700;color:#fff;font-variant-numeric:tabular-nums}
        .notif-wrap .n-dt i{display:block;margin-top:7px;font-style:normal;font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.5)}
        .notif-wrap .n-colon{align-self:center;font-family:var(--font-geist-mono),monospace;font-size:26px;color:rgba(255,255,255,.3);padding-bottom:14px}
        .notif-wrap .n-pulse{width:7px;height:7px;border-radius:999px;background:#FFDD8F;box-shadow:0 0 0 0 rgba(255,229,0,.7);animation:npulse 2.2s infinite}
        @keyframes npulse{0%{box-shadow:0 0 0 0 rgba(255,229,0,.55)}70%{box-shadow:0 0 0 11px rgba(255,229,0,0)}100%{box-shadow:0 0 0 0 rgba(255,229,0,0)}}
        .notif-wrap .n-switch{width:50px;height:28px;border-radius:999px;background:rgba(255,255,255,.22);position:relative;cursor:pointer;flex:none;transition:background .24s ease;border:1px solid rgba(255,255,255,.2)}
        .notif-wrap .n-switch.on{background:#FEC40B;border-color:rgba(255,255,255,.35)}
        .notif-wrap .n-switch span{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:999px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.28);transition:transform .26s cubic-bezier(.2,.85,.25,1)}
        .notif-wrap .n-switch.on span{transform:translateX(22px)}
      `}</style>

      <div className="notif-wrap">
        {/* ── INTRO ── */}
        <div className="max-w-2xl">
          <span
            className="n-eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1"
            style={
              hasOverdue
                ? { background: "var(--danger-bg)", border: "1px solid var(--danger-line)", color: "var(--danger)" }
                : { background: "var(--mint)", border: "1px solid var(--mint-line)", color: "var(--green)" }
            }
          >
            {hasOverdue ? (
              <i style={{ display: "inline-block", width: 7, height: 7, borderRadius: 999, background: "var(--danger)" }} />
            ) : (
              <i className="n-pulse" />
            )}
            {hasOverdue ? "Perlu tindakan" : "Sistem berjalan"}
          </span>
          <h2 className="mt-5 text-[36px] leading-[1.04] sm:text-[50px]" style={{ fontFamily: 'var(--font-geist),system-ui,sans-serif', fontWeight: 600, letterSpacing: "-.038em", color: "var(--ink)" }}>
            {hasOverdue ? (
              <>{overdueOrders.length} deadline<br /><span style={{ color: "var(--danger)" }}>sudah terlewat.</span></>
            ) : (
              <>Tidak ada deadline<br /><span style={{ color: "var(--accent)" }}>yang terlewat.</span></>
            )}
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {hasOverdue && worstOverdue
              ? `Paling lama ${worstOverdue.days} hari — ${worstOverdue.kode}. Cek tab Pesanan untuk detailnya.`
              : "Sistem otomatis mengingatkan admin lewat WhatsApp sesuai jadwal produksi, mulai dari H-3, H-2, hingga H-1 sebelum deadline."}
          </p>
        </div>

        {/* ── HERO / COUNTDOWN ── */}
        <section className="n-hero mt-10 px-7 py-8 sm:px-10 sm:py-10">
          <div className="n-hero-glow" />
          <div className="n-hero-grid" />
          <div className="relative grid gap-9 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-start gap-4">
                <button className={`n-switch mt-0.5 ${enabled ? "on" : ""}`} onClick={toggleEnabled} disabled={saving} aria-label="Aktifkan notifikasi deadline"><span /></button>
                <div>
                  <p className="text-[20px] font-semibold text-white" style={{ fontFamily: 'var(--font-geist),system-ui,sans-serif' }}>Notifikasi Deadline</p>
                  <p className="mt-1.5 flex items-center gap-2 text-[13px]" style={{ color: "rgba(255,255,255,.7)" }}>
                    {enabled ? <><i className="n-pulse" /> Aktif - pengingat deadline berjalan otomatis</> : <><i style={{ display: "inline-block", width: 7, height: 7, borderRadius: 999, background: "rgba(255,255,255,.4)" }} /> Nonaktif - tidak ada pengiriman</>}
                  </p>
                </div>
              </div>
              <div className="mt-7 flex flex-wrap items-start gap-x-9 gap-y-4">
                <div>
                  <p className="n-eyebrow" style={{ color: "rgba(255,255,255,.5)" }}>Jadwal kirim</p>
                  <p className="mt-1 text-[13px] text-white" style={{ fontFamily: 'var(--font-geist-mono),monospace' }}>{time} WIB</p>
                </div>
                <div>
                  <p className="n-eyebrow" style={{ color: "rgba(255,255,255,.5)" }}>Penerima</p>
                  <p className="mt-1 text-[13px] text-white" style={{ fontFamily: 'var(--font-geist-mono),monospace' }}>{activePhones.length} admin</p>
                </div>
                <div>
                  <p className="n-eyebrow" style={{ color: "rgba(255,255,255,.5)" }}>Hari reminder</p>
                  <p className="mt-1 text-[13px] text-white" style={{ fontFamily: 'var(--font-geist-mono),monospace' }}>{activeDays.length ? activeDays.map((d) => dayLabels[d] || d).join(", ") : "belum dipilih"}</p>
                </div>
              </div>
            </div>
            <div className="lg:text-right">
              <p className="n-eyebrow mb-3" style={{ color: "rgba(255,255,255,.5)" }}>Notifikasi berikutnya</p>
              <div className="flex items-stretch gap-2">
                <div className="n-dt"><b>{cdH}</b><i>Jam</i></div>
                <div className="n-colon">:</div>
                <div className="n-dt"><b>{cdM}</b><i>Menit</i></div>
                <div className="n-colon">:</div>
                <div className="n-dt"><b>{cdS}</b><i>Detik</i></div>
              </div>
              <p className="mt-3.5 text-[12.5px]" style={{ fontFamily: 'var(--font-geist-mono),monospace', color: "#FFE9A3" }}>{cdLabel}</p>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="n-stat">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="n-eyebrow">Notifikasi terkirim</p>
                <p className="mt-1 text-[12px]" style={{ color: "var(--ink-soft)" }}>30 hari terakhir</p>
              </div>
              <span className="grid h-8 w-8 place-items-center rounded-[10px]" style={{ background: "var(--mint)", border: "1px solid var(--mint-line)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#04123F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              </span>
            </div>
            <p className="mt-4" style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: 27, fontWeight: 700, letterSpacing: "-.02em" }}>
              {logs.length} <span className="text-[13px] font-medium" style={{ color: "var(--ink-soft)" }}>pesan</span>
            </p>
            <p className="mt-2 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
              {logs.length === 0 ? "Belum ada pengingat yang dikirim ke admin." : `${logs.filter((l) => l.status === "sent").length} berhasil, ${logs.filter((l) => l.status !== "sent").length} gagal.`}
            </p>
          </div>
          <div className="n-stat">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="n-eyebrow">Deadline dipantau</p>
                <p className="mt-1 text-[12px]" style={{ color: "var(--ink-soft)" }}>masih berjalan</p>
              </div>
              <span className="grid h-8 w-8 place-items-center rounded-[10px]" style={{ background: "var(--mint)", border: "1px solid var(--mint-line)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#04123F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2.5" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>
              </span>
            </div>
            <p className="mt-4" style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: 27, fontWeight: 700, letterSpacing: "-.02em" }}>
              {deadlinesMonitored} <span className="text-[13px] font-medium" style={{ color: "var(--ink-soft)" }}>item</span>
            </p>
            <p className="mt-2 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
              {deadlinesMonitored === 0 ? "Belum ada deadline yang masuk sistem." : `${deadlinesMonitored} pesanan mendekati deadline.`}
            </p>
          </div>
          <div className="n-stat">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="n-eyebrow">Penerima pengingat</p>
                <p className="mt-1 text-[12px]" style={{ color: "var(--ink-soft)" }}>admin internal</p>
              </div>
              <span className="grid h-8 w-8 place-items-center rounded-[10px]" style={{ background: "var(--mint)", border: "1px solid var(--mint-line)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#04123F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></svg>
              </span>
            </div>
            <p className="mt-4" style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: 27, fontWeight: 700, letterSpacing: "-.02em" }}>
              {activePhones.length} <span className="text-[13px] font-medium" style={{ color: "var(--ink-soft)" }}>nomor</span>
            </p>
            <p className="mt-2 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
              {activeDays.length ? `Aktif di ${activeDays.length} tahap: ${activeDays.map((d) => dayLabels[d] || d).join(", ")}.` : "Belum ada nomor aktif."}
            </p>
          </div>
        </section>

        {/* ── SETTINGS ── */}
        <section className="n-card mt-6 p-7 sm:p-9" style={{ background: "linear-gradient(180deg,#fff,#F9FAFB)" }}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="n-eyebrow">Konfigurasi</p>
              <h3 className="mt-1.5 text-[19px] font-semibold" style={{ color: "var(--ink)" }}>Pengaturan pengiriman</h3>
            </div>
            <span className="rounded-full px-3 py-1 text-[11.5px]" style={{ fontFamily: 'var(--font-geist-mono),monospace', background: "var(--cream-2)", border: "1px solid var(--line-2)", color: "var(--ink-soft)" }}>Asia/Jakarta - WIB</span>
          </div>
          <div className="n-divider my-7" />
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="n-fw">
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={isSaved} className="n-field" style={{ fontFamily: 'var(--font-geist-mono),monospace', fontSize: 17 }} />
                <label>Jam kirim</label>
              </div>
              <p className="mt-2.5 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>Pengingat dikirim setiap hari pada jam ini.</p>
            </div>
            <div>
              <p className="n-eyebrow">Hari reminder</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {(["3", "2", "1", "0"] as const).map((v) => (
                  <button key={v} className={`n-chip ${activeDays.includes(v) ? "on" : ""}`} onClick={() => toggleDay(v)} disabled={isSaved}>
                    {dayLabels[v]}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>Pilih berapa hari sebelum deadline pengingat dikirim.</p>
            </div>
          </div>
          <div className="n-divider my-8" />
          <div>
            <div className="flex items-center justify-between">
              <p className="n-eyebrow">Nomor HP admin</p>
              <span className="text-[12px]" style={{ color: "var(--ink-soft)" }}>Format 62...</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="n-fw"><input className="n-field" style={{ fontFamily: 'var(--font-geist-mono),monospace' }} value={phone1} onChange={(e) => setPhone1(e.target.value)} disabled={isSaved} placeholder="6281234567890" /><label>Admin 1</label></div>
              <div className="n-fw"><input className="n-field" style={{ fontFamily: 'var(--font-geist-mono),monospace' }} value={phone2} onChange={(e) => setPhone2(e.target.value)} disabled={isSaved} placeholder="6280987654321" /><label>Admin 2</label></div>
              <div className="n-fw"><input className="n-field" style={{ fontFamily: 'var(--font-geist-mono),monospace' }} value={phone3} onChange={(e) => setPhone3(e.target.value)} disabled={isSaved} placeholder="628111222333" /><label>Admin 3</label></div>
            </div>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              className="n-btn n-btn-primary px-6 py-3.5 transition-all duration-200"
              disabled={saving}
              onClick={() => {
                if (isSaved) {
                  setIsSaved(false);
                } else {
                  saveSettings();
                }
              }}
            >
              {saving ? "Menyimpan..." : isSaved ? "Edit" : "Simpan pengaturan"}
            </button>
            <button className="n-btn n-btn-ghost px-6 py-3.5" disabled={!enabled || testing} onClick={testNotif}>
              {testing ? "Mengirim..." : "Test kirim sekarang"}
            </button>
            <span className="ml-auto text-[12px]" style={{ fontFamily: 'var(--font-geist-mono),monospace', color: "var(--ink-soft)" }}>
              {isSaved ? "✔ Pengaturan tersimpan" : "Belum disimpan"}
            </span>
          </div>
        </section>

        {/* ── HISTORY ── */}
        <section className="n-card mt-6 p-7 sm:p-9">
          <div className="flex items-center justify-between">
            <div>
              <p className="n-eyebrow">Log</p>
              <h3 className="mt-1.5 text-[19px] font-semibold" style={{ color: "var(--ink)" }}>Riwayat kirim</h3>
            </div>
            <span className="rounded-full px-3 py-1 text-[12px]" style={{ fontFamily: 'var(--font-geist-mono),monospace', background: "var(--mint)", border: "1px solid var(--mint-line)", color: "var(--green)" }}>{logs.length} entri</span>
          </div>
          <div className="n-divider my-7" />
          {logs.length === 0 ? (
            <div className="grid place-items-center py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "var(--cream-2)", border: "1px solid var(--line-2)" }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></svg>
              </div>
              <p className="mt-4 text-[15px] font-semibold" style={{ color: "var(--ink)" }}>Belum ada pengiriman</p>
              <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>Setelah notifikasi pertama terkirim, waktu, penerima, dan statusnya akan tercatat di sini.</p>
            </div>
          ) : (
            <>
              {/* Mobile: kartu — tabel 5 kolom tidak muat di layar sempit. */}
              <div className="flex flex-col gap-3 md:hidden">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl p-3.5"
                    style={{ background: "var(--cream-2)", border: "1px solid var(--line-2)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <NotifStatusChip status={log.status} />
                      <span className="text-[12px] whitespace-nowrap" style={{ color: "var(--ink-soft)" }}>
                        {formatDayMonthID(log.created_at)} {formatTimeID(log.created_at)}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <span
                        className="min-w-0 truncate text-[13px] font-semibold"
                        style={{ color: "var(--ink)", fontFamily: 'var(--font-geist-mono),monospace' }}
                      >
                        {log.order_number || "-"}
                      </span>
                      <span className="shrink-0 text-[12px]" style={{ color: "var(--ink-soft)" }}>
                        {log.diff_days === 0 ? "H-0" : `H-${log.diff_days}`}
                      </span>
                    </div>
                    <p
                      className="mt-1.5 text-[12px]"
                      style={{ color: "var(--ink-soft)", fontFamily: 'var(--font-geist-mono),monospace' }}
                    >
                      {log.phone}
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop: tabel */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                      <th className="pb-2 n-eyebrow">Status</th>
                      <th className="pb-2 n-eyebrow">Waktu</th>
                      <th className="pb-2 n-eyebrow">Order</th>
                      <th className="pb-2 n-eyebrow">Tipe</th>
                      <th className="pb-2 n-eyebrow">HP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b transition-colors" style={{ borderColor: "var(--line-2)" }}>
                        <td className="py-2.5">
                          <NotifStatusChip status={log.status} />
                        </td>
                        <td className="py-2.5 text-[13px]" style={{ color: "var(--ink-2)" }}>
                          {formatDayMonthID(log.created_at)}{" "}
                          {formatTimeID(log.created_at)}
                        </td>
                        <td className="py-2.5 text-[13px] font-semibold" style={{ color: "var(--ink)", fontFamily: 'var(--font-geist-mono),monospace' }}>{log.order_number || "-"}</td>
                        <td className="py-2.5 text-[12px]" style={{ color: "var(--ink-soft)" }}>
                          {log.diff_days === 0 ? "H-0" : `H-${log.diff_days}`}
                        </td>
                        <td className="py-2.5 text-[12px]" style={{ color: "var(--ink-soft)", fontFamily: 'var(--font-geist-mono),monospace' }}>{log.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <p className="mt-10 text-center text-[12px]" style={{ color: "var(--ink-soft)" }}>Notifikasi diteruskan via WhatsApp - zona waktu Asia/Jakarta</p>
      </div>
    </div>
  );
}

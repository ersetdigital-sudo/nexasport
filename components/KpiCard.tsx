"use client";

/**
 * Kartu KPI dashboard — dipakai bersama admin asli (PesananDashboard)
 * dan demo (app/penawaran/demo) supaya tampilannya selalu identik.
 * Desain modern: chip ikon di kanan, angka besar, badge delta, hover lift.
 */
export type KpiIcon = "total" | "produksi" | "deadline" | "selesai";

const ICONS: Record<KpiIcon, React.ReactNode> = {
  // Total Pesanan — clipboard dengan daftar item
  total: (
    <>
      <rect width="8" height="4" x="8" y="2" rx="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </>
  ),
  // Sedang Produksi — mesin pabrik
  produksi: (
    <>
      <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2V8l-7 5V8l-7 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2z" />
      <path d="M17 18h1M12 18h1M7 18h1" />
    </>
  ),
  // Deadline — jam alarm
  deadline: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M5 3 2 6m19-3 3 3" />
    </>
  ),
  // Selesai — centang lingkaran dengan panah
  selesai: (
    <>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </>
  ),
};

export default function KpiCard({
  icon,
  label,
  value,
  valueClass = "",
  badge,
  hero = false,
}: {
  icon: KpiIcon;
  label: string;
  value: React.ReactNode;
  /** kelas tambahan untuk warna angka (mis. deadline overdue merah) */
  valueClass?: string;
  badge?: React.ReactNode;
  /** kartu unggulan — gradient navy */
  hero?: boolean;
}) {
  return (
    <div className={`pas-card pas-kpi pas-bento-kpi p-4 sm:p-5${hero ? " pas-kpi-hero" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={hero ? "pas-kpi-label text-[13px]" : "text-[12.5px] text-[var(--pas-muted)]"}>{label}</p>
        <span className="pas-kpi-ic">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[icon]}
          </svg>
        </span>
      </div>
      {/* Mobile: badge di baris sendiri di bawah angka (tidak sesak); sm: sejajar */}
      <div className="mt-2.5 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:gap-x-2.5">
        <p
          className={`pas-display pas-num leading-none ${
            hero ? "text-[30px] sm:text-[34px]" : "text-[27px] sm:text-[30px]"
          }${valueClass ? ` ${valueClass}` : ""}`}
        >
          {value}
        </p>
        {badge}
      </div>
    </div>
  );
}

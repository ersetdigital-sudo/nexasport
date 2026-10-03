"use client";

/**
 * Kartu KPI dashboard — dipakai bersama admin asli (PesananDashboard)
 * dan demo (app/penawaran/demo) supaya tampilannya selalu identik.
 * Desain modern: chip ikon di kanan, angka besar, badge delta, hover lift.
 */
export type KpiIcon = "total" | "produksi" | "deadline" | "selesai";

const PATHS: Record<KpiIcon, string> = {
  total: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2m2-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4a1 1 0 011-1z",
  produksi: "M2 20h20M4 20V9.5l6 3.5V9.5l6 3.5V4h4v16",
  deadline: "M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  selesai: "M9 12.5l2.5 2.5L16 9.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
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
            <path d={PATHS[icon]} />
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

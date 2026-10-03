"use client";

/**
 * Input harga dengan format Rupiah otomatis: yang diketik hanya angka,
 * tampilannya langsung diformat ribuan (12.500) dengan awalan "Rp" tetap.
 * Nilai yang keluar selalu number (0 kalau kosong).
 */
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

const fmt = (digits: string) =>
  digits ? new Intl.NumberFormat("id-ID").format(Number(digits)) : "";

export default function RupiahInput({
  value,
  onValueChange,
  className = "",
  placeholder = "0",
  autoFocus = false,
  disabled = false,
  onBlur,
  onKeyDown,
}: {
  value: number;
  onValueChange: (nilai: number) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  onKeyDown?: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
}) {
  const [raw, setRaw] = useState(value ? String(Math.round(value)) : "");
  const focused = useRef(false);

  // Saat tidak sedang diketik, ikuti nilai dari luar (mis. setelah simpan).
  useEffect(() => {
    if (!focused.current) setRaw(value ? String(Math.round(value)) : "");
  }, [value]);

  return (
    <span
      className={
        "inline-flex items-center rounded-lg border border-[#E3E7EE] bg-white transition-colors focus-within:border-[#04123F] " +
        className
      }
    >
      <span className="shrink-0 select-none pl-2.5 text-[13px] opacity-50">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-1.5 py-1.5 text-right text-[13px] tabular-nums outline-none"
        value={fmt(raw)}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          setRaw(value ? String(Math.round(value)) : "");
          onBlur?.();
        }}
        onKeyDown={(e) => onKeyDown?.(e)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
          setRaw(digits);
          onValueChange(digits ? Number(digits) : 0);
        }}
      />
    </span>
  );
}

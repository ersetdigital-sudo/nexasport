"use client";

/**
 * Strip logo brand — konveksi/tim yang sudah pakai Nexa Sport.
 * Marquee berjalan otomatis, berhenti saat hover. Logos tampil grayscale
 * lalu berwarna penuh saat hover (logo putih ditampilkan di chip navy).
 */
const BRANDS: { src: string; alt: string; invert?: boolean }[] = [
  { src: "/brands/taff.png", alt: "TAFF Sportwear" },
  { src: "/brands/menara.png", alt: "Menara" },
  { src: "/brands/wp.png", alt: "WP" },
  { src: "/brands/tnt.png", alt: "TNT Sport Apparel", invert: true },
  { src: "/brands/white.png", alt: "Brand partner", invert: true },
];

export function BrandStrip() {
  const list = [...BRANDS, ...BRANDS];
  return (
    <section aria-label="Brand yang menggunakan Nexa Sport" className="border-y border-[#E5E7EB] bg-white py-8 sm:py-10">
      <p className="text-center text-[11.5px] font-bold uppercase tracking-[0.22em] text-[#8794AE]">
        Dipercaya oleh brand & komunitas
      </p>
      <div className="pas-brand-mask relative mt-6 overflow-hidden">
        <div className="pas-brand-marquee flex w-max items-center gap-4 pr-4 sm:gap-6 sm:pr-6">
          {list.map((b, i) => (
            <div
              key={`${b.alt}-${i}`}
              className={
                "flex h-16 w-40 shrink-0 items-center justify-center rounded-2xl border border-[#E5E7EB] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:h-20 sm:w-52 " +
                (b.invert ? "bg-[#04123F]" : "bg-white")
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.src}
                alt={b.alt}
                className={
                  "h-full w-full object-contain " +
                  (b.invert ? "" : "opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0")
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

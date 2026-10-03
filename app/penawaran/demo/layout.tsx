import type { Metadata } from "next";
import DemoShell from "@/components/penawaran/demo/Shell";

/**
 * Layout demo /penawaran/demo — publik (tanpa login), data 100% in-memory,
 * dan di-noindex supaya gak ikut keindeks mesin pencari.
 */
export const metadata: Metadata = {
  title: "Demo Nexa Sport — Dashboard Produksi",
  description: "Demo interaktif dashboard Nexa Sport dengan data contoh.",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoShell>{children}</DemoShell>;
}

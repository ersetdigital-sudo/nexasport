"use client";

/**
 * Demo Notifikasi Deadline — pengingat WhatsApp H-3/H-2/H-1 jam 08:00 WIB.
 * Countdown benar-benar berjalan mundur menuju 08:00 WIB berikutnya (UTC+7).
 */
import { useEffect, useState } from "react";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { PageHead, Kartu, BtnKuning, Modal } from "@/components/penawaran/demo/ui";
import { BubbleWA } from "@/components/penawaran/Mockups";

/** Sisa [jam, menit, detik] menuju 08:00 WIB berikutnya + apakah jatuh besok. */
function useCountdown() {
  const [sisa, setSisa] = useState<[number, number, number] | null>(null);
  const [besok, setBesok] = useState(true);

  useEffect(() => {
    const hitung = () => {
      const wib = new Date(Date.now() + 7 * 3_600_000);
      const t = new Date(wib);
      t.setUTCHours(8, 0, 0, 0);
      let besokBaru = true;
      if (t.getTime() <= wib.getTime()) t.setUTCDate(t.getUTCDate() + 1);
      else besokBaru = false;
      setBesok(besokBaru);
      const total = Math.max(0, Math.floor((t.getTime() - 7 * 3_600_000 - Date.now()) / 1_000));
      setSisa([Math.floor(total / 3_600), Math.floor((total % 3_600) / 60), total % 60]);
    };
    hitung();
    const id = setInterval(hitung, 1_000);
    return () => clearInterval(id);
  }, []);

  return { sisa, besok };
}

export default function DemoNotifikasi() {
  const s = useDemo();
  const { sisa, besok } = useCountdown();
  const [tesOpen, setTesOpen] = useState(false);

  const dipantau = s.orders.filter(
    (o) => !o.maklon && o.tahapSelesai < 11 && new Date(o.deadline).getTime() - Date.now() <= 3 * 86_400_000
  );
  const terkirim = s.notifRiwayat.filter((r) => r.status === "Terkirim").length;

  return (
    <div>
      <PageHead
        kicker="Data"
        title="Notifikasi"
        action={<BtnKuning onClick={() => setTesOpen(true)}>Kirim Tes Notifikasi</BtnKuning>}
      />

      <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-emerald-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Sistem Berjalan
      </p>
      <h2 className="text-[24px] font-extrabold tracking-tight text-[#04123F] sm:text-[30px]">
        Tidak ada deadline yang terlewat.
      </h2>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[#64748B]">
        Sistem otomatis mengingatkan admin lewat WhatsApp sesuai jadwal produksi, mulai dari H-3, H-2, hingga H-1 sebelum deadline.
      </p>

      {/* Kartu hero gradient */}
      <div
        className="mt-6 overflow-hidden rounded-2xl border border-[#04123F]/10"
        style={{ background: "linear-gradient(120deg, #04123F 0%, #23134A 55%, #5C1220 100%)" }}
      >
        <div
          className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          <div>
            {/* Toggle */}
            <button
              type="button"
              onClick={() => {
                setDemo({ notifAktif: !s.notifAktif });
                demoToast(s.notifAktif ? "Notifikasi dimatikan" : "Notifikasi diaktifkan");
              }}
              className="flex items-center gap-3"
            >
              <span
                className={`relative h-7 w-12 rounded-full transition-colors ${s.notifAktif ? "bg-[#FEC40B]" : "bg-white/20"}`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${s.notifAktif ? "left-6" : "left-1"}`}
                />
              </span>
              <span className="text-[15px] font-bold text-white">Notifikasi Deadline</span>
            </button>
            <p className="mt-2 text-[12.5px] text-white/65">
              {s.notifAktif ? "Aktif — pengingat deadline berjalan otomatis" : "Nonaktif — pengingat sementara dimatikan"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[["08:00 WIB", "Jadwal kirim"], ["1 admin", "Penerima"], ["H-3 · H-2 · H-1", "Reminder"]].map(([v, l]) => (
                <div key={l} className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2">
                  <p className="text-[13px] font-bold text-white">{v}</p>
                  <p className="text-[10px] uppercase tracking-wide text-white/50">{l}</p>
                </div>
              ))}
            </div>
            {/* Countdown */}
            <div className="mt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Notifikasi berikutnya</p>
              <div className="mt-2.5 flex items-center gap-2">
                {[["JAM", sisa?.[0]], ["MENIT", sisa?.[1]], ["DETIK", sisa?.[2]]].map(([label, val]) => (
                  <div key={label as string} className="min-w-[64px] rounded-xl border border-white/15 bg-black/25 px-3 py-2.5 text-center">
                    <p className="text-[20px] font-extrabold tabular-nums text-white">
                      {val == null ? "--" : String(val).padStart(2, "0")}
                    </p>
                    <p className="text-[9px] font-bold tracking-widest text-white/50">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11.5px] text-white/55">kirim {besok ? "besok" : "hari ini"} pukul 08:00 WIB</p>
            </div>
          </div>

          {/* Mockup bubble WA */}
          <div className="rounded-2xl bg-[#111B21] p-4">
            <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#25D366]/20 text-[11px] font-bold text-[#25D366]">NS</span>
              <div>
                <p className="text-[12px] font-bold text-white">Nexa Sport — Deadline</p>
                <p className="text-[10px] text-white/40">online</p>
              </div>
            </div>
            <BubbleWA
              pesan={
                "PENGINGAT DEADLINE H-3\n" +
                "Order NS-2410 — TNT Sport\n" +
                "Produk: Jersey Setelan (36 pcs)\n" +
                "Tahap saat ini: Jahit / Sewing\n" +
                "Deadline: 3 hari lagi\n" +
                "Mohon pantau progresnya hari ini."
              }
            />
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          [String(terkirim), "Notifikasi Terkirim", "30 hari terakhir · 4 berhasil, 0 gagal"],
          [String(dipantau.length), "Deadline Dipantau", dipantau.length ? `${dipantau.map((o) => o.kode).join(", ")} mendekati deadline` : "Tidak ada pesanan mepet"],
          ["H-3, H-2, H-1", "Penerima Pengingat", "Aktif di 3 tahap sebelum deadline"],
        ].map(([angka, judul, ket]) => (
          <Kartu key={judul} className="p-5">
            <p className="text-[26px] font-extrabold text-[#04123F]">{angka}</p>
            <p className="mt-1 text-[13px] font-bold text-[#04123F]">{judul}</p>
            <p className="mt-1 text-[11.5px] text-[#94A3B8]">{ket}</p>
          </Kartu>
        ))}
      </div>

      {/* Riwayat pesan */}
      <Kartu className="mt-5">
        <div className="border-b border-[#E9EDF2] px-5 py-3.5">
          <h3 className="text-[14px] font-bold text-[#04123F]">Riwayat Pesan WhatsApp</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-wide text-[#94A3B8]">
                {["Order", "Tahap", "Reminder", "Jam Kirim", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.notifRiwayat.map((r, i) => (
                <tr key={i} className={i % 2 ? "bg-[#FAFBFC]" : ""}>
                  <td className="px-5 py-2.5 font-bold text-[#04123F]">{r.kode}</td>
                  <td className="px-5 py-2.5 text-[#475569]">{r.tahap}</td>
                  <td className="px-5 py-2.5 tabular-nums">H-{r.hke}</td>
                  <td className="px-5 py-2.5 tabular-nums text-[#475569]">{r.jam}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${r.status === "Terkirim" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>

      {/* Preview kirim tes */}
      <Modal open={tesOpen} onClose={() => setTesOpen(false)} title="Preview Notifikasi Tes">
        <p className="mb-3 text-[12.5px] text-[#64748B]">
          Ini contoh pesan yang dikirim WhatsApp ke penanggung jawab produksi (mode demo — tidak benar-benar terkirim).
        </p>
        <BubbleWA
          pesan={
            "PENGINGAT DEADLINE H-2\n" +
            "Order NS-2410 — TNT Sport\n" +
            "Tahap saat ini: Jahit / Sewing\n" +
            "Sisa 2 hari sebelum deadline."
          }
        />
        <div className="mt-4">
          <BtnKuning onClick={() => { setTesOpen(false); demoToast("Notifikasi tes terkirim (mode demo)"); }}>Kirim Tes</BtnKuning>
        </div>
      </Modal>
    </div>
  );
}

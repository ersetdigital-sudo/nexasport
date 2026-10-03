"use client";

/**
 * EditSheet Maklon (demo) — salinan UI dari EditSheet di
 * components/admin/MaklonDashboard.tsx: form edit nama, HP, multi-baris
 * produk, Bahan, Ukuran, foto Preview Design & WO, tanggal order/deadline.
 *
 * Bedanya dengan admin: perubahan disimpan in-memory ke demo-store (setDemo),
 * bukan ke Supabase. Upload foto tetap sungguhan via Cloudinary (folder demo).
 */
import { useEffect, useState } from "react";
import type { Order } from "@/lib/demo-seed";
import { setDemo, useDemo, demoToast } from "@/lib/demo-store";
import { DEFAULT_PRODUCTS } from "@/lib/product-options";
import { Modal } from "@/components/penawaran/demo/ui";
import { FotoUpload } from "@/components/penawaran/demo/FotoUpload";
import { uploadToCloudinary, optimizeImageUrl, DEMO_UPLOAD_FOLDER } from "@/lib/cloudinary";

export default function EditSheet({
  open,
  order,
  onClose,
}: {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}) {
  const s = useDemo();
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    material: "",
    sizes: "",
    deadline: "",
    created: "",
  });
  const [productOptions, setProductOptions] = useState<string[]>([...DEFAULT_PRODUCTS]);
  const [productRows, setProductRows] = useState<{ product: string; custom: boolean; qty: string }[]>([{ product: "", custom: false, qty: "" }]);
  const [designPhotos, setDesignPhotos] = useState<string[]>([]);
  const [woPhotos, setWoPhotos] = useState<string[]>([]);
  const [designUpload, setDesignUpload] = useState(false);
  const [woUpload, setWoUpload] = useState(false);
  const [error, setError] = useState("");

  // Isi ulang form setiap kali sheet dibuka untuk order lain.
  useEffect(() => {
    if (!open || !order) return;
    setForm({
      customer: order.customer || "",
      phone: order.phone || "",
      material: order.material || "",
      sizes: order.sizes || "",
      deadline: order.deadline || "",
      created: order.mulai || "",
    });
    const used = order.produk.split(",").map((p) => p.trim()).filter(Boolean);
    setProductOptions((opts) => {
      const uniq = Array.from(new Set([...opts, ...used]));
      return uniq.length ? uniq : [...DEFAULT_PRODUCTS];
    });
    // Baris produk diisi dari nama produk lama + qty totalnya.
    const qtyNum = String(order.qty || "").replace(/\D/g, "");
    setProductRows(used.map((name) => ({ product: name, custom: false, qty: qtyNum })));
    setDesignPhotos(order.designPhotos || []);
    setWoPhotos(order.woPhotos || []);
    setError("");
  }, [open, order]);

  const totalQty = productRows.reduce((acc, p) => acc + (parseInt(p.qty, 10) || 0), 0);

  const updateProductRow = (rowIdx: number, patch: Partial<{ product: string; custom: boolean; qty: string }>) =>
    setProductRows((rows) => rows.map((r, i) => (i === rowIdx ? { ...r, ...patch } : r)));

  const uploadDemoFoto = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (fn: (ps: string[]) => string[]) => void,
    setUploading: (v: boolean) => void
  ) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const result = await uploadToCloudinary(file, { folder: DEMO_UPLOAD_FOLDER });
        setter((ps) => [...ps, optimizeImageUrl(result.url)]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const simpan = () => {
    const validRows = productRows.filter((p) => p.product.trim() && p.qty.trim());
    if (!form.customer.trim() || !form.phone.trim() || validRows.length === 0) {
      setError("Isi nama, HP, dan minimal 1 produk dengan jumlahnya.");
      return;
    }
    const names = validRows.map((p) => p.product.trim());
    const qty = validRows.reduce((a, p) => a + (parseInt(p.qty, 10) || 0), 0);
    setDemo({
      orders: s.orders.map((o) =>
        o.id === order?.id
          ? {
              ...o,
              customer: form.customer.trim(),
              phone: form.phone.trim(),
              produk: names.join(", "),
              qty,
              material: form.material.trim() || undefined,
              sizes: form.sizes.trim() || undefined,
              designPhotos,
              woPhotos,
              deadline: form.deadline || o.deadline,
              mulai: form.created || o.mulai,
              total: qty * 95_000,
            }
          : o
      ),
    });
    onClose();
    demoToast("Data maklon diperbarui (mode demo)");
  };

  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} kicker="Edit Maklon" title={order.kode}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          simpan();
        }}
        className="flex flex-col gap-4"
      >
        <label className="block">
          <span className="text-[13px] text-[#64748B]">Nama Customer</span>
          <input
            required
            value={form.customer}
            onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
            placeholder="Nama"
            className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
          />
        </label>
        <label className="block">
          <span className="text-[13px] text-[#64748B]">Nomor HP</span>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="0812xxxxxxx"
            className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
          />
        </label>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#64748B]">Produk</span>
            {totalQty > 0 && (
              <span className="text-[12px] font-semibold text-[#04123F]">
                Total: {totalQty} pcs
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-col gap-3">
            {productRows.map((pRow, pi) => (
              <div key={pi} className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                {pRow.custom ? (
                  <input
                    autoFocus
                    className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-[#04123F]"
                    placeholder="Nama produk custom"
                    value={pRow.product}
                    onChange={(e) => updateProductRow(pi, { product: e.target.value })}
                  />
                ) : (
                  <select
                    className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-[15px] outline-none"
                    value={pRow.product}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") updateProductRow(pi, { custom: true, product: "" });
                      else updateProductRow(pi, { product: e.target.value });
                    }}
                  >
                    <option value="" disabled>Pilih produk...</option>
                    {productOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="__custom__">+ Tambah sendiri...</option>
                  </select>
                )}
                <input
                  className="w-[84px] rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-[15px] outline-none focus:border-[#04123F]"
                  placeholder="Qty"
                  inputMode="numeric"
                  value={pRow.qty}
                  onChange={(e) => updateProductRow(pi, { qty: e.target.value })}
                />
                {pRow.custom && (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg px-2.5 py-2 text-[12px] font-semibold text-[#64748B] transition hover:bg-[#E2E8F0]"
                    title="Kembali ke daftar pilihan"
                    onClick={() => updateProductRow(pi, { custom: false, product: "" })}
                  >
                    List
                  </button>
                )}
                {productRows.length > 1 && (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg p-2 text-[#94A3B8] transition hover:bg-red-400/10 hover:text-red-400"
                    title="Hapus produk ini"
                    onClick={() => setProductRows((rows) => rows.filter((_, idx) => idx !== pi))}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-xl border border-[#E2E8F0] py-2.5 text-[13px] font-semibold text-[#475569] transition hover:bg-[#F1F5F9]"
            onClick={() => setProductRows((rows) => [...rows, { product: "", custom: false, qty: "" }])}
          >
            + Tambah Produk
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[13px] text-[#64748B]">Bahan</span>
            <input
              value={form.material}
              onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
              placeholder="Dryfit Serena"
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="text-[13px] text-[#64748B]">Ukuran</span>
            <input
              value={form.sizes}
              onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
              placeholder="M(20), L(20)"
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FotoUpload
            label="Preview Design"
            fotos={designPhotos}
            alt="Design"
            uploading={designUpload}
            onPick={(e) => uploadDemoFoto(e, setDesignPhotos, setDesignUpload)}
            onRemove={(i) => setDesignPhotos((ps) => ps.filter((_, idx) => idx !== i))}
          />
          <FotoUpload
            label="WO"
            catatan="Admin only"
            fotos={woPhotos}
            alt="WO"
            uploading={woUpload}
            onPick={(e) => uploadDemoFoto(e, setWoPhotos, setWoUpload)}
            onRemove={(i) => setWoPhotos((ps) => ps.filter((_, idx) => idx !== i))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[13px] text-[#64748B]">Tanggal Order</span>
            <input
              type="date"
              value={form.created}
              onChange={(e) => setForm((f) => ({ ...f, created: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="text-[13px] text-[#64748B]">Tanggal Deadline</span>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[16px] outline-none focus:border-[#04123F] focus:bg-white"
            />
          </label>
        </div>

        {error && <p className="text-[13px] font-semibold text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-xl border border-[#E2E8F0] py-3.5 text-[13.5px] font-semibold text-[#475569] transition hover:bg-[#F1F5F9]"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#FEC40B] py-3.5 text-[15px] font-bold text-[#04123F] shadow-[0_4px_12px_rgba(254,196,11,0.35)] transition hover:brightness-105"
          >
            Simpan Maklon
          </button>
        </div>
      </form>
    </Modal>
  );
}

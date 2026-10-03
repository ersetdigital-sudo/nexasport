import AdminSkeleton from "@/components/admin/AdminSkeleton";

/**
 * Suspense fallback rute `/pesanan/hpp`.
 *
 * Navigasi antar-halaman dashboard (bukan ganti tab), jadi datanya dibaca
 * server lebih dulu — lihat catatan yang sama di app/pesanan/maklon/loading.tsx.
 */
export default function PesananHppLoading() {
  return <AdminSkeleton />;
}

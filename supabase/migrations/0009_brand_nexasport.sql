-- ============================================================================
-- Nexa Sport — 0009 identitas toko
-- ============================================================================
-- Baris `brand` (id = 1) dibaca langsung halaman publik — beranda, `/track`,
-- `/status`, `/status/maklon` (lewat `lib/queries.ts` → `getBrand()`) — untuk
-- nama toko, monogram, tagline, deskripsi, dan logo.
--
-- 0003 sudah menanam nilai Nexa Sport, jadi migrasi ini cuma memastikan kolom
-- identitasnya benar (nama, monogram, path logo) di database yang barisnya
-- terlanjur berisi nilai lain — mis. database hasil impor dari sistem lama.
--
-- Migrasi ini SENGAJA tidak mengubah `whatsapp_number`, `tagline`, dan
-- `app_settings`: nomor WhatsApp dan jam operasional dikelola dari menu
-- Pengaturan admin (`/api/admin/profil-toko`), jadi menimpanya di sini akan
-- menghapus nilai yang sudah disetel operator.
--
-- Aman dijalankan berulang.
-- ============================================================================

update public.brand
set name        = 'Nexa Sport',
    monogram    = 'NSP',
    logo_path   = '/logo-nexa-sport.png',
    updated_at  = now()
where id = 1;

-- Kalau baris `brand` belum ada sama sekali (database yang belum menjalankan 0003),
-- buat barisnya supaya halaman publik tidak jatuh ke nilai cadangan di lib/data.ts.
insert into public.brand (id, name, monogram, tagline, description, whatsapp_number, logo_path)
values (
  1,
  'Nexa Sport',
  'NSP',
  E'Tempat Bikin Jersey Futsal Custom.\nDesain bebas, harga pabrik, kirim se-Indonesia.',
  'Nexa Sport — tempat bikin jersey futsal custom full printing. Desain bebas, harga mulai 85rb, kirim se-Indonesia. Konsultasi gratis via WhatsApp.',
  '628115491117',
  '/logo-nexa-sport.png'
)
on conflict (id) do nothing;

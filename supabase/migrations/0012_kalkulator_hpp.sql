-- ============================================================================
-- Nexa Sport — 0012 kalkulator HPP
-- ============================================================================
-- Tujuan: memindahkan "DATABASE HPP" dari Excel kalkulator jersey ke database,
-- supaya halaman Kalkulator HPP di dashboard membaca harga yang sama dengan
-- toko, dan harganya bisa diedit tanpa mengubah kode.
--
-- Struktur datanya meniru sheet "Kalkulator HPP" di Excel:
--   kategori (Kain, Print/Press, Jahit Atasan, ..., Operasional)
--   item     (Kain Atasan, Rib Collar, ...)  → pasangan SUMIFS pertama
--   variasi  (Basic, Premium, Pro, Woven, ...) → pasangan SUMIFS kedua
--   harga    → hasil SUMIFS (kolom E), satuan pcs/set
--
-- Dua baris tambahan yang di Excel ditulis manual di kalkulator (DTF Rp5.000
-- dan Biaya Tak Terduga Rp5.000) ikut ditanam di sini, jadi logika "selalu
-- ditambahkan" tidak dibuang.
--
-- Aman dijalankan berulang (idempotent). TIDAK menyentuh tabel lain: pesanan,
-- maklon, tahap produksi, dan pengaturan tetap apa adanya.
-- ============================================================================

create table if not exists nexa_sport.hpp_items (
  id         bigint generated always as identity primary key,
  kategori   text not null,
  item       text not null,
  variasi    text not null,
  harga      numeric not null check (harga >= 0),
  satuan     text not null default 'pcs',
  urutan     int not null,
  updated_at timestamptz not null default now(),
  unique (item, variasi)
);

-- RLS aktif TANPA policy: anon/authenticated otomatis ditolak (konsisten dengan
-- penutupan akses anon tabel operasional), sedangkan service role yang dipakai
-- endpoint dashboard melewati RLS. Baca akses dikelola lewat cookie admin.
alter table nexa_sport.hpp_items enable row level security;

-- ---------------------------------------------------------------------------
-- Seed — 28 baris database HPP + 2 baris biaya tetap dari Excel.
-- on conflict: harga di-refresh supaya menjalankan file ini berulang tetap
-- menghasilkan data yang sama dengan Excel, tanpa mengganti id (urutan id
-- stabil untuk referensi manual di dashboard).
-- ---------------------------------------------------------------------------
insert into nexa_sport.hpp_items (kategori, item, variasi, harga, satuan, urutan) values
  ('Kain',           'Kain Atasan',       'Basic',             18750, 'pcs',   1),
  ('Kain',           'Kain Celana',       'Basic',             15000, 'pcs',   2),
  ('Kain',           'Kain Atasan',       'Premium',           21250, 'pcs',   3),
  ('Kain',           'Kain Celana',       'Premium',           17000, 'pcs',   4),
  ('Kain',           'Kain Atasan',       'Pro',               23750, 'pcs',   5),
  ('Kain',           'Kain Celana',       'Pro',               19000, 'pcs',   6),
  ('Print/Press',    'Print Atasan',      'Atasan',            25000, 'pcs',   7),
  ('Print/Press',    'Print Celana',      'Celana',            15000, 'pcs',   8),
  ('Jahit Atasan',   'Jahit Atasan',      'Basic',              9000, 'pcs',   9),
  ('Jahit Atasan',   'Jahit Atasan',      'Premium',           11000, 'pcs',  10),
  ('Jahit Atasan',   'Jahit Atasan',      'Pro',               13000, 'pcs',  11),
  ('Jahit Celana',   'Jahit Celana',      'Basic',              5000, 'pcs',  12),
  ('Jahit Celana',   'Jahit Celana',      'Premium',            5500, 'pcs',  13),
  ('Jahit Celana',   'Jahit Celana',      'Pro',                6000, 'pcs',  14),
  ('Logo',           'Logo',              'Woven',              6000, 'pcs',  15),
  ('Logo',           'Logo',              'Tatami',            10000, 'pcs',  16),
  ('Logo',           'Logo',              '3D UV',             15000, 'pcs',  17),
  ('Logo',           'Logo',              '3D Rubber',         19000, 'pcs',  18),
  ('Collar',         'Rib Collar',        'Polly',              6000, 'pcs',  19),
  ('Collar',         'Rib Collar',        'Kasmilon',           8000, 'pcs',  20),
  ('Collar',         'Rib Collar',        'Jaquard',           15000, 'pcs',  21),
  ('Cuff',           'Rib Cuff',          'Polly',              8000, 'set',  22),
  ('Cuff',           'Rib Cuff',          'Kasmilon',          12000, 'set',  23),
  ('Cuff',           'Rib Cuff',          'Jaquard',           15000, 'set',  24),
  ('Namset',         'Namset',            'DTF',                8000, 'set',  25),
  ('Namset',         'Namset',            'Poliflek',          25000, 'set',  26),
  ('Namset',         'Namset',            'Printable',         50000, 'set',  27),
  ('Operasional',    'Biaya Tak Terduga', 'Biaya Tak Terduga',  5000, 'set',  28),
  ('DTF',            'DTF',               'DTF',                5000, 'pcs',  29)
on conflict (item, variasi) do update
  set harga = excluded.harga, kategori = excluded.kategori, satuan = excluded.satuan, urutan = excluded.urutan;

-- ---------------------------------------------------------------------------
-- VERIFIKASI — jalankan terpisah kalau mau memastikan:
--   select count(*) from nexa_sport.hpp_items;                          -- 29
--   select item, variasi, harga from nexa_sport.hpp_items order by urutan;
-- ---------------------------------------------------------------------------

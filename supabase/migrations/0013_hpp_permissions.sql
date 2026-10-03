-- Perbaikan izin tabel HPP yang sudah dibuat oleh migrasi 0012.
-- Tidak mengubah harga, seed, pesanan, atau maklon; aman dijalankan ulang.
-- Akses anon/authenticated tetap ditolak oleh RLS.
grant usage on schema nexa_sport to service_role;
grant select, update on nexa_sport.hpp_items to service_role;

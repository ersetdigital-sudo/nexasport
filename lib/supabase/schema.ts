/**
 * Schema Postgres yang dipakai aplikasi Nexa Sport.
 *
 * Aplikasi ini berbagi database Supabase dengan Rabona, tetapi seluruh tabel
 * operasionalnya hidup di schema `nexa_sport` (lihat migrasi
 * 0011_schema_nexa_sport.sql) — jadi pesanan, pengaturan, dan identitas toko
 * benar-benar terpisah dari schema `public` milik Rabona.
 *
 * Semua factory client Supabase (server, browser, dan route yang membuat client
 * sendiri) WAJIB memakai nilai ini sebagai `db.schema`, supaya `.from()` dan
 * `.rpc()` otomatis menunjuk ke schema yang benar.
 *
 * Bisa ditimpa lewat env NEXT_PUBLIC_DB_SCHEMA kalau suatu saat perlu.
 */
export const DB_SCHEMA = process.env.NEXT_PUBLIC_DB_SCHEMA || "nexa_sport";

/**
 * Tipe client Supabase yang dipakai aplikasi.
 *
 * Client-nya menunjuk schema `nexa_sport` (bukan `public`), sedangkan tipe
 * default `SupabaseClient` dari supabase-js mengunci parameter schema ke
 * `"public"`. Alias ini melonggarkan generic-nya supaya client bisa dioper ke
 * fungsi yang menerima `SupabaseClient` tanpa error tipe.
 */
export type Db = import("@supabase/supabase-js").SupabaseClient<any, any, any>;

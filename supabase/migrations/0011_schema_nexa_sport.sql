-- ============================================================================
-- Nexa Sport — 0011 schema terpisah `nexa_sport`
-- ============================================================================
-- Tujuan: aplikasi Nexa Sport memakai database Supabase yang SAMA dengan Rabona,
-- tetapi datanya benar-benar terpisah. Caranya: seluruh tabel operasional
-- ditaruh di schema `nexa_sport`, bukan `public`.
--
-- Kenapa schema terpisah (bukan kolom `brand_key`):
--   * App Rabona (yang sudah berjalan di schema `public`) TIDAK tersentuh sama
--     sekali — tidak ada risiko dashboard produksi ikut melihat pesanan Nexa.
--   * Tidak ada satu pun query aplikasi Nexa yang perlu diubah; client cukup
--     diarahkan ke schema ini (lihat lib/supabase/server.ts → DB_SCHEMA).
--
-- CARA KERJA
--   1. Jalankan file ini di SQL editor Supabase (atau `supabase db push`).
--   2. Buka Dashboard → Project Settings → API → "Exposed schemas", lalu
--      TAMBAHKAN `nexa_sport` (tanpa langkah ini, PostgREST mengembalikan
--      error "schema nexa_sport not found"). Simpan, tunggu schema cache reload.
--   3. Pastikan env aplikasi Nexa berisi NEXT_PUBLIC_DB_SCHEMA=nexa_sport
--      (default di kode juga sudah `nexa_sport`, jadi env ini opsional).
--
-- Aman dijalankan berulang (idempotent). TIDAK menyentuh schema `public`:
-- Rabona, pesanan lamanya, dan konfigurasinya tetap apa adanya.
-- ============================================================================

create schema if not exists nexa_sport;

grant usage on schema nexa_sport to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Tabel — disalin dari struktur `public` (LIKE ... INCLUDING ALL meniru kolom,
-- default, CHECK/UNIQUE/PK, dan index; foreign key TIDAK ikut tersalin, jadi
-- ditambahkan manual di bawah supaya mengarah ke tabel di schema ini sendiri).
-- ----------------------------------------------------------------------------
create table if not exists nexa_sport.brand                (like public.brand                including all);
create table if not exists nexa_sport.app_settings         (like public.app_settings         including all);
create table if not exists nexa_sport.orders               (like public.orders               including all);
create table if not exists nexa_sport.production_steps     (like public.production_steps     including all);
create table if not exists nexa_sport.notification_logs    (like public.notification_logs    including all);
create table if not exists nexa_sport.order_status_history (like public.order_status_history including all);
create table if not exists nexa_sport.stage_notification_logs (like public.stage_notification_logs including all);
create table if not exists nexa_sport.maklon_orders        (like public.maklon_orders        including all);
create table if not exists nexa_sport.maklon_steps         (like public.maklon_steps         including all);
create table if not exists nexa_sport.maklon_status_history (like public.maklon_status_history including all);
create table if not exists nexa_sport.maklon_notification_logs (like public.maklon_notification_logs including all);

-- Foreign key (arahnya ke tabel di schema nexa_sport, bukan public).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'nexa_osh_order_fk') then
    alter table nexa_sport.order_status_history
      add constraint nexa_osh_order_fk
      foreign key (order_id) references nexa_sport.orders(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'nexa_snl_order_fk') then
    alter table nexa_sport.stage_notification_logs
      add constraint nexa_snl_order_fk
      foreign key (order_id) references nexa_sport.orders(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'nexa_nl_order_fk') then
    alter table nexa_sport.notification_logs
      add constraint nexa_nl_order_fk
      foreign key (order_id) references nexa_sport.orders(id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'nexa_msh_order_fk') then
    alter table nexa_sport.maklon_status_history
      add constraint nexa_msh_order_fk
      foreign key (order_id) references nexa_sport.maklon_orders(id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'nexa_mnl_order_fk') then
    alter table nexa_sport.maklon_notification_logs
      add constraint nexa_mnl_order_fk
      foreign key (order_id) references nexa_sport.maklon_orders(id) on delete cascade;
  end if;
end $$;

-- updated_at otomatis untuk identitas toko (memakai fungsi dari schema public).
drop trigger if exists brand_touch_updated_at on nexa_sport.brand;
create trigger brand_touch_updated_at
  before update on nexa_sport.brand
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Akses
-- ----------------------------------------------------------------------------
-- Semua akses operasional lewat service role (sama seperti schema public).
grant all on all tables in schema nexa_sport to service_role;

-- Halaman publik (tanpa login) hanya butuh nama toko + nomor WA + nama tahap.
-- Grant dibuat sempit dengan sengaja: tabel pesanan TIDAK boleh dibaca anon.
grant select on nexa_sport.brand            to anon, authenticated;
grant select on nexa_sport.production_steps to anon, authenticated;
grant select on nexa_sport.maklon_steps     to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Fungsi (RPC) — sama seperti 0002, tetapi menunjuk tabel di schema ini.
-- SECURITY DEFINER + search_path = nexa_sport, dan hanya service role yang
-- boleh mengeksekusi (anon key ada di bundle browser).
-- ----------------------------------------------------------------------------
create or replace function nexa_sport.get_app_setting_value(p_key text)
returns text language sql security definer set search_path = nexa_sport as $$
  select value from app_settings where key = p_key;
$$;

create or replace function nexa_sport.set_app_setting(p_key text, p_value text)
returns void language plpgsql security definer set search_path = nexa_sport as $$
begin
  if p_key <> 'fonnte_token' then
    raise exception 'key not allowed';
  end if;

  insert into app_settings (key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now();
end;
$$;

create or replace function nexa_sport.claim_stage_notification(p_order_id uuid, p_stage integer)
returns uuid language plpgsql security definer set search_path = nexa_sport as $$
declare v_id uuid;
begin
  if p_stage not between 1 and 11 then
    raise exception 'stage must be between 1 and 11';
  end if;

  insert into stage_notification_logs (order_id, stage, status)
  values (p_order_id, p_stage, 'pending')
  returning id into v_id;

  return v_id;
exception when unique_violation then
  return null;
end;
$$;

create or replace function nexa_sport.finish_stage_notification(p_id uuid, p_status text, p_response jsonb default null)
returns void language sql security definer set search_path = nexa_sport as $$
  update stage_notification_logs
  set status = p_status, response_payload = p_response
  where id = p_id;
$$;

create or replace function nexa_sport.mark_last_notified_stage(p_order_id uuid, p_stage integer)
returns void language sql security definer set search_path = nexa_sport as $$
  update orders set last_notified_stage = p_stage where id = p_order_id;
$$;

create or replace function nexa_sport.claim_maklon_stage_notification(p_order_id uuid, p_stage integer)
returns uuid language plpgsql security definer set search_path = nexa_sport as $$
declare v_id uuid;
begin
  if p_stage not between 1 and 6 then
    raise exception 'stage must be between 1 and 6';
  end if;

  insert into maklon_notification_logs (order_id, stage, status)
  values (p_order_id, p_stage, 'pending')
  returning id into v_id;

  return v_id;
exception when unique_violation then
  return null;
end;
$$;

create or replace function nexa_sport.finish_maklon_stage_notification(p_id uuid, p_status text, p_response jsonb default null)
returns void language sql security definer set search_path = nexa_sport as $$
  update maklon_notification_logs
  set status = p_status, response_payload = p_response
  where id = p_id;
$$;

create or replace function nexa_sport.mark_maklon_last_notified_stage(p_order_id uuid, p_stage integer)
returns void language sql security definer set search_path = nexa_sport as $$
  update maklon_orders set last_notified_stage = p_stage where id = p_order_id;
$$;

-- Cabut EXECUTE default (PUBLIC) lalu berikan hanya ke service role.
do $$
declare
  fn text;
  signatures text[] := array[
    'nexa_sport.get_app_setting_value(text)',
    'nexa_sport.set_app_setting(text, text)',
    'nexa_sport.claim_stage_notification(uuid, integer)',
    'nexa_sport.finish_stage_notification(uuid, text, jsonb)',
    'nexa_sport.mark_last_notified_stage(uuid, integer)',
    'nexa_sport.claim_maklon_stage_notification(uuid, integer)',
    'nexa_sport.finish_maklon_stage_notification(uuid, text, jsonb)',
    'nexa_sport.mark_maklon_last_notified_stage(uuid, integer)'
  ];
begin
  foreach fn in array signatures loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Seed identitas toko & daftar tahap (setara 0003/0006 untuk schema ini)
-- ----------------------------------------------------------------------------
insert into nexa_sport.brand (id, name, monogram, tagline, description, whatsapp_number, logo_path)
values (
  1,
  'Nexa Sport',
  'NSP',
  E'Pabrik Jersey Custom Full Printing.\nDesain bebas, harga pabrik, kirim se-Indonesia.',
  'Nexa Sport — pabrik jersey custom full printing. Desain bebas, harga mulai 85rb, kirim se-Indonesia. Konsultasi gratis via WhatsApp.',
  -- PLACEHOLDER. Ganti lewat menu Pengaturan → Profil Toko tanpa deploy ulang.
  '628117777403',
  '/logo-nexa-sport.png'
)
on conflict (id) do nothing;

insert into nexa_sport.production_steps (name, position) values
  ('Desain',                      1),
  ('Layout',                      2),
  ('Profing Warna',               3),
  ('Cetak / Print',               4),
  ('Press / Transfer Sublime',    5),
  ('Potong Pola / Cutting Panel', 6),
  ('Jahit / Sewing',              7),
  ('Finishing',                   8),
  ('Quality Control',             9),
  ('Packing',                    10),
  ('Kirim',                      11)
on conflict (position) do update set name = excluded.name;

insert into nexa_sport.maklon_steps (name, position) values
  ('Layout',        1),
  ('Profing Warna', 2),
  ('Cutting Bahan', 3),
  ('Press Sublime', 4),
  ('QC',            5),
  ('Kirim',         6)
on conflict (position) do update set name = excluded.name;

-- VERIFIKASI (jalankan manual):
--   select nspname from pg_namespace where nspname = 'nexa_sport';
--   select count(*) from nexa_sport.production_steps;  -- harus 11
--   select name, whatsapp_number from nexa_sport.brand; -- harus Nexa Sport

-- Sheet "DAFTAR KAIN" dari Excel — nama kain per grup beserta harga per kg
-- dan hasil jadi per pcs (atasan 4 pcs, celana 5 pcs). Dibuat via Management
-- API pada project remote; file ini cerminannya supaya bisa diulang di
-- project lain. Aman dijalankan ulang (idempotent untuk struktur dan seed).
create table if not exists nexa_sport.kain_fabrics (
  id bigserial primary key,
  grup text not null,
  nama text not null,
  harga_per_kg numeric not null,
  harga_atasan numeric,
  harga_celana numeric,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table nexa_sport.kain_fabrics enable row level security;
grant usage on schema nexa_sport to service_role;
grant select, update on nexa_sport.kain_fabrics to service_role;

-- Seed data (idempotent: skip kalau kombinasi grup+nama sudah ada).
insert into nexa_sport.kain_fabrics (grup, nama, harga_per_kg, harga_atasan, harga_celana, position)
select * from (values
  ('Kain Basic','JARUM',75000::numeric,18750::numeric,15000::numeric,1),
  ('Kain Basic','MILANO',75000::numeric,18750::numeric,15000::numeric,2),
  ('Kain Basic','SMASH',75000::numeric,18750::numeric,15000::numeric,3),
  ('Kain Basic','RHABIT',75000::numeric,18750::numeric,15000::numeric,4),
  ('Kain Premium','PUMA',85000::numeric,21250::numeric,17000::numeric,5),
  ('Kain Premium','AIRWALK',85000::numeric,21250::numeric,17000::numeric,6),
  ('Kain Premium','EMBOSS',85000::numeric,21250::numeric,17000::numeric,7),
  ('Kain Premium','RHABIT',85000::numeric,21250::numeric,17000::numeric,8),
  ('Kain Premium','DROPNIDLE',85000::numeric,null::numeric,null::numeric,9),
  ('Kain Pro','JAQUARD',95000::numeric,23750::numeric,19000::numeric,10),
  ('Kain Pro','UV',95000::numeric,23750::numeric,19000::numeric,11)
) as seed(grup, nama, harga_per_kg, harga_atasan, harga_celana, position)
where not exists (
  select 1 from nexa_sport.kain_fabrics k
  where k.grup = seed.grup and k.nama = seed.nama
);

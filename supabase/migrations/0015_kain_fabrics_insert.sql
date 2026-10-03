-- Tab Daftar Kain bisa menambah jenis kain baru dari dashboard, jadi
-- service_role butuh INSERT (sebelumnya hanya SELECT/UPDATE dari 0014).
grant insert on nexa_sport.kain_fabrics to service_role;
grant usage on sequence nexa_sport.kain_fabrics_id_seq to service_role;

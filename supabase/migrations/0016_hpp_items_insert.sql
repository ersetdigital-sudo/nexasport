-- Tab Database HPP bisa menambah item baru dari dashboard, jadi
-- service_role butuh INSERT (sebelumnya hanya SELECT/UPDATE dari 0013).
grant insert on nexa_sport.hpp_items to service_role;
grant usage on sequence nexa_sport.hpp_items_id_seq to service_role;

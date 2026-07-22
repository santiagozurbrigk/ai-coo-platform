-- Eliminar sistema de importación de Excel/CSV
-- Las columnas import_batch_id, import_source en closing_calls se mantienen
-- porque podrían ser útiles para futuras trazabilidades, pero la tabla
-- import_batches y todo su sistema se elimina.

drop table if exists public.import_finance_rows cascade;
drop table if exists public.import_batches cascade;

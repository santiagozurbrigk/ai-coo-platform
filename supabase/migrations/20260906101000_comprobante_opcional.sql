-- El comprobante deja de ser obligatorio.
--
-- Viene de un feedback de los testers, y el caso es real: un depósito de
-- Binance se registra cuando entra la plata, y el comprobante aparece después
-- —o no aparece nunca—. Exigirlo obligaba a mentir (subir cualquier archivo) o
-- a no registrar el cobro, y las dos son peores que un pago sin comprobante.
--
-- La columna se afloja en la base, pero la UI **sigue mostrando cuáles no lo
-- tienen**: eso es información operativa, no un detalle estético.
alter table public.client_payments
  alter column storage_path drop not null;

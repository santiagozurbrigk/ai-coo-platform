-- El interruptor de «el bot puede escribir en el servidor».
--
-- ⭐ El problema que resuelve. El bot habla en exactamente dos momentos: saluda
-- cuando se crea un canal que coincide con el patrón, y contesta `!vincular`.
-- No había forma de apagarlo. Quien quería un bot que sólo escuchara tenía que
-- maniobrar: no usar el patrón automático y agregar los canales a mano — una
-- receta, no una opción, y un canal `cliente-juan` creado sin pensar rompía el
-- silencio igual.
--
-- ⭐ Default `true` a propósito. La columna aparece en servidores que ya están
-- funcionando: cualquier otro default les cambiaría el comportamiento sin que
-- nadie lo haya pedido. Quien quiera silencio lo apaga; el resto no se entera
-- de que esto existe.
alter table public.discord_integrations
  add column if not exists bot_can_speak boolean not null default true;

comment on column public.discord_integrations.bot_can_speak is
  'false = modo silencioso: el bot lee y registra, pero no escribe en el servidor. '
  'No afecta la lectura de canales ni ninguna señal derivada.';

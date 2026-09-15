-- 1 · Aviso por proximidad en los campos de fecha.
--
-- ⭐ Nace de un pedido concreto: "quiero anotar cuándo es el próximo
-- lanzamiento de cada cliente y que se ponga en rojo cuando falten menos de
-- 15 días".
--
-- La tentación era agregar una columna `proximo_lanzamiento` a `clients`. Se
-- descartó: eso le sirve **a una sola organización** —la que vende consultoría
-- de lanzamientos— y sería ruido en la ficha de todos los clientes de todas las
-- demás. Un producto multi-organización no puede hornear el vocabulario de un
-- cliente en el esquema.
--
-- Los campos configurables ya permiten una fecha por cliente. Lo único que
-- faltaba era el aviso. Con esto, quien vende lanzamientos define "Próximo
-- lanzamiento · avisar a 15 días" y quien vende otra cosa define "Vence el
-- contrato · avisar a 30". Mismo mecanismo, cada uno su vocabulario.
--
-- Nulo = sin aviso, que es el comportamiento de siempre.
alter table public.field_definitions
  add column if not exists alert_days_before integer
    check (alert_days_before is null or (alert_days_before > 0 and alert_days_before <= 365));

comment on column public.field_definitions.alert_days_before is
  'Sólo para field_type = date: a cuántos días de distancia la fecha se muestra en alerta. Nulo = sin aviso.';

-- 2 · Nivel de satisfacción del cliente.
--
-- ⭐ Van tres columnas y no una a propósito.
--
-- Un cliente marcado como "muy conforme" hace cuatro meses no dice nada sobre
-- hoy, y sin la fecha nadie se entera de que el dato envejeció: se lee como si
-- fuera actual. El autor importa por lo mismo — una impresión tiene dueño.
--
-- Se guarda texto y no un número para que el valor se explique solo al leerlo
-- en la base, y el orden queda en el código (ver lib/clients/satisfaction.ts).
alter table public.clients
  add column if not exists satisfaction text
    check (satisfaction is null or satisfaction in ('en_riesgo', 'disconforme', 'neutral', 'conforme', 'muy_conforme')),
  add column if not exists satisfaction_updated_at timestamptz,
  add column if not exists satisfaction_updated_by uuid references public.profiles(id) on delete set null;

-- Los permisos pasan de 21 submódulos a 13 módulos.
--
-- ⭐ Esto no es un cambio de pantalla: los roles ya creados tienen las claves
-- viejas guardadas. Si sólo se cambiara la interfaz, cada rol **perdería esos
-- permisos en silencio** —el mapeo descarta lo que no reconoce— y alguien
-- dejaría de poder entrar a Marketing sin que nadie viera un error.
--
-- La consolidación toma el nivel **más alto** de los hijos: quien tenía acceso
-- total a "Marketing → Contenido" queda con acceso total a Marketing. Perder
-- permisos en una migración es peor que ganarlos: ganarlos se nota al revisar,
-- perderlos se nota cuando alguien no puede trabajar.
--
-- El código además traduce las claves viejas al leer (ver
-- `constants/permission-modules.ts`), así que el orden entre deploy y migración
-- no importa.

do $$
declare
  fila record;
  nuevos jsonb;
  clave text;
  valor text;
  destino text;
  actual text;
  rango constant jsonb := '{"none":0,"view":1,"full":2}'::jsonb;
  mapa constant jsonb := '{
    "sales_inbox":"sales",
    "sales_metrics":"sales",
    "closing":"sales",
    "marketing_content":"marketing",
    "marketing_sales":"marketing",
    "marketing_forms":"marketing",
    "operations_overview":"operations",
    "operations_sops":"operations",
    "operations_team_inputs":"operations",
    "expenses":"finance"
  }'::jsonb;
begin
  for fila in select id, permissions from public.team_roles where permissions is not null loop
    nuevos := '{}'::jsonb;

    for clave, valor in select * from jsonb_each_text(fila.permissions) loop
      -- La clave vieja se traduce; la nueva se queda como está.
      destino := coalesce(mapa ->> clave, clave);
      actual := nuevos ->> destino;

      if actual is null
         or (rango ->> valor)::int > (rango ->> actual)::int then
        nuevos := nuevos || jsonb_build_object(destino, valor);
      end if;
    end loop;

    update public.team_roles set permissions = nuevos where id = fila.id;
  end loop;
end $$;

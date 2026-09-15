-- Varios responsables por tarea.
--
-- ⭐ Hasta ahora una tarea tenía un solo responsable, así que cuando algo lo
-- hacían dos personas había que duplicar la tarjeta. Dos tarjetas que son una
-- sola tarea: una se marca terminada, la otra queda viva, y el tablero miente.
--
-- Se elige un arreglo y no una tabla aparte a propósito: los responsables de
-- una tarea son dos o tres, se leen siempre junto con la tarea y nunca se
-- consultan por su cuenta. Una tabla de relación acá agregaría un join a cada
-- lectura del tablero sin comprar nada.
--
-- `assignee_id` se mantiene y se sigue escribiendo con el primero de la lista:
-- los reportes de tiempo y los filtros que ya existen lo usan, y romperlos para
-- estrenar la columna nueva sería cambiar un problema por otro.
alter table public.workboard_tasks
  add column if not exists assignee_ids uuid[] not null default '{}';

-- Las tareas que ya tenían responsable arrancan con él en la lista.
update public.workboard_tasks
   set assignee_ids = array[assignee_id]
 where assignee_id is not null
   and assignee_ids = '{}';

-- ⭐ Quién la dio por terminada.
--
-- Con varios responsables, cualquiera puede cerrarla — es la decisión tomada:
-- exigir que la marquen todos suena prolijo pero deja tareas colgadas porque
-- siempre falta uno. El precio es que hay que poder responder "¿quién la
-- cerró?", y para eso hacen falta estas dos columnas.
alter table public.workboard_tasks
  add column if not exists completed_by uuid references public.profiles(id) on delete set null,
  add column if not exists completed_at timestamptz;

create index if not exists workboard_tasks_assignee_ids_idx
  on public.workboard_tasks using gin (assignee_ids);

-- Fix: ampliar el CHECK constraint de agent_messages.action_type para incluir 'graph_proposals'.
-- El constraint fue creado inline (sin nombre explícito) en 20260522100000_agent_module.sql,
-- por lo que Postgres le asignó el nombre automático agent_messages_action_type_check.
-- Usamos un bloque DO para detectar el nombre real desde el catálogo y borrarlo de forma segura.

DO $$
DECLARE
  v_constraint_name text;
BEGIN
  SELECT conname
    INTO v_constraint_name
    FROM pg_constraint
   WHERE conrelid = 'public.agent_messages'::regclass
     AND contype  = 'c'
     AND pg_get_constraintdef(oid) LIKE '%action_type%'
   LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format(
      'ALTER TABLE public.agent_messages DROP CONSTRAINT %I',
      v_constraint_name
    );
  END IF;
END $$;

ALTER TABLE public.agent_messages
  ADD CONSTRAINT agent_messages_action_type_check CHECK (
    action_type IS NULL
    OR action_type IN ('created_sop', 'created_document', 'graph_proposals')
  );

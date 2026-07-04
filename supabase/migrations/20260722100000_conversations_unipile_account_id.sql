-- Vincular conversaciones Unipile a la cuenta que las creó/sincronizó

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS unipile_account_id TEXT;

CREATE INDEX IF NOT EXISTS conversations_unipile_account_id_idx
  ON public.conversations (organization_id, unipile_account_id)
  WHERE unipile_account_id IS NOT NULL;

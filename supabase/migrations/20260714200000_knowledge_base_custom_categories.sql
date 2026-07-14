-- Custom categories for the knowledge base.
-- Drop the fixed CHECK constraint on business_context_documents.category
-- so that custom org-specific slugs can be stored.

ALTER TABLE public.business_context_documents
  DROP CONSTRAINT IF EXISTS business_context_documents_category_check;

-- Table to store custom categories per org.
-- Built-in categories (meetings, frameworks, training, sales, operations)
-- are never stored here — they are hard-coded in the app constants.
CREATE TABLE IF NOT EXISTS public.knowledge_base_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, slug)
);

ALTER TABLE public.knowledge_base_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own org knowledge base categories"
  ON public.knowledge_base_categories
  FOR ALL
  USING  (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE INDEX IF NOT EXISTS knowledge_base_categories_org_idx
  ON public.knowledge_base_categories(organization_id, created_at);

-- Defense-in-depth: WITH CHECK explícito en policies UPDATE con organization_id.
-- Antes dependían del default de Postgres (reutilizar USING), que es frágil ante cambios futuros.
--
-- Tablas actualizadas (auditoría de migraciones RLS previas):
--   clients, payment_platforms, fixed_expenses, subscriptions, team_compensation,
--   closing_calls, conversations, onboarding_responses, organizations,
--   agent_projects, business_stages, agent_conversations, sops, sop_versions,
--   content_assets, workboard_tasks, sprints, team_roles, team_invitations,
--   launches, launch_metrics, customer_avatars, products, value_ladder,
--   sales_frameworks, rag_documents, rag_chunks
--
-- Ya tenían WITH CHECK explícito (no tocadas): utm_links, weekly_inputs, weekly_reports,
-- sales_scripts, call_analyses, profiles (Users update own profile / Founders update org profiles).

-- ─── clients ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users update org clients" ON public.clients;
CREATE POLICY "Users update org clients"
  ON public.clients FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- ─── finance ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users update org payment platforms" ON public.payment_platforms;
CREATE POLICY "Users update org payment platforms"
  ON public.payment_platforms FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org fixed expenses" ON public.fixed_expenses;
CREATE POLICY "Users update org fixed expenses"
  ON public.fixed_expenses FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org subscriptions" ON public.subscriptions;
CREATE POLICY "Users update org subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org team compensation" ON public.team_compensation;
CREATE POLICY "Users update org team compensation"
  ON public.team_compensation FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- ─── sales / onboarding ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users update org closing calls" ON public.closing_calls;
CREATE POLICY "Users update org closing calls"
  ON public.closing_calls FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org conversations" ON public.conversations;
CREATE POLICY "Users update org conversations"
  ON public.conversations FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org onboarding" ON public.onboarding_responses;
CREATE POLICY "Users update org onboarding"
  ON public.onboarding_responses FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update own org" ON public.organizations;
CREATE POLICY "Users update own org"
  ON public.organizations FOR UPDATE
  USING (id = public.get_my_organization_id())
  WITH CHECK (id = public.get_my_organization_id());

-- ─── agent ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users update org agent_projects" ON public.agent_projects;
CREATE POLICY "Users update org agent_projects"
  ON public.agent_projects FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org business_stages" ON public.business_stages;
CREATE POLICY "Users update org business_stages"
  ON public.business_stages FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org agent_conversations" ON public.agent_conversations;
CREATE POLICY "Users update org agent_conversations"
  ON public.agent_conversations FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- ─── SOPs ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users update org sops" ON public.sops;
CREATE POLICY "Users update org sops"
  ON public.sops FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org sop_versions" ON public.sop_versions;
CREATE POLICY "Users update org sop_versions"
  ON public.sop_versions FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- ─── marketing / workboard ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users update org content assets label" ON public.content_assets;
CREATE POLICY "Users update org content assets label"
  ON public.content_assets FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members update workboard_tasks" ON public.workboard_tasks;
CREATE POLICY "Org members update workboard_tasks"
  ON public.workboard_tasks FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members update sprints" ON public.sprints;
CREATE POLICY "Org members update sprints"
  ON public.sprints FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- ─── team ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users update org team_roles" ON public.team_roles;
CREATE POLICY "Users update org team_roles"
  ON public.team_roles FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org team_invitations" ON public.team_invitations;
CREATE POLICY "Users update org team_invitations"
  ON public.team_invitations FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- ─── launches ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Org members update launches" ON public.launches;
CREATE POLICY "Org members update launches"
  ON public.launches FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members update launch_metrics" ON public.launch_metrics;
CREATE POLICY "Org members update launch_metrics"
  ON public.launch_metrics FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- ─── product ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users update org customer_avatars" ON public.customer_avatars;
CREATE POLICY "Users update org customer_avatars"
  ON public.customer_avatars FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org products" ON public.products;
CREATE POLICY "Users update org products"
  ON public.products FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org value_ladder" ON public.value_ladder;
CREATE POLICY "Users update org value_ladder"
  ON public.value_ladder FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org sales_frameworks" ON public.sales_frameworks;
CREATE POLICY "Users update org sales_frameworks"
  ON public.sales_frameworks FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- ─── RAG ────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS rag_documents_update ON public.rag_documents;
CREATE POLICY rag_documents_update ON public.rag_documents
  FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS rag_chunks_update ON public.rag_chunks;
CREATE POLICY rag_chunks_update ON public.rag_chunks
  FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

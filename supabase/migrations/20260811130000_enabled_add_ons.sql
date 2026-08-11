-- TECH-3: Mecanismo de activación de módulos add-on por org
-- Los módulos add-on (operaciones, producto, reportes ejecutivos, etc.) son opcionales
-- y se activan por org desde super-admin.
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS enabled_add_ons TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN organizations.enabled_add_ons IS
  'Módulos add-on activados para esta org. Valores válidos: operaciones, producto, workboard, ejecutivo, inteligencia. Un array vacío significa solo los módulos core.';

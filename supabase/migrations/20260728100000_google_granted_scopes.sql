-- Add granted_scopes column to track which OAuth scopes a token has
-- Used to detect when users need to reconnect after scope changes

ALTER TABLE google_forms_integrations
  ADD COLUMN IF NOT EXISTS granted_scopes text;

ALTER TABLE youtube_integrations
  ADD COLUMN IF NOT EXISTS granted_scopes text;

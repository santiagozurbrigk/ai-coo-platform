-- Habilitar Supabase Realtime para reel_variation_jobs
-- El cliente Next.js suscribe con postgres_changes para recibir updates del worker
-- sin que el usuario tenga que hacer F5.

ALTER PUBLICATION supabase_realtime ADD TABLE reel_variation_jobs;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule if exists to make idempotent
DO $$
BEGIN
  PERFORM cron.unschedule('simulation-tick-every-5min');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'simulation-tick-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--2d28f67f-e9e1-4975-bb2e-db98999a94f7.lovable.app/api/public/hooks/simulation-tick',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
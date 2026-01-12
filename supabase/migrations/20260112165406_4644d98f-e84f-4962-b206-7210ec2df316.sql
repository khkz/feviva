-- Crear cron job para generar imágenes compartibles diariamente
SELECT cron.schedule(
  'generate-daily-images-midnight',
  '30 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://duggdnqpemwojkojfyei.supabase.co/functions/v1/generate-daily-images',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Z2dkbnFwZW13b2prb2pmeWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNTUxNDYsImV4cCI6MjA3NTczMTE0Nn0.ILOVuibQqKIvJYgWmRdXmG4HR4g57ajFUunrOiUmoA0"}'::jsonb,
    body := '{"force": false}'::jsonb
  ) AS request_id;
  $$
);
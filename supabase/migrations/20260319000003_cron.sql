-- Requires pg_cron extension (enabled by default on Supabase)
create extension if not exists pg_cron;

-- Expire ready_status rows every 5 minutes
select cron.schedule(
  'expire-ready-status',
  '*/5 * * * *',
  $$
    delete from public.ready_status
    where expires_at < now();
  $$
);

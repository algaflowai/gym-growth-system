-- Schedule cleanup of expired page sessions daily at midnight UTC
SELECT cron.schedule(
  'cleanup-expired-sessions-daily',
  '0 0 * * *',
  $$SELECT cleanup_expired_page_sessions();$$
);
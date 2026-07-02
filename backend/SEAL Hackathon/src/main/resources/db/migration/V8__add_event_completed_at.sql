ALTER TABLE hackathon_events
    ADD COLUMN completed_at timestamp;

UPDATE hackathon_events
SET completed_at = COALESCE(update_at, result_published_at, created_at)
WHERE status = 'COMPLETED'
  AND completed_at IS NULL;

CREATE INDEX idx_event_status_completed_at
    ON hackathon_events (status, completed_at);

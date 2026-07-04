ALTER TABLE hackathon_events
    ADD COLUMN competition_start_at timestamp;

ALTER TABLE hackathon_events
    ADD COLUMN competition_end_at timestamp;

UPDATE hackathon_events e
SET competition_start_at = COALESCE(
        (
            SELECT MIN(r.submission_deadline)
            FROM rounds r
            WHERE r.event_id = e.id
        ),
        e.registration_close
    ),
    competition_end_at = COALESCE(
        (
            SELECT MAX(COALESCE(r.judging_deadline, r.submission_deadline))
            FROM rounds r
            WHERE r.event_id = e.id
        ),
        e.registration_close + INTERVAL '1 day'
    )
WHERE e.competition_start_at IS NULL
   OR e.competition_end_at IS NULL;

ALTER TABLE hackathon_events
    ALTER COLUMN competition_start_at SET NOT NULL;

ALTER TABLE hackathon_events
    ALTER COLUMN competition_end_at SET NOT NULL;

ALTER TABLE hackathon_events
    ADD CONSTRAINT chk_event_competition_period
        CHECK (competition_start_at < competition_end_at);

ALTER TABLE hackathon_events
    ADD CONSTRAINT chk_event_registration_before_competition
        CHECK (registration_close <= competition_start_at);

CREATE INDEX idx_hackathon_events_competition_period
    ON hackathon_events (season, competition_start_at, competition_end_at);

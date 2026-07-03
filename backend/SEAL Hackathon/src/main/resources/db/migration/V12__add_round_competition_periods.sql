ALTER TABLE rounds
    ADD COLUMN start_at timestamp;

ALTER TABLE rounds
    ADD COLUMN end_at timestamp;

UPDATE rounds
SET start_at = submission_deadline,
    end_at = GREATEST(
        COALESCE(judging_deadline, submission_deadline + INTERVAL '1 hour'),
        submission_deadline + INTERVAL '1 hour'
    )
WHERE start_at IS NULL
   OR end_at IS NULL;

ALTER TABLE rounds
    ALTER COLUMN start_at SET NOT NULL;

ALTER TABLE rounds
    ALTER COLUMN end_at SET NOT NULL;

ALTER TABLE rounds
    ADD CONSTRAINT chk_round_competition_period
        CHECK (start_at < end_at);

ALTER TABLE rounds
    ADD CONSTRAINT chk_round_submission_deadline_in_period
        CHECK (submission_deadline >= start_at AND submission_deadline <= end_at);

ALTER TABLE rounds
    ADD CONSTRAINT chk_round_judging_deadline_in_period
        CHECK (judging_deadline IS NULL OR judging_deadline <= end_at);

CREATE INDEX idx_rounds_event_period
    ON rounds (event_id, start_at, end_at);

ALTER TABLE hackathon_events
    ADD COLUMN variance_threshold_points NUMERIC(8, 2) NOT NULL DEFAULT 3.00;

ALTER TABLE hackathon_events
    ADD CONSTRAINT chk_event_variance_threshold_positive
    CHECK (variance_threshold_points > 0);

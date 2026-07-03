ALTER TABLE teams
    ADD COLUMN registration_status varchar(30),
    ADD COLUMN registration_reviewed_at timestamp,
    ADD COLUMN registration_reviewed_by uuid,
    ADD COLUMN registration_rejection_reason text;

UPDATE teams
SET registration_status = 'APPROVED'
WHERE track_id IS NOT NULL
  AND registered_at IS NOT NULL;

ALTER TABLE teams
    ADD CONSTRAINT fk_team_registration_reviewer
        FOREIGN KEY (registration_reviewed_by) REFERENCES users (id);

CREATE INDEX idx_teams_registration_status ON teams (registration_status);

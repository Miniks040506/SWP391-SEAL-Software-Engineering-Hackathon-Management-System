ALTER TABLE rankings
    ADD COLUMN IF NOT EXISTS tied boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS tie_group_key varchar(160),
    ADD COLUMN IF NOT EXISTS tie_group_size integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS manual_resolution_required boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_ranking_manual_resolution_required
    ON rankings (manual_resolution_required);

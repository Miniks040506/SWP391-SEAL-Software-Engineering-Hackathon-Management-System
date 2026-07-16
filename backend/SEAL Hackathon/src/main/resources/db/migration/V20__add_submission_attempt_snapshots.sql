CREATE TABLE submission_attempts (
    id                 uuid PRIMARY KEY,
    submission_id      uuid NOT NULL,
    attempt_number     integer NOT NULL,
    note               text,
    status             varchar(30) NOT NULL,
    submitted_at       timestamp NOT NULL,
    created_at         timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submission_attempt_submission
        FOREIGN KEY (submission_id) REFERENCES submissions (id),
    CONSTRAINT uk_submission_attempt_number
        UNIQUE (submission_id, attempt_number),
    CONSTRAINT chk_submission_attempt_number_positive
        CHECK (attempt_number > 0)
);

CREATE INDEX idx_submission_attempt_submission
    ON submission_attempts (submission_id);

CREATE INDEX idx_submission_attempt_submitted_at
    ON submission_attempts (submitted_at);

CREATE TABLE submission_attempt_links (
    id                 uuid PRIMARY KEY,
    attempt_id         uuid NOT NULL,
    source_link_id     uuid,
    link_type          varchar(30) NOT NULL,
    url                varchar(1000) NOT NULL,
    label              varchar(200),
    storage_provider   varchar(30) NOT NULL,
    object_key         varchar(1000),
    original_file_name varchar(300),
    content_type       varchar(150),
    file_size_bytes    bigint,
    repo_metadata      jsonb,
    is_primary         boolean NOT NULL DEFAULT false,
    display_order      integer NOT NULL DEFAULT 0,
    created_at         timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submission_attempt_link_attempt
        FOREIGN KEY (attempt_id) REFERENCES submission_attempts (id),
    CONSTRAINT chk_submission_attempt_link_display_order
        CHECK (display_order >= 0),
    CONSTRAINT chk_submission_attempt_link_file_size
        CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0)
);

CREATE INDEX idx_submission_attempt_link_attempt
    ON submission_attempt_links (attempt_id);

CREATE INDEX idx_submission_attempt_link_type
    ON submission_attempt_links (link_type);

CREATE INDEX idx_submission_attempt_link_source
    ON submission_attempt_links (source_link_id);

-- Earlier attempt states cannot be reconstructed from the mutable legacy rows.
-- Preserve the latest finalized state so existing evidence remains judgeable.
INSERT INTO submission_attempts (
    id,
    submission_id,
    attempt_number,
    note,
    status,
    submitted_at,
    created_at
)
SELECT
    gen_random_uuid(),
    submission.id,
    submission.submission_number,
    submission.note,
    submission.status,
    submission.submitted_at,
    COALESCE(submission.updated_at, submission.submitted_at, CURRENT_TIMESTAMP)
FROM submissions submission
WHERE submission.status IN ('SUBMITTED', 'LATE', 'DISQUALIFIED')
ON CONFLICT (submission_id, attempt_number) DO NOTHING;

INSERT INTO submission_attempt_links (
    id,
    attempt_id,
    source_link_id,
    link_type,
    url,
    label,
    storage_provider,
    object_key,
    original_file_name,
    content_type,
    file_size_bytes,
    repo_metadata,
    is_primary,
    display_order,
    created_at
)
SELECT
    gen_random_uuid(),
    attempt.id,
    link.id,
    link.link_type,
    link.url,
    link.label,
    link.storage_provider,
    link.object_key,
    link.original_file_name,
    link.content_type,
    link.file_size_bytes,
    link.repo_metadata,
    link.is_primary,
    link.display_order,
    COALESCE(link.created_at, attempt.created_at)
FROM submission_attempts attempt
JOIN submission_links link ON link.submission_id = attempt.submission_id
WHERE NOT EXISTS (
    SELECT 1
    FROM submission_attempt_links snapshot
    WHERE snapshot.attempt_id = attempt.id
      AND snapshot.source_link_id = link.id
);

CREATE OR REPLACE FUNCTION prevent_submission_attempt_snapshot_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'submission attempt snapshots are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_submission_attempt_update
BEFORE UPDATE OR DELETE ON submission_attempts
FOR EACH ROW
EXECUTE FUNCTION prevent_submission_attempt_snapshot_mutation();

CREATE TRIGGER trg_prevent_submission_attempt_link_update
BEFORE UPDATE OR DELETE ON submission_attempt_links
FOR EACH ROW
EXECUTE FUNCTION prevent_submission_attempt_snapshot_mutation();

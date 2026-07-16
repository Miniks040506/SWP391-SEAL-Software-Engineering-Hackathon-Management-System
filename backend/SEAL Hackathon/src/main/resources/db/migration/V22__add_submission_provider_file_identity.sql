ALTER TABLE submission_links
    ADD COLUMN provider_resource_id varchar(255),
    ADD COLUMN provider_checksum varchar(128),
    ADD COLUMN provider_modified_at timestamp;

ALTER TABLE submission_attempt_links
    ADD COLUMN provider_resource_id varchar(255),
    ADD COLUMN provider_checksum varchar(128),
    ADD COLUMN provider_modified_at timestamp;

CREATE INDEX idx_submission_link_provider_resource
    ON submission_links (storage_provider, provider_resource_id)
    WHERE provider_resource_id IS NOT NULL;

CREATE INDEX idx_submission_attempt_link_provider_resource
    ON submission_attempt_links (storage_provider, provider_resource_id)
    WHERE provider_resource_id IS NOT NULL;

CREATE TABLE provider_oauth_connections (
    id                      uuid PRIMARY KEY,
    user_id                 uuid NOT NULL,
    provider                varchar(30) NOT NULL,
    provider_account_id     varchar(255) NOT NULL,
    provider_account_email  varchar(320),
    encrypted_access_token  text,
    encrypted_refresh_token text,
    granted_scopes          text NOT NULL,
    token_expires_at        timestamp,
    connected_at            timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disconnected_at         timestamp,
    version                 bigint NOT NULL DEFAULT 0,
    CONSTRAINT fk_provider_oauth_connection_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uk_provider_oauth_connection_user_provider
        UNIQUE (user_id, provider),
    CONSTRAINT chk_provider_oauth_connection_provider
        CHECK (provider IN ('GOOGLE_DRIVE', 'GITHUB')),
    CONSTRAINT chk_provider_oauth_connection_tokens
        CHECK (
            disconnected_at IS NOT NULL
            OR encrypted_access_token IS NOT NULL
        )
);

CREATE INDEX idx_provider_oauth_connection_provider
    ON provider_oauth_connections (provider);

CREATE INDEX idx_provider_oauth_connection_active
    ON provider_oauth_connections (user_id, provider)
    WHERE disconnected_at IS NULL;

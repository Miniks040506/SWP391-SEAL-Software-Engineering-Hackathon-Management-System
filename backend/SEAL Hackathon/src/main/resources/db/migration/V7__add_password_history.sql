CREATE TABLE password_history (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    password_hash varchar(255) NOT NULL,
    created_at timestamp NOT NULL,
    CONSTRAINT fk_password_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_password_history_user_created_at
    ON password_history (user_id, created_at);

INSERT INTO password_history (id, user_id, password_hash, created_at) VALUES
('7a000000-0000-4000-8000-000000000001', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', TIMESTAMP '2026-05-01 08:00:00');

CREATE TABLE password_history (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    password_hash varchar(255) NOT NULL,
    created_at timestamp NOT NULL,
    CONSTRAINT fk_password_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_password_history_user_created_at
    ON password_history (user_id, created_at);

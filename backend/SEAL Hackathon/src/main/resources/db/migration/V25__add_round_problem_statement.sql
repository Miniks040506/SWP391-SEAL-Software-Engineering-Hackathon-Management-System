ALTER TABLE rounds
    ADD COLUMN IF NOT EXISTS problem_statement_url text,
    ADD COLUMN IF NOT EXISTS problem_statement_file_name varchar(255),
    ADD COLUMN IF NOT EXISTS problem_statement_uploaded_at timestamp;

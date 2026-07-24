-- ==========================================================================
-- V17__seed_test_coverage_and_fixes.sql
-- Closes every seed-data gap found in the migration audit (db/migration/result.md)
-- and aligns fixtures with the SEAL Full Project Test Plan Portal stories
-- (UA-01..16, TEAM-01..17, EV-01..16, SUB-01..18, RES-01..17, AI-01..12).
--
-- Sections:
--   A. Missing AI tables (safety net for V16's unmanaged dependency)
--   B. New users for auth stories (locked / OAuth / reset / unverified / deactivated)
--   C. password_history samples (UA-09 reuse rule)
--   D. Encrypted SystemConfig rows (UA-16 secret masking)
--   E. Active temporary guest judge + live grading queue (UA-13/14, SUB-10)
--   F. Team registration approval data (V14 / TEAM-11/12)
--   G. Invitation & join-request refresh (TEAM-05/07/08)
--   H. Legacy Spring-2025 round-1 backfill with a real ranking TIE (V15 / RES-01/04)
--   I. Disqualification appeals in terminal states UPHELD / OVERTURNED (RES-10)
--   J. Historical timestamp corrections (audit findings 6, 8)
--   K. Temporal revival: NOW()-relative windows so Past/Present/Future stays true
--   L. Deadline-reminder notifications exercising the V13 unique index (AI-09/11)
--   M. Full recompute of Summer-2026 qualification rankings from real scores
--      (audit findings 2-5; leaves grading unlocked as the RES-02 preview state)
--   N. Seed-data bug fixes (email addresses, stale PENDING invitation, counters)
--   O. AI knowledge / conversation / safety-log seed data (AI-01..12)
--   P. Announcement status coverage (published result + cancelled)
--
-- All timestamps for "live" scenarios use NOW()-relative intervals so the data
-- no longer decays. Test password for all users remains: Password@123
-- ==========================================================================

-- ---------------------------------------------------------------------
-- A. AI tables. V16 references ai_knowledge_chunks but no migration creates
--    it (it only ever existed via the old ddl-auto=create). These IF NOT EXISTS
--    blocks make V17 self-sufficient on databases that still lack them.
--    NOTE: a brand-new database still fails at V16 itself; the team must move
--    this table creation before V16 (dev-only edit + dropdb/createdb).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_knowledge_documents (
    id            uuid PRIMARY KEY,
    title         varchar(250) NOT NULL,
    doc_type      varchar(80)  NOT NULL,
    source_ref    varchar(500),
    visibility    varchar(30)  NOT NULL,
    module        varchar(120),
    content_hash  varchar(64),
    is_active     boolean      NOT NULL DEFAULT true,
    uploaded_by   uuid REFERENCES users (id),
    created_at    timestamp    NOT NULL,
    updated_at    timestamp    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_doc_type       ON ai_knowledge_documents (doc_type);
CREATE INDEX IF NOT EXISTS idx_ai_doc_visibility ON ai_knowledge_documents (visibility);

CREATE TABLE IF NOT EXISTS ai_knowledge_chunks (
    id             uuid PRIMARY KEY,
    document_id    uuid NOT NULL REFERENCES ai_knowledge_documents (id) ON DELETE CASCADE,
    chunk_index    integer NOT NULL,
    content        text NOT NULL,
    module         varchar(120),
    use_case_id    varchar(80),
    role_scope     varchar(80),
    metadata_json  text,
    embedding_text text,
    is_active      boolean NOT NULL DEFAULT true,
    created_at     timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_chunk_document ON ai_knowledge_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_ai_chunk_active   ON ai_knowledge_chunks (is_active);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id          uuid PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES users (id),
    title       varchar(200),
    language    varchar(20),
    last_intent varchar(80),
    is_active   boolean NOT NULL DEFAULT true,
    created_at  timestamp NOT NULL,
    updated_at  timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_user       ON ai_conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_updated_at ON ai_conversations (updated_at);

CREATE TABLE IF NOT EXISTS ai_messages (
    id                uuid PRIMARY KEY,
    conversation_id   uuid NOT NULL REFERENCES ai_conversations (id) ON DELETE CASCADE,
    user_id           uuid REFERENCES users (id),
    role              varchar(20) NOT NULL,
    content           text NOT NULL,
    language          varchar(30),
    intent            varchar(80),
    safety_decision   varchar(30),
    provider          varchar(80),
    model             varchar(120),
    used_rag          boolean,
    retrieval_context text,
    created_at        timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_message_conversation ON ai_messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_message_created_at   ON ai_messages (created_at);

CREATE TABLE IF NOT EXISTS ai_safety_logs (
    id              uuid PRIMARY KEY,
    user_id         uuid REFERENCES users (id),
    conversation_id uuid REFERENCES ai_conversations (id),
    decision        varchar(30) NOT NULL,
    risk_type       varchar(50) NOT NULL,
    intent          varchar(80),
    severity        integer NOT NULL,
    reason          text,
    message_hash    varchar(64),
    page_context    varchar(500),
    created_at      timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_safety_user     ON ai_safety_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_safety_decision ON ai_safety_logs (decision);

-- ---------------------------------------------------------------------
-- B. Auth-story users (UA-02/03/06/07/12). Same bcrypt hash = Password@123.
-- ---------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified_at, email_verification_token, email_verification_expires_at, oauth_provider, oauth_provider_id, password_reset_token, password_reset_expires_at, avatar_url, last_login_at, failed_login_count, locked_until, created_at, updated_at) VALUES
('17000000-0000-4000-8000-000000000701', 'locked.student@seal.test',      '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Locked Student',      '0913000701', 'STUDENT', 'ACTIVE',      NOW() - INTERVAL '30 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Locked%20Student',      NOW() - INTERVAL '1 day', 5, NOW() + INTERVAL '30 minutes', NOW() - INTERVAL '40 days', NOW()),
('17000000-0000-4000-8000-000000000702', 'oauth.google@seal.test',        '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'OAuth Google Student','0913000702', 'STUDENT', 'ACTIVE',      NOW() - INTERVAL '20 days', NULL, NULL, 'GOOGLE', 'google-uid-1001', NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=OAuth%20Google',        NOW() - INTERVAL '2 hours', 0, NULL, NOW() - INTERVAL '20 days', NOW()),
('17000000-0000-4000-8000-000000000703', 'oauth.github@seal.test',        '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'OAuth GitHub Student','0913000703', 'STUDENT', 'ACTIVE',      NOW() - INTERVAL '20 days', NULL, NULL, 'GITHUB', 'github-uid-2002', NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=OAuth%20GitHub',        NOW() - INTERVAL '3 hours', 0, NULL, NOW() - INTERVAL '20 days', NOW()),
('17000000-0000-4000-8000-000000000704', 'reset.active@seal.test',        '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Reset Active Student','0913000704', 'STUDENT', 'ACTIVE',      NOW() - INTERVAL '25 days', NULL, NULL, NULL, NULL, 'reset-token-active-654321',  NOW() + INTERVAL '15 minutes', 'https://api.dicebear.com/7.x/initials/svg?seed=Reset%20Active',  NOW() - INTERVAL '2 days', 0, NULL, NOW() - INTERVAL '25 days', NOW()),
('17000000-0000-4000-8000-000000000705', 'reset.expired@seal.test',       '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Reset Expired Student','0913000705', 'STUDENT', 'ACTIVE',     NOW() - INTERVAL '25 days', NULL, NULL, NULL, NULL, 'reset-token-expired-000111', NOW() - INTERVAL '1 hour',    'https://api.dicebear.com/7.x/initials/svg?seed=Reset%20Expired', NOW() - INTERVAL '2 days', 0, NULL, NOW() - INTERVAL '25 days', NOW()),
('17000000-0000-4000-8000-000000000706', 'fresh.unverified@seal.test',    '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Fresh Unverified',    '0913000706', 'STUDENT', 'UNVERIFIED',  NULL, 'verify-fresh-123456', NOW() + INTERVAL '30 minutes', NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Fresh%20Unverified', NULL, 0, NULL, NOW() - INTERVAL '1 hour', NOW()),
('17000000-0000-4000-8000-000000000707', 'deactivated.student@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Deactivated Student', '0913000707', 'STUDENT', 'DEACTIVATED', NOW() - INTERVAL '90 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Deactivated%20Student', NULL, 0, NULL, NOW() - INTERVAL '90 days', NOW()),
('17000000-0000-4000-8000-000000000708', 'judge5@seal.test',              '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Active Guest Judge',  '0913000708', 'JUDGE',   'ACTIVE',      NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Active%20Guest%20Judge', NOW() - INTERVAL '1 day', 0, NULL, NOW() - INTERVAL '10 days', NOW()),
('17000000-0000-4000-8000-000000000709', 'student49@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 49', '0913000749', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '15 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2049', NULL, 0, NULL, NOW() - INTERVAL '15 days', NOW()),
('17000000-0000-4000-8000-00000000070a', 'student50@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 50', '0913000750', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '15 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2050', NULL, 0, NULL, NOW() - INTERVAL '15 days', NOW()),
('17000000-0000-4000-8000-00000000070b', 'student51@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 51', '0913000751', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '15 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2051', NULL, 0, NULL, NOW() - INTERVAL '15 days', NOW()),
('17000000-0000-4000-8000-00000000070c', 'student52@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 52', '0913000752', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '15 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2052', NULL, 0, NULL, NOW() - INTERVAL '15 days', NOW()),
('17000000-0000-4000-8000-00000000070d', 'student53@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 53', '0913000753', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '15 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2053', NULL, 0, NULL, NOW() - INTERVAL '15 days', NOW()),
('17000000-0000-4000-8000-00000000070e', 'student54@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 54', '0913000754', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '15 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2054', NULL, 0, NULL, NOW() - INTERVAL '15 days', NOW()),
('17000000-0000-4000-8000-00000000070f', 'student55@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 55', '0913000755', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '15 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2055', NULL, 0, NULL, NOW() - INTERVAL '15 days', NOW()),
('17000000-0000-4000-8000-000000000710', 'student56@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 56', '0913000756', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '15 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2056', NULL, 0, NULL, NOW() - INTERVAL '15 days', NOW());

INSERT INTO student_profile (id, student_type, student_code, university_name, major, graduation_year, verified_at, user_id) VALUES
('17000000-0000-4000-8000-000000000721', 'FPT',      'SE219901', 'FPT University',          'Software Engineering', 2028, NOW() - INTERVAL '30 days', '17000000-0000-4000-8000-000000000701'),
('17000000-0000-4000-8000-000000000722', 'FPT',      'SE219902', 'FPT University',          'AI Engineering',       2028, NOW() - INTERVAL '20 days', '17000000-0000-4000-8000-000000000702'),
('17000000-0000-4000-8000-000000000723', 'EXTERNAL', 'EXT21903', 'HCMUT',                   'Computer Science',     2027, NOW() - INTERVAL '20 days', '17000000-0000-4000-8000-000000000703'),
('17000000-0000-4000-8000-000000000724', 'FPT',      'SE219904', 'FPT University',          'Information Systems',  2029, NOW() - INTERVAL '25 days', '17000000-0000-4000-8000-000000000704'),
('17000000-0000-4000-8000-000000000725', 'EXTERNAL', 'EXT21905', 'UIT',                     'Computer Science',     2028, NOW() - INTERVAL '25 days', '17000000-0000-4000-8000-000000000705'),
('17000000-0000-4000-8000-000000000726', 'FPT',      'SE219906', 'FPT University',          'Software Engineering', 2029, NULL,                       '17000000-0000-4000-8000-000000000706'),
('17000000-0000-4000-8000-000000000727', 'EXTERNAL', 'EXT21907', 'Van Lang University',     'Digital Business',     2027, NOW() - INTERVAL '90 days', '17000000-0000-4000-8000-000000000707'),
('17000000-0000-4000-8000-000000000728', 'FPT',      'SE210049', 'FPT University',          'Software Engineering', 2028, NOW() - INTERVAL '15 days', '17000000-0000-4000-8000-000000000709'),
('17000000-0000-4000-8000-000000000729', 'FPT',      'SE210050', 'FPT University',          'Software Engineering', 2029, NOW() - INTERVAL '15 days', '17000000-0000-4000-8000-00000000070a'),
('17000000-0000-4000-8000-00000000072a', 'EXTERNAL', 'EXT21051', 'RMIT Vietnam',            'Information Systems',  2027, NOW() - INTERVAL '15 days', '17000000-0000-4000-8000-00000000070b'),
('17000000-0000-4000-8000-00000000072b', 'FPT',      'SE210052', 'FPT University',          'AI Engineering',       2028, NOW() - INTERVAL '15 days', '17000000-0000-4000-8000-00000000070c'),
('17000000-0000-4000-8000-00000000072c', 'FPT',      'SE210053', 'FPT University',          'AI Engineering',       2029, NOW() - INTERVAL '15 days', '17000000-0000-4000-8000-00000000070d'),
('17000000-0000-4000-8000-00000000072d', 'EXTERNAL', 'EXT21054', 'UEH',                     'Digital Business',     2027, NOW() - INTERVAL '15 days', '17000000-0000-4000-8000-00000000070e'),
('17000000-0000-4000-8000-00000000072e', 'FPT',      'SE210055', 'FPT University',          'Software Engineering', 2028, NOW() - INTERVAL '15 days', '17000000-0000-4000-8000-00000000070f'),
('17000000-0000-4000-8000-00000000072f', 'EXTERNAL', 'EXT21056', 'University of Science HCM','Computer Science',    2027, NOW() - INTERVAL '15 days', '17000000-0000-4000-8000-000000000710');

-- ---------------------------------------------------------------------
-- C. Password history (UA-09: block reuse of a recent password).
--    First row equals the CURRENT hash so "reuse current password" trips it.
-- ---------------------------------------------------------------------
INSERT INTO password_history (id, user_id, password_hash, created_at) VALUES
('17000000-0000-4000-8000-0000000007b1', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', NOW() - INTERVAL '40 days'),
('17000000-0000-4000-8000-0000000007b2', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', '$2a$10$Xy9zA1bC2dE3fG4hI5jK6uOP7qR8sT9uV0wX1yZ2aB3cD4eF5gH6i', NOW() - INTERVAL '80 days'),
('17000000-0000-4000-8000-0000000007b3', '17000000-0000-4000-8000-000000000704', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', NOW() - INTERVAL '20 days');

-- ---------------------------------------------------------------------
-- D. Encrypted SystemConfig rows (UA-16). Values are placeholder ciphertext:
--    the API must return ***** for them; decrypt-on-use requires re-encrypting
--    with the local SYSTEM_CONFIG_MASTER_KEY.
-- ---------------------------------------------------------------------
INSERT INTO system_configs (id, config_key, config_value, value_type, is_encrypted, category, description, is_active, updated_by, created_at, updated_at) VALUES
('17000000-0000-4000-8000-000000000791', 'integration.github.token', 'ENC:v1:c2VlZC1wbGFjZWhvbGRlci1jaXBoZXJ0ZXh0', 'STRING', TRUE, 'INTEGRATION', 'GitHub API token for repository metadata sync (encrypted; API must mask).', TRUE, '99701e51-ee61-5105-8b22-4b546557a27c', NOW(), NOW()),
('17000000-0000-4000-8000-000000000792', 'smtp.password',            'ENC:v1:c210cC1zZWNyZXQtcGxhY2Vob2xkZXI=',     'STRING', TRUE, 'SMTP',        'SMTP password (encrypted; API must mask).',                                  TRUE, '99701e51-ee61-5105-8b22-4b546557a27c', NOW(), NOW());

-- ---------------------------------------------------------------------
-- E. Active temporary guest judge (UA-13/14 positive path; judge4 stays
--    expired as the negative path) + a live grading queue on mobile track.
-- ---------------------------------------------------------------------
INSERT INTO judge (id, judge_type, affiliation, bio, expertise_tags, is_temporary, expires_at, user_id) VALUES
('17000000-0000-4000-8000-000000000741', 'GUEST', 'Cloud Vendor', 'Active temporary guest judge for mobile submissions.', 'mobile,cloud,devops', TRUE, NOW() + INTERVAL '14 days', '17000000-0000-4000-8000-000000000708');

INSERT INTO round_judge_assignments (id, round_id, judge_id, track_id, scoring_progress, total_to_score, assigned_by, assigned_at, reminded_at) VALUES
('17000000-0000-4000-8000-000000000783', 'd92484b1-2090-5067-87d2-ec03f227fc96', '17000000-0000-4000-8000-000000000741', 'bacf7939-4158-55ee-9376-fc50c9b855e2', 0, 3, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', NOW() - INTERVAL '1 day', NULL);

-- ---------------------------------------------------------------------
-- F. Team registration approval coverage (V14 / TEAM-11/12):
--    one PENDING_APPROVAL team, one REJECTED team, one browsable FORMING team.
-- ---------------------------------------------------------------------
INSERT INTO teams (id, track_id, leader_id, name, join_code, join_code_enabled, project_title, description, status, member_count, registered_at, created_at, updated_at, registration_status, registration_reviewed_at, registration_reviewed_by, registration_rejection_reason) VALUES
('17000000-0000-4000-8000-000000000751', '8039cc28-1b76-556f-8bc2-2e544416d4c8', '17000000-0000-4000-8000-000000000709', 'Approval Pending Crew', 'PEND26', TRUE, 'Campus Access Portal', 'Web team awaiting coordinator registration review.', 'REGISTERED', 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 days', NOW(), 'PENDING_APPROVAL', NULL, NULL, NULL),
('17000000-0000-4000-8000-000000000752', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', '17000000-0000-4000-8000-00000000070c', 'Rejected Crew',         'REJ26',  TRUE, 'LLM Exam Grader',      'AI team whose registration was rejected by the coordinator.', 'REGISTERED', 3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '6 days', NOW(), 'REJECTED', NOW() - INTERVAL '2 hours', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'Project scope overlaps an existing commercial product; please revise and resubmit.'),
('17000000-0000-4000-8000-000000000753', 'bacf7939-4158-55ee-9376-fc50c9b855e2', '17000000-0000-4000-8000-00000000070f', 'Summer Formers',        'FORM26', TRUE, 'Fitness Buddy App',    'Forming team open for join requests and join-code entry.', 'FORMING', 2, NULL, NOW() - INTERVAL '4 days', NOW(), NULL, NULL, NULL, NULL);

INSERT INTO team_member (id, role, joined_at, left_at, left_reason, user_id, team_id) VALUES
('17000000-0000-4000-8000-000000000761', 'LEADER', NOW() - INTERVAL '5 days', NULL, NULL, '17000000-0000-4000-8000-000000000709', '17000000-0000-4000-8000-000000000751'),
('17000000-0000-4000-8000-000000000762', 'MEMBER', NOW() - INTERVAL '5 days', NULL, NULL, '17000000-0000-4000-8000-00000000070a', '17000000-0000-4000-8000-000000000751'),
('17000000-0000-4000-8000-000000000763', 'MEMBER', NOW() - INTERVAL '5 days', NULL, NULL, '17000000-0000-4000-8000-00000000070b', '17000000-0000-4000-8000-000000000751'),
('17000000-0000-4000-8000-000000000764', 'LEADER', NOW() - INTERVAL '6 days', NULL, NULL, '17000000-0000-4000-8000-00000000070c', '17000000-0000-4000-8000-000000000752'),
('17000000-0000-4000-8000-000000000765', 'MEMBER', NOW() - INTERVAL '6 days', NULL, NULL, '17000000-0000-4000-8000-00000000070d', '17000000-0000-4000-8000-000000000752'),
('17000000-0000-4000-8000-000000000766', 'MEMBER', NOW() - INTERVAL '6 days', NULL, NULL, '17000000-0000-4000-8000-00000000070e', '17000000-0000-4000-8000-000000000752'),
('17000000-0000-4000-8000-000000000767', 'LEADER', NOW() - INTERVAL '4 days', NULL, NULL, '17000000-0000-4000-8000-00000000070f', '17000000-0000-4000-8000-000000000753'),
('17000000-0000-4000-8000-000000000768', 'MEMBER', NOW() - INTERVAL '4 days', NULL, NULL, '17000000-0000-4000-8000-000000000710', '17000000-0000-4000-8000-000000000753');

-- ---------------------------------------------------------------------
-- G. Invitation refresh: the seeded Alpha invitation expired on 2026-06-12
--    but was still PENDING — transition it, then add a live PENDING
--    invitation and a live PENDING join request (TEAM-05/07/08).
-- ---------------------------------------------------------------------
UPDATE team_invitations
SET status = 'EXPIRED', respond_at = TIMESTAMP '2026-06-13 00:01:00', response_reason = 'Expired before response'
WHERE id = '07517a1d-5746-5ada-a432-ab6c0faabf30' AND status = 'PENDING';

INSERT INTO team_invitations (id, team_id, invited_by, invite_email, invitee_user_id, token, status, type, message, expires_at, created_at, respond_at, response_reason) VALUES
('17000000-0000-4000-8000-000000000771', 'c8a7ea92-97b9-5d7d-b9a8-eb0243689cb0', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', 'oauth.google@seal.test', '17000000-0000-4000-8000-000000000702', 'token-pending-alpha-live', 'PENDING', 'INVITATION', 'Join Alpha Coders for the final round push!', NOW() + INTERVAL '7 days', NOW(), NULL, NULL),
('17000000-0000-4000-8000-000000000772', '17000000-0000-4000-8000-000000000753', '17000000-0000-4000-8000-000000000704', 'reset.active@seal.test', '17000000-0000-4000-8000-000000000704', 'token-join-request-summer-formers', 'PENDING', 'JOIN_REQUEST', 'Hi, I would like to join Summer Formers as the third member.', NOW() + INTERVAL '7 days', NOW(), NULL, NULL);

-- ---------------------------------------------------------------------
-- H. Legacy Spring-2025 round-1 backfill (audit gap: RESULTS_READY round
--    with zero submissions) including a genuine ranking TIE for V15:
--    both web teams score exactly 8.30; tie was flagged for manual
--    resolution and resolved with MANUAL_ADVANCE (RES-04). AI runner
--    advances via WILDCARD to cover that AdvanceReason.
-- ---------------------------------------------------------------------
INSERT INTO submissions (id, team_id, round_id, note, submitted_at, updated_at, status, submission_number) VALUES
('17000000-0000-4000-8000-000000000111', 'c3942d11-0e5f-5007-b4e6-418fe6bac396', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', 'Round-1 submission for Legacy Web Winners.', TIMESTAMP '2025-04-01 20:00:00', TIMESTAMP '2025-04-01 20:00:00', 'SUBMITTED', 1),
('17000000-0000-4000-8000-000000000112', 'c381d1b1-c595-5810-9f7c-671e690e9eae', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', 'Round-1 submission for Legacy Web Runner.',  TIMESTAMP '2025-04-01 20:30:00', TIMESTAMP '2025-04-01 20:30:00', 'SUBMITTED', 1),
('17000000-0000-4000-8000-000000000113', 'cfddde8d-ccef-534f-ad54-2571ebe147dd', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', 'Round-1 submission for Legacy AI Winners.',  TIMESTAMP '2025-04-01 21:00:00', TIMESTAMP '2025-04-01 21:00:00', 'SUBMITTED', 1),
('17000000-0000-4000-8000-000000000114', '44d64c0a-7a15-5cd1-95f2-369b96c1f949', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', 'Round-1 submission for Legacy AI Runner.',   TIMESTAMP '2025-04-01 21:30:00', TIMESTAMP '2025-04-01 21:30:00', 'SUBMITTED', 1);

INSERT INTO submission_links (id, submission_id, link_type, url, label, storage_provider, object_key, original_file_name, content_type, file_size_bytes, repo_metadata, is_primary, display_order, created_at, updated_at) VALUES
('17000000-0000-4000-8000-000000000121', '17000000-0000-4000-8000-000000000111', 'REPOSITORY', 'https://github.com/seal-archive/legacy-web-winners-r1', 'Round-1 Repository', 'GITHUB', NULL, NULL, NULL, NULL, NULL, TRUE, 1, TIMESTAMP '2025-04-01 20:00:00', TIMESTAMP '2025-04-01 20:00:00'),
('17000000-0000-4000-8000-000000000122', '17000000-0000-4000-8000-000000000112', 'REPOSITORY', 'https://github.com/seal-archive/legacy-web-runner-r1',  'Round-1 Repository', 'GITHUB', NULL, NULL, NULL, NULL, NULL, TRUE, 1, TIMESTAMP '2025-04-01 20:30:00', TIMESTAMP '2025-04-01 20:30:00'),
('17000000-0000-4000-8000-000000000123', '17000000-0000-4000-8000-000000000113', 'REPOSITORY', 'https://github.com/seal-archive/legacy-ai-winners-r1',  'Round-1 Repository', 'GITHUB', NULL, NULL, NULL, NULL, NULL, TRUE, 1, TIMESTAMP '2025-04-01 21:00:00', TIMESTAMP '2025-04-01 21:00:00'),
('17000000-0000-4000-8000-000000000124', '17000000-0000-4000-8000-000000000114', 'REPOSITORY', 'https://github.com/seal-archive/legacy-ai-runner-r1',   'Round-1 Repository', 'GITHUB', NULL, NULL, NULL, NULL, NULL, TRUE, 1, TIMESTAMP '2025-04-01 21:30:00', TIMESTAMP '2025-04-01 21:30:00');

INSERT INTO round_judge_assignments (id, round_id, judge_id, track_id, scoring_progress, total_to_score, assigned_by, assigned_at, reminded_at) VALUES
('17000000-0000-4000-8000-000000000781', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', '79f650d1-4a5b-552a-8f9b-98570a7a2021', NULL, 4, 4, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', TIMESTAMP '2025-03-25 09:00:00', NULL),
('17000000-0000-4000-8000-000000000782', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', '958f88d4-4f60-55f3-99df-00cb502ccb7e', NULL, 4, 4, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', TIMESTAMP '2025-03-25 09:00:00', NULL);

-- Round-1 scores: web pair engineered to tie at exactly 8.30 weighted.
INSERT INTO scores (id, submission_id, judge_id, event_criteria_id, value, comment, is_draft, scored_at, updated_at) VALUES
('17000000-0000-4000-8000-000000020101', '17000000-0000-4000-8000-000000000111', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '0cfa724d-9d3b-5576-af11-77ae9e87b4d1', 8.2, 'R1 technical.',    FALSE, TIMESTAMP '2025-04-04 10:00:00', TIMESTAMP '2025-04-04 10:00:00'),
('17000000-0000-4000-8000-000000020102', '17000000-0000-4000-8000-000000000111', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '01a1eb83-3fee-5efc-adf0-119c7c1e09c2', 8.2, 'R1 innovation.',   FALSE, TIMESTAMP '2025-04-04 10:00:00', TIMESTAMP '2025-04-04 10:00:00'),
('17000000-0000-4000-8000-000000020103', '17000000-0000-4000-8000-000000000111', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '212cbda2-ddac-50eb-9f63-7f12f319e248', 8.2, 'R1 business.',     FALSE, TIMESTAMP '2025-04-04 10:00:00', TIMESTAMP '2025-04-04 10:00:00'),
('17000000-0000-4000-8000-000000020104', '17000000-0000-4000-8000-000000000111', '79f650d1-4a5b-552a-8f9b-98570a7a2021', 'b6ee570a-6691-58e0-a33f-0d5a0bc623c7', 8.2, 'R1 presentation.', FALSE, TIMESTAMP '2025-04-04 10:00:00', TIMESTAMP '2025-04-04 10:00:00'),
('17000000-0000-4000-8000-000000020105', '17000000-0000-4000-8000-000000000111', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '0cfa724d-9d3b-5576-af11-77ae9e87b4d1', 8.4, 'R1 technical.',    FALSE, TIMESTAMP '2025-04-04 11:00:00', TIMESTAMP '2025-04-04 11:00:00'),
('17000000-0000-4000-8000-000000020106', '17000000-0000-4000-8000-000000000111', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '01a1eb83-3fee-5efc-adf0-119c7c1e09c2', 8.4, 'R1 innovation.',   FALSE, TIMESTAMP '2025-04-04 11:00:00', TIMESTAMP '2025-04-04 11:00:00'),
('17000000-0000-4000-8000-000000020107', '17000000-0000-4000-8000-000000000111', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '212cbda2-ddac-50eb-9f63-7f12f319e248', 8.4, 'R1 business.',     FALSE, TIMESTAMP '2025-04-04 11:00:00', TIMESTAMP '2025-04-04 11:00:00'),
('17000000-0000-4000-8000-000000020108', '17000000-0000-4000-8000-000000000111', '958f88d4-4f60-55f3-99df-00cb502ccb7e', 'b6ee570a-6691-58e0-a33f-0d5a0bc623c7', 8.4, 'R1 presentation.', FALSE, TIMESTAMP '2025-04-04 11:00:00', TIMESTAMP '2025-04-04 11:00:00'),
('17000000-0000-4000-8000-000000020109', '17000000-0000-4000-8000-000000000112', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '0cfa724d-9d3b-5576-af11-77ae9e87b4d1', 8.2, 'R1 technical.',    FALSE, TIMESTAMP '2025-04-04 12:00:00', TIMESTAMP '2025-04-04 12:00:00'),
('17000000-0000-4000-8000-00000002010a', '17000000-0000-4000-8000-000000000112', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '01a1eb83-3fee-5efc-adf0-119c7c1e09c2', 8.2, 'R1 innovation.',   FALSE, TIMESTAMP '2025-04-04 12:00:00', TIMESTAMP '2025-04-04 12:00:00'),
('17000000-0000-4000-8000-00000002010b', '17000000-0000-4000-8000-000000000112', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '212cbda2-ddac-50eb-9f63-7f12f319e248', 8.2, 'R1 business.',     FALSE, TIMESTAMP '2025-04-04 12:00:00', TIMESTAMP '2025-04-04 12:00:00'),
('17000000-0000-4000-8000-00000002010c', '17000000-0000-4000-8000-000000000112', '79f650d1-4a5b-552a-8f9b-98570a7a2021', 'b6ee570a-6691-58e0-a33f-0d5a0bc623c7', 8.2, 'R1 presentation.', FALSE, TIMESTAMP '2025-04-04 12:00:00', TIMESTAMP '2025-04-04 12:00:00'),
('17000000-0000-4000-8000-00000002010d', '17000000-0000-4000-8000-000000000112', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '0cfa724d-9d3b-5576-af11-77ae9e87b4d1', 8.4, 'R1 technical.',    FALSE, TIMESTAMP '2025-04-04 13:00:00', TIMESTAMP '2025-04-04 13:00:00'),
('17000000-0000-4000-8000-00000002010e', '17000000-0000-4000-8000-000000000112', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '01a1eb83-3fee-5efc-adf0-119c7c1e09c2', 8.4, 'R1 innovation.',   FALSE, TIMESTAMP '2025-04-04 13:00:00', TIMESTAMP '2025-04-04 13:00:00'),
('17000000-0000-4000-8000-00000002010f', '17000000-0000-4000-8000-000000000112', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '212cbda2-ddac-50eb-9f63-7f12f319e248', 8.4, 'R1 business.',     FALSE, TIMESTAMP '2025-04-04 13:00:00', TIMESTAMP '2025-04-04 13:00:00'),
('17000000-0000-4000-8000-000000020110', '17000000-0000-4000-8000-000000000112', '958f88d4-4f60-55f3-99df-00cb502ccb7e', 'b6ee570a-6691-58e0-a33f-0d5a0bc623c7', 8.4, 'R1 presentation.', FALSE, TIMESTAMP '2025-04-04 13:00:00', TIMESTAMP '2025-04-04 13:00:00'),
('17000000-0000-4000-8000-000000020111', '17000000-0000-4000-8000-000000000113', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '0cfa724d-9d3b-5576-af11-77ae9e87b4d1', 8.9, 'R1 technical.',    FALSE, TIMESTAMP '2025-04-04 14:00:00', TIMESTAMP '2025-04-04 14:00:00'),
('17000000-0000-4000-8000-000000020112', '17000000-0000-4000-8000-000000000113', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '01a1eb83-3fee-5efc-adf0-119c7c1e09c2', 8.9, 'R1 innovation.',   FALSE, TIMESTAMP '2025-04-04 14:00:00', TIMESTAMP '2025-04-04 14:00:00'),
('17000000-0000-4000-8000-000000020113', '17000000-0000-4000-8000-000000000113', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '212cbda2-ddac-50eb-9f63-7f12f319e248', 8.9, 'R1 business.',     FALSE, TIMESTAMP '2025-04-04 14:00:00', TIMESTAMP '2025-04-04 14:00:00'),
('17000000-0000-4000-8000-000000020114', '17000000-0000-4000-8000-000000000113', '79f650d1-4a5b-552a-8f9b-98570a7a2021', 'b6ee570a-6691-58e0-a33f-0d5a0bc623c7', 8.9, 'R1 presentation.', FALSE, TIMESTAMP '2025-04-04 14:00:00', TIMESTAMP '2025-04-04 14:00:00'),
('17000000-0000-4000-8000-000000020115', '17000000-0000-4000-8000-000000000113', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '0cfa724d-9d3b-5576-af11-77ae9e87b4d1', 9.1, 'R1 technical.',    FALSE, TIMESTAMP '2025-04-04 15:00:00', TIMESTAMP '2025-04-04 15:00:00'),
('17000000-0000-4000-8000-000000020116', '17000000-0000-4000-8000-000000000113', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '01a1eb83-3fee-5efc-adf0-119c7c1e09c2', 9.1, 'R1 innovation.',   FALSE, TIMESTAMP '2025-04-04 15:00:00', TIMESTAMP '2025-04-04 15:00:00'),
('17000000-0000-4000-8000-000000020117', '17000000-0000-4000-8000-000000000113', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '212cbda2-ddac-50eb-9f63-7f12f319e248', 9.1, 'R1 business.',     FALSE, TIMESTAMP '2025-04-04 15:00:00', TIMESTAMP '2025-04-04 15:00:00'),
('17000000-0000-4000-8000-000000020118', '17000000-0000-4000-8000-000000000113', '958f88d4-4f60-55f3-99df-00cb502ccb7e', 'b6ee570a-6691-58e0-a33f-0d5a0bc623c7', 9.1, 'R1 presentation.', FALSE, TIMESTAMP '2025-04-04 15:00:00', TIMESTAMP '2025-04-04 15:00:00'),
('17000000-0000-4000-8000-000000020119', '17000000-0000-4000-8000-000000000114', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '0cfa724d-9d3b-5576-af11-77ae9e87b4d1', 7.5, 'R1 technical.',    FALSE, TIMESTAMP '2025-04-04 16:00:00', TIMESTAMP '2025-04-04 16:00:00'),
('17000000-0000-4000-8000-00000002011a', '17000000-0000-4000-8000-000000000114', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '01a1eb83-3fee-5efc-adf0-119c7c1e09c2', 7.5, 'R1 innovation.',   FALSE, TIMESTAMP '2025-04-04 16:00:00', TIMESTAMP '2025-04-04 16:00:00'),
('17000000-0000-4000-8000-00000002011b', '17000000-0000-4000-8000-000000000114', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '212cbda2-ddac-50eb-9f63-7f12f319e248', 7.5, 'R1 business.',     FALSE, TIMESTAMP '2025-04-04 16:00:00', TIMESTAMP '2025-04-04 16:00:00'),
('17000000-0000-4000-8000-00000002011c', '17000000-0000-4000-8000-000000000114', '79f650d1-4a5b-552a-8f9b-98570a7a2021', 'b6ee570a-6691-58e0-a33f-0d5a0bc623c7', 7.5, 'R1 presentation.', FALSE, TIMESTAMP '2025-04-04 16:00:00', TIMESTAMP '2025-04-04 16:00:00'),
('17000000-0000-4000-8000-00000002011d', '17000000-0000-4000-8000-000000000114', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '0cfa724d-9d3b-5576-af11-77ae9e87b4d1', 7.7, 'R1 technical.',    FALSE, TIMESTAMP '2025-04-04 17:00:00', TIMESTAMP '2025-04-04 17:00:00'),
('17000000-0000-4000-8000-00000002011e', '17000000-0000-4000-8000-000000000114', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '01a1eb83-3fee-5efc-adf0-119c7c1e09c2', 7.7, 'R1 innovation.',   FALSE, TIMESTAMP '2025-04-04 17:00:00', TIMESTAMP '2025-04-04 17:00:00'),
('17000000-0000-4000-8000-00000002011f', '17000000-0000-4000-8000-000000000114', '958f88d4-4f60-55f3-99df-00cb502ccb7e', '212cbda2-ddac-50eb-9f63-7f12f319e248', 7.7, 'R1 business.',     FALSE, TIMESTAMP '2025-04-04 17:00:00', TIMESTAMP '2025-04-04 17:00:00'),
('17000000-0000-4000-8000-000000020120', '17000000-0000-4000-8000-000000000114', '958f88d4-4f60-55f3-99df-00cb502ccb7e', 'b6ee570a-6691-58e0-a33f-0d5a0bc623c7', 7.7, 'R1 presentation.', FALSE, TIMESTAMP '2025-04-04 17:00:00', TIMESTAMP '2025-04-04 17:00:00');

-- Round-1 rankings: calculated AFTER grading lock (2025-04-06 18:00) — correct order.
INSERT INTO rankings (id, submission_id, round_id, track_id, total_score, score_breakdown, judge_count, rank_position, is_advanced, advance_reason, calculated_at, calculated_by, tied, tie_group_key, tie_group_size, manual_resolution_required) VALUES
('17000000-0000-4000-8000-000000000301', '17000000-0000-4000-8000-000000000111', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', '24851727-7c4f-5389-9d8e-b00d69d8ce0e', 8.30, '{"technical": {"average": 8.3}, "innovation": {"average": 8.3}, "business": {"average": 8.3}, "presentation": {"average": 8.3}}'::jsonb, 2, 1, TRUE, 'TOP_PERCENT',    TIMESTAMP '2025-04-06 19:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', TRUE,  '2c2c32f0:24851727:8.30', 2, TRUE),
('17000000-0000-4000-8000-000000000302', '17000000-0000-4000-8000-000000000112', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', '24851727-7c4f-5389-9d8e-b00d69d8ce0e', 8.30, '{"technical": {"average": 8.3}, "innovation": {"average": 8.3}, "business": {"average": 8.3}, "presentation": {"average": 8.3}}'::jsonb, 2, 1, TRUE, 'MANUAL_ADVANCE', TIMESTAMP '2025-04-06 19:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', TRUE,  '2c2c32f0:24851727:8.30', 2, TRUE),
('17000000-0000-4000-8000-000000000303', '17000000-0000-4000-8000-000000000113', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', '5e63285e-769c-5ad2-8728-c0d335433811', 9.00, '{"technical": {"average": 9.0}, "innovation": {"average": 9.0}, "business": {"average": 9.0}, "presentation": {"average": 9.0}}'::jsonb, 2, 1, TRUE, 'TOP_PERCENT',    TIMESTAMP '2025-04-06 19:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', FALSE, NULL, 1, FALSE),
('17000000-0000-4000-8000-000000000304', '17000000-0000-4000-8000-000000000114', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', '5e63285e-769c-5ad2-8728-c0d335433811', 7.60, '{"technical": {"average": 7.6}, "innovation": {"average": 7.6}, "business": {"average": 7.6}, "presentation": {"average": 7.6}}'::jsonb, 2, 2, TRUE, 'WILDCARD',       TIMESTAMP '2025-04-06 19:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', FALSE, NULL, 1, FALSE);

-- ---------------------------------------------------------------------
-- I. Disqualification appeals in terminal states (RES-10).
--    Zephyr: DQ was OVERTURNED (submission stays SUBMITTED).
--    Orbit:  appeal UPHELD (submission becomes DISQUALIFIED). Done BEFORE
--    the ranking recompute so Orbit is excluded per the SRS exclusion rule.
-- ---------------------------------------------------------------------
INSERT INTO disqualifications (id, submission_id, issued_by, reason, evidence_url, appeal_note, appeal_status, issued_at) VALUES
('17000000-0000-4000-8000-000000000401', '00b95882-b677-5cad-8939-c634affc1498', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'Suspected shared codebase with another team; flagged during repository review.', 'https://drive.google.com/file/d/zephyr-dq-evidence/view', 'Team proved independent commit history; disqualification overturned by coordinator.', 'OVERTURNED', NOW() - INTERVAL '4 days'),
('17000000-0000-4000-8000-000000000402', '4565a848-c87c-5ca4-8897-cd73645c8b4a', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'Demo video reused a previous-semester project without attribution.',              'https://drive.google.com/file/d/orbit-dq-evidence/view',  'Appeal reviewed with mentors; evidence confirmed, appeal upheld.',                    'UPHELD',     NOW() - INTERVAL '5 days');

UPDATE submissions SET status = 'DISQUALIFIED', updated_at = NOW()
WHERE id = '4565a848-c87c-5ca4-8897-cd73645c8b4a';

-- ---------------------------------------------------------------------
-- J. Historical timestamp corrections (audit findings 6 and 8).
-- ---------------------------------------------------------------------
-- Legacy 2025 teams were "created" in 2026 — 15 months after they registered.
UPDATE teams SET created_at = TIMESTAMP '2025-03-01 08:00:00', updated_at = TIMESTAMP '2025-04-20 10:00:00'
WHERE id IN ('c3942d11-0e5f-5007-b4e6-418fe6bac396', 'c381d1b1-c595-5810-9f7c-671e690e9eae',
             'cfddde8d-ccef-534f-ad54-2571ebe147dd', '44d64c0a-7a15-5cd1-95f2-369b96c1f949');

-- Legacy final-round links/scores were stamped 2026-06-10 (after grading lock 2025-04-19).
UPDATE submission_links SET created_at = TIMESTAMP '2025-04-15 22:00:00', updated_at = TIMESTAMP '2025-04-15 22:00:00'
WHERE submission_id IN ('a7ae9277-658d-583d-92b2-c354934dbcbe', '4bce68f0-4093-5071-a6de-e09e4076abeb',
                        '23e3e861-09ba-56df-a51c-96ddf5614070', 'ef64a5ec-d680-52d4-a4f7-e5b3231e0676');

UPDATE scores SET scored_at = TIMESTAMP '2025-04-17 12:00:00', updated_at = TIMESTAMP '2025-04-17 12:00:00'
WHERE submission_id IN ('a7ae9277-658d-583d-92b2-c354934dbcbe', '4bce68f0-4093-5071-a6de-e09e4076abeb',
                        '23e3e861-09ba-56df-a51c-96ddf5614070', 'ef64a5ec-d680-52d4-a4f7-e5b3231e0676');

-- The LATE submission (submitted 2026-06-19) had scores dated 2026-06-10.
UPDATE scores SET scored_at = TIMESTAMP '2026-06-20 09:00:00', updated_at = TIMESTAMP '2026-06-20 09:00:00'
WHERE submission_id = '091ed901-4b6a-5355-8a56-c71c1a144569';

-- Teams that already submitted should be COMPETING, not merely REGISTERED.
UPDATE teams SET status = 'COMPETING', updated_at = NOW()
WHERE id IN ('0ec99158-0ea1-5160-a533-5ecf065b47b8', '55705f79-5844-5a94-a74c-53f75aa37dee');

-- ---------------------------------------------------------------------
-- K. Temporal revival — restore a real Past / PRESENT / Future spread.
--    Spring 2026 becomes a live REGISTRATION window; the Summer 2026 final
--    round becomes a genuinely OPEN submission window; the qualification
--    round is properly locked for submissions and sits in JUDGING with
--    grading still open (the gradable round needed for SUB-13/14 tests).
-- ---------------------------------------------------------------------
UPDATE hackathon_events
SET registration_close   = NOW() + INTERVAL '5 days',
    competition_start_at = NOW() + INTERVAL '10 days',
    competition_end_at   = NOW() + INTERVAL '22 days',
    update_at            = NOW()
WHERE id = 'bc0c786f-c241-5528-988e-39a3cdec4160';

UPDATE rounds
SET start_at = NOW() + INTERVAL '10 days', submission_deadline = NOW() + INTERVAL '12 days',
    judging_deadline = NOW() + INTERVAL '14 days', end_at = NOW() + INTERVAL '14 days'
WHERE id = 'e59cf106-4750-54a8-9e1c-1fb7eef1265a';

UPDATE rounds
SET start_at = NOW() + INTERVAL '15 days', submission_deadline = NOW() + INTERVAL '20 days',
    judging_deadline = NOW() + INTERVAL '21 days', end_at = NOW() + INTERVAL '22 days'
WHERE id = '82e35947-a92f-5a39-a993-a37ed1d2ab55';

UPDATE hackathon_events
SET status = 'ONGOING',
    competition_end_at = NOW() + INTERVAL '10 days',
    result_published_at = NULL,
    completed_at = NULL,
    update_at = NOW()
WHERE id = '9d1822f7-ec66-52fe-8569-4faeb6b0a85b';

UPDATE rounds
SET status = 'OPEN', start_at = NOW() - INTERVAL '1 day',
    submission_deadline = NOW() + INTERVAL '7 days',
    judging_deadline = NOW() + INTERVAL '9 days', end_at = NOW() + INTERVAL '10 days',
    submission_locked_at = NULL, grading_locked_at = NULL,
    advancement_confirmed_at = NULL, result_published_at = NULL
WHERE id = 'd7104abc-8192-5a20-bcd8-4b99748297bb';

UPDATE rounds
SET status = 'RESULTS_READY',
    start_at = NOW() - INTERVAL '14 days',
    submission_deadline = NOW() - INTERVAL '10 days',
    judging_deadline = NOW() - INTERVAL '8 days',
    end_at = NOW() - INTERVAL '7 days',
    submission_locked_at = NOW() - INTERVAL '10 days',
    grading_locked_at = NOW() - INTERVAL '7 days',
    advancement_confirmed_at = COALESCE(
        advancement_confirmed_at,
        NOW() - INTERVAL '6 days'
    ),
    result_published_at = COALESCE(
        result_published_at,
        NOW() - INTERVAL '5 days'
    )
WHERE id = 'd92484b1-2090-5067-87d2-ec03f227fc96';

-- Reschedule the stale queued items into the future instead of the past.
UPDATE event_announcements SET scheduled_at = NOW() + INTERVAL '3 days', updated_at = NOW()
WHERE id = '433e773b-b2bb-58b0-9953-afca840e01d9' AND status = 'SCHEDULED';

UPDATE notifications SET scheduled_at = NOW() + INTERVAL '2 days'
WHERE id = 'cbe4ff16-76a8-57ed-be6a-4903e4fd5d02' AND status = 'SCHEDULED';

UPDATE email_outbox SET scheduled_at = NOW() + INTERVAL '2 days', updated_at = NOW()
WHERE id = 'ed26c259-9889-5a80-a2ad-5f490a2f9b44' AND status = 'PENDING';

-- ---------------------------------------------------------------------
-- L. Deadline reminders exercising the V13 partial unique index (AI-09/11).
-- ---------------------------------------------------------------------
INSERT INTO notifications (id, event_id, created_by, type, title, body, target_scope, target_id, channel, scheduled_at, sent_at, status, failure_reason, recipient_count, created_at) VALUES
('17000000-0000-4000-8000-000000000501', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'DEADLINE_REMINDER', 'Final round submission deadline reminder', 'The Final Demo Round submission deadline is approaching. Submit all deliverables in time.', 'EVENT_PARTICIPANTS', 'd7104abc-8192-5a20-bcd8-4b99748297bb', 'BOTH', NOW() + INTERVAL '6 days',  NULL, 'SCHEDULED', NULL, 40, NOW()),
('17000000-0000-4000-8000-000000000502', 'bc0c786f-c241-5528-988e-39a3cdec4160', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'DEADLINE_REMINDER', 'Information session deadline reminder',     'The Spring information session deliverable deadline is approaching.',                        'EVENT_PARTICIPANTS', 'e59cf106-4750-54a8-9e1c-1fb7eef1265a', 'BOTH', NOW() + INTERVAL '11 days', NULL, 'SCHEDULED', NULL, 12, NOW());

-- ---------------------------------------------------------------------
-- M. Recompute ALL Summer-2026 qualification rankings from the real score
--    rows (weighted by criteria weight, technical = 1.5). Fixes the swapped
--    breakdowns, the wrong totals, the contradictory MIN_SCORE_FAILED flag,
--    and ranks the 9 previously unranked submissions. Disqualified and
--    draft submissions are excluded per the SRS. Every assigned scorecard
--    is complete so the qualification round can remain grading-locked.
-- ---------------------------------------------------------------------
INSERT INTO scores (
    id, submission_id, judge_id, event_criteria_id,
    value, comment, is_draft, scored_at, updated_at
)
SELECT
    gen_random_uuid(),
    submission.id,
    assignment.judge_id,
    criteria.id,
    8.0,
    'Summer 2026 completed qualification fixture.',
    FALSE,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
FROM round_judge_assignments assignment
JOIN submissions submission
  ON submission.round_id = assignment.round_id
 AND submission.status IN ('SUBMITTED', 'LATE')
JOIN teams team
  ON team.id = submission.team_id
 AND (assignment.track_id IS NULL OR assignment.track_id = team.track_id)
JOIN rounds round ON round.id = assignment.round_id
JOIN event_criteria criteria
  ON criteria.event_id = round.event_id
 AND criteria.is_active = TRUE
 AND (
     criteria.applies_to_round_ids IS NULL
     OR criteria.applies_to_round_ids = ''
     OR criteria.applies_to_round_ids::jsonb ? round.id::text
 )
WHERE assignment.round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96'
ON CONFLICT ON CONSTRAINT uk_score_submission_judge_criteria
DO UPDATE SET is_draft = FALSE, updated_at = EXCLUDED.updated_at;

UPDATE round_judge_assignments assignment
SET scoring_progress = (
        SELECT COUNT(*)::integer
        FROM submissions submission
        JOIN teams team ON team.id = submission.team_id
        WHERE submission.round_id = assignment.round_id
          AND submission.status IN ('SUBMITTED', 'LATE')
          AND (assignment.track_id IS NULL OR assignment.track_id = team.track_id)
    ),
    total_to_score = (
        SELECT COUNT(*)::integer
        FROM submissions submission
        JOIN teams team ON team.id = submission.team_id
        WHERE submission.round_id = assignment.round_id
          AND submission.status IN ('SUBMITTED', 'LATE')
          AND (assignment.track_id IS NULL OR assignment.track_id = team.track_id)
    )
WHERE assignment.round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96';

WITH weighted AS (
    SELECT sub.id AS submission_id, t.track_id,
           SUM(s.value * COALESCE(ec.weight_override, sc.default_weight))
             / NULLIF(SUM(COALESCE(ec.weight_override, sc.default_weight)), 0) AS total,
           COUNT(DISTINCT s.judge_id) AS judge_count
    FROM submissions sub
    JOIN teams t   ON t.id = sub.team_id
    JOIN scores s  ON s.submission_id = sub.id AND s.is_draft = FALSE
    JOIN event_criteria ec ON ec.id = s.event_criteria_id
    LEFT JOIN scoring_criteria sc ON sc.id = ec.criteria_id
    WHERE sub.round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96'
      AND sub.status IN ('SUBMITTED', 'LATE')
    GROUP BY sub.id, t.track_id
),
cat AS (
    SELECT sub.id AS submission_id, lower(sc.category) AS category,
           ROUND(AVG(s.value)::numeric, 2) AS avg_value
    FROM submissions sub
    JOIN scores s ON s.submission_id = sub.id AND s.is_draft = FALSE
    JOIN event_criteria ec ON ec.id = s.event_criteria_id
    JOIN scoring_criteria sc ON sc.id = ec.criteria_id
    WHERE sub.round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96'
      AND sub.status IN ('SUBMITTED', 'LATE')
    GROUP BY sub.id, sc.category
),
breakdown AS (
    SELECT submission_id,
           jsonb_object_agg(category, jsonb_build_object('average', avg_value)) AS bd
    FROM cat GROUP BY submission_id
),
ranked AS (
    SELECT w.submission_id, w.track_id, w.judge_count, b.bd,
           ROUND(w.total::numeric, 2) AS total,
           RANK()   OVER (PARTITION BY w.track_id ORDER BY w.total DESC) AS pos,
           COUNT(*) OVER (PARTITION BY w.track_id, ROUND(w.total::numeric, 2)) AS tie_cnt
    FROM weighted w JOIN breakdown b USING (submission_id)
)
UPDATE rankings r
SET total_score     = ranked.total,
    score_breakdown = ranked.bd,
    judge_count     = ranked.judge_count,
    rank_position   = ranked.pos,
    is_advanced     = ((ranked.track_id = '8039cc28-1b76-556f-8bc2-2e544416d4c8' AND ranked.pos <= 3)
                    OR (ranked.track_id = 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9' AND ranked.pos <= 2)),
    advance_reason  = CASE
                        WHEN (ranked.track_id = '8039cc28-1b76-556f-8bc2-2e544416d4c8' AND ranked.pos <= 3)
                          OR (ranked.track_id = 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9' AND ranked.pos <= 2) THEN 'TOP_N'
                        WHEN ranked.total < 6.5 THEN 'MIN_SCORE_FAILED'
                        ELSE 'NOT_ADVANCED'
                      END,
    calculated_at   = NOW(),
    tied            = ranked.tie_cnt > 1,
    tie_group_size  = ranked.tie_cnt,
    tie_group_key   = CASE WHEN ranked.tie_cnt > 1
                           THEN 'd92484b1:' || ranked.track_id::text || ':' || ranked.total::text END,
    manual_resolution_required = FALSE
FROM ranked
WHERE r.round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96'
  AND r.submission_id = ranked.submission_id;

WITH weighted AS (
    SELECT sub.id AS submission_id, t.track_id,
           SUM(s.value * COALESCE(ec.weight_override, sc.default_weight))
             / NULLIF(SUM(COALESCE(ec.weight_override, sc.default_weight)), 0) AS total,
           COUNT(DISTINCT s.judge_id) AS judge_count
    FROM submissions sub
    JOIN teams t   ON t.id = sub.team_id
    JOIN scores s  ON s.submission_id = sub.id AND s.is_draft = FALSE
    JOIN event_criteria ec ON ec.id = s.event_criteria_id
    LEFT JOIN scoring_criteria sc ON sc.id = ec.criteria_id
    WHERE sub.round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96'
      AND sub.status IN ('SUBMITTED', 'LATE')
    GROUP BY sub.id, t.track_id
),
cat AS (
    SELECT sub.id AS submission_id, lower(sc.category) AS category,
           ROUND(AVG(s.value)::numeric, 2) AS avg_value
    FROM submissions sub
    JOIN scores s ON s.submission_id = sub.id AND s.is_draft = FALSE
    JOIN event_criteria ec ON ec.id = s.event_criteria_id
    JOIN scoring_criteria sc ON sc.id = ec.criteria_id
    WHERE sub.round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96'
      AND sub.status IN ('SUBMITTED', 'LATE')
    GROUP BY sub.id, sc.category
),
breakdown AS (
    SELECT submission_id,
           jsonb_object_agg(category, jsonb_build_object('average', avg_value)) AS bd
    FROM cat GROUP BY submission_id
),
ranked AS (
    SELECT w.submission_id, w.track_id, w.judge_count, b.bd,
           ROUND(w.total::numeric, 2) AS total,
           RANK()   OVER (PARTITION BY w.track_id ORDER BY w.total DESC) AS pos,
           COUNT(*) OVER (PARTITION BY w.track_id, ROUND(w.total::numeric, 2)) AS tie_cnt
    FROM weighted w JOIN breakdown b USING (submission_id)
)
INSERT INTO rankings (id, submission_id, round_id, track_id, total_score, score_breakdown, judge_count, rank_position, is_advanced, advance_reason, calculated_at, calculated_by, tied, tie_group_key, tie_group_size, manual_resolution_required)
SELECT gen_random_uuid(), ranked.submission_id, 'd92484b1-2090-5067-87d2-ec03f227fc96', ranked.track_id,
       ranked.total, ranked.bd, ranked.judge_count, ranked.pos,
       ((ranked.track_id = '8039cc28-1b76-556f-8bc2-2e544416d4c8' AND ranked.pos <= 3)
     OR (ranked.track_id = 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9' AND ranked.pos <= 2)),
       CASE
         WHEN (ranked.track_id = '8039cc28-1b76-556f-8bc2-2e544416d4c8' AND ranked.pos <= 3)
           OR (ranked.track_id = 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9' AND ranked.pos <= 2) THEN 'TOP_N'
         WHEN ranked.total < 6.5 THEN 'MIN_SCORE_FAILED'
         ELSE 'NOT_ADVANCED'
       END,
       NOW(), '0406b2de-5dcd-59c7-ad4c-e614f1f201a5',
       ranked.tie_cnt > 1,
       CASE WHEN ranked.tie_cnt > 1 THEN 'd92484b1:' || ranked.track_id::text || ':' || ranked.total::text END,
       ranked.tie_cnt, FALSE
FROM ranked
WHERE ranked.submission_id NOT IN (
    SELECT submission_id FROM rankings WHERE round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96'
);

-- Keep the confirmed advancement state consistent with the configured rules.
UPDATE rankings
SET is_advanced = (
        (track_id = '8039cc28-1b76-556f-8bc2-2e544416d4c8' AND rank_position <= 3)
        OR (track_id = 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9' AND rank_position <= 2)
        OR total_score >= 6.5
    ),
    advance_reason = CASE
        WHEN track_id = '8039cc28-1b76-556f-8bc2-2e544416d4c8' AND rank_position <= 3 THEN 'TOP_N'
        WHEN track_id = 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9' AND rank_position <= 2 THEN 'TOP_N'
        WHEN total_score >= 6.5 THEN 'MIN_SCORE'
        ELSE 'NOT_ADVANCED'
    END
WHERE round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96';

UPDATE teams t
SET status = CASE WHEN r.is_advanced THEN 'ADVANCED' ELSE 'ELIMINATED' END,
    updated_at = NOW()
FROM submissions s
JOIN rankings r ON r.submission_id = s.id
WHERE s.team_id = t.id
  AND r.round_id = 'd92484b1-2090-5067-87d2-ec03f227fc96'
  AND t.status <> 'WINNER';

-- ---------------------------------------------------------------------
-- N. Seed-data bug fixes: broken email addresses (student01.. do not exist)
--    and judge-assignment progress counters recomputed from real scores.
-- ---------------------------------------------------------------------
UPDATE email_outbox
SET to_email = 'student1@seal.test',
    cc_emails = 'student2@seal.test,student3@seal.test,student18@seal.test',
    updated_at = NOW()
WHERE id IN ('31ed3b1b-5a6c-5bc3-8ed1-c3b4f7383806', 'ed26c259-9889-5a80-a2ad-5f490a2f9b44');

UPDATE email_outbox SET to_email = 'student2@seal.test', updated_at = NOW()
WHERE id = 'e179f4d9-78e4-5944-b0ea-287da3f22acd';

UPDATE email_delivery_logs SET recipient_email = 'student1@seal.test'
WHERE id IN ('346b5b44-051a-5b3d-8b80-cf247d199fb1', 'dcd70e8f-84c6-5cc9-92af-f70b4dc4b0e5');

UPDATE email_delivery_logs SET recipient_email = 'student2@seal.test'
WHERE id = 'a0ae0764-4089-5440-97c5-e60cf40a7c29';

UPDATE round_judge_assignments rja
SET total_to_score = (
        SELECT COUNT(*)
        FROM submissions s JOIN teams t ON t.id = s.team_id
        WHERE s.round_id = rja.round_id
          AND (rja.track_id IS NULL OR t.track_id = rja.track_id)
          AND s.status IN ('SUBMITTED', 'LATE', 'DISQUALIFIED')
    ),
    scoring_progress = (
        SELECT COUNT(DISTINCT sc.submission_id)
        FROM scores sc
        JOIN submissions s2 ON s2.id = sc.submission_id
        JOIN teams t2 ON t2.id = s2.team_id
        WHERE sc.judge_id = rja.judge_id AND sc.is_draft = FALSE
          AND s2.round_id = rja.round_id
          AND (rja.track_id IS NULL OR t2.track_id = rja.track_id)
    );

-- ---------------------------------------------------------------------
-- O. AI knowledge, conversations and safety logs (AI-01..12).
-- ---------------------------------------------------------------------
INSERT INTO ai_knowledge_documents (id, title, doc_type, source_ref, visibility, module, content_hash, is_active, uploaded_by, created_at, updated_at) VALUES
('17000000-0000-4000-8000-000000000601', 'SEAL Participant Handbook 2026',       'HANDBOOK', 'https://seal.fpt.edu.vn/docs/participant-handbook-2026', 'PUBLIC', 'TEAM',    'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef', TRUE, '99701e51-ee61-5105-8b22-4b546557a27c', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('17000000-0000-4000-8000-000000000602', 'Judge Scoring and Calibration Guide',  'GUIDE',    'https://seal.fpt.edu.vn/docs/judge-scoring-guide',       'JUDGE',  'GRADING', 'b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef12', TRUE, '99701e51-ee61-5105-8b22-4b546557a27c', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

INSERT INTO ai_knowledge_chunks (id, document_id, chunk_index, content, module, use_case_id, role_scope, metadata_json, embedding_text, is_active, created_at) VALUES
('17000000-0000-4000-8000-000000000611', '17000000-0000-4000-8000-000000000601', 0, 'Teams must have 3 to 5 members. Each team submits one deliverable set per round: repository, demo and report or slide depending on the track requirements.', 'TEAM',    'UC-11', 'STUDENT', '{"source": "seed", "page": 4}',  'team size 3-5 members submission deliverables repository demo report slide', TRUE, NOW() - INTERVAL '10 days'),
('17000000-0000-4000-8000-000000000612', '17000000-0000-4000-8000-000000000601', 1, 'Submissions lock automatically at the round deadline. Late submissions are marked LATE and are only accepted while the round remains open per event policy.',      'SUB',     'UC-12', 'STUDENT', '{"source": "seed", "page": 9}',  'submission lock deadline late policy round open', TRUE, NOW() - INTERVAL '10 days'),
('17000000-0000-4000-8000-000000000613', '17000000-0000-4000-8000-000000000602', 0, 'Judges must complete the mandatory calibration round before production scoring. Scores are saved as drafts and become final on submit; final scores lock at grading lock.', 'GRADING', 'UC-14', 'JUDGE', '{"source": "seed", "page": 2}',  'calibration mandatory draft final score grading lock', TRUE, NOW() - INTERVAL '10 days'),
('17000000-0000-4000-8000-000000000614', '17000000-0000-4000-8000-000000000602', 1, 'Each criterion is scored 0-10 and weighted; the technical criterion carries weight 1.5. Rankings use the weighted average across all judges of the submission.',        'GRADING', 'UC-16', 'JUDGE', '{"source": "seed", "page": 5}',  'criterion weight technical 1.5 ranking weighted average judges', TRUE, NOW() - INTERVAL '10 days');

-- Embeddings are only seeded when V16 actually created the pgvector table
-- (pgvector may be unavailable locally — e.g. it is not installed for
-- PostgreSQL 18). Dynamic SQL keeps this migration valid either way.
DO $$
BEGIN
    IF to_regclass('ai_knowledge_chunk_embeddings') IS NOT NULL THEN
        EXECUTE $sql$
            INSERT INTO ai_knowledge_chunk_embeddings (id, chunk_id, model_name, dimension, embedding_vector, created_at, updated_at)
            SELECT '17000000-0000-4000-8000-000000000621', '17000000-0000-4000-8000-000000000611', 'text-embedding-3-small', 1536,
                   ('[' || string_agg(ROUND(((((g * 37 + 11) % 200) - 100) / 1000.0), 3)::text, ',' ORDER BY g) || ']')::vector,
                   NOW(), NOW()
            FROM generate_series(1, 1536) g
        $sql$;
        EXECUTE $sql$
            INSERT INTO ai_knowledge_chunk_embeddings (id, chunk_id, model_name, dimension, embedding_vector, created_at, updated_at)
            SELECT '17000000-0000-4000-8000-000000000622', '17000000-0000-4000-8000-000000000613', 'text-embedding-3-small', 1536,
                   ('[' || string_agg(ROUND(((((g * 53 + 29) % 200) - 100) / 1000.0), 3)::text, ',' ORDER BY g) || ']')::vector,
                   NOW(), NOW()
            FROM generate_series(1, 1536) g
        $sql$;
    END IF;
END $$;

INSERT INTO ai_conversations (id, user_id, title, language, last_intent, is_active, created_at, updated_at) VALUES
('17000000-0000-4000-8000-000000000631', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', 'Hỏi về hạn nộp bài vòng loại', 'VI', 'SUBMISSION_HELP',       TRUE, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('17000000-0000-4000-8000-000000000632', '2af79072-be0e-59a6-a502-53f82d6bd9a3', 'Assignment code request',      'EN', 'BLOCK_ASSIGNMENT_CODE', TRUE, NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day');

INSERT INTO ai_messages (id, conversation_id, user_id, role, content, language, intent, safety_decision, provider, model, used_rag, retrieval_context, created_at) VALUES
('17000000-0000-4000-8000-000000000641', '17000000-0000-4000-8000-000000000631', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', 'USER',      'Khi nào hết hạn nộp bài vòng loại và nhóm mình cần nộp những link gì?', 'VI', 'SUBMISSION_HELP', 'ALLOW', NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 days'),
('17000000-0000-4000-8000-000000000642', '17000000-0000-4000-8000-000000000631', NULL, 'ASSISTANT', 'Vòng loại đã khóa nộp bài; vòng chung kết đang mở. Nhóm bạn cần nộp repository, demo và slide theo yêu cầu track Web. Nguồn: SEAL Participant Handbook 2026.', 'VI', 'SUBMISSION_HELP', 'ALLOW', 'OPENAI_COMPATIBLE', 'gpt-4o-mini', TRUE, 'chunk 17000000-0000-4000-8000-000000000612 (Participant Handbook p.9)', NOW() - INTERVAL '2 days'),
('17000000-0000-4000-8000-000000000643', '17000000-0000-4000-8000-000000000632', '2af79072-be0e-59a6-a502-53f82d6bd9a3', 'USER',      'Write the full code for my SWP391 assignment so I can submit it as my own work.', 'EN', 'BLOCK_ASSIGNMENT_CODE', 'BLOCK', NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 day'),
('17000000-0000-4000-8000-000000000644', '17000000-0000-4000-8000-000000000632', NULL, 'ASSISTANT', 'I cannot write assignment code for you to submit as your own. I can explain concepts, review your approach, or help you debug code you wrote yourself.', 'EN', 'BLOCK_ASSIGNMENT_CODE', 'BLOCK', 'RULE_BASED', 'guardrail-v1', FALSE, NULL, NOW() - INTERVAL '1 day');

INSERT INTO ai_safety_logs (id, user_id, conversation_id, decision, risk_type, intent, severity, reason, message_hash, page_context, created_at) VALUES
('17000000-0000-4000-8000-000000000651', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', '17000000-0000-4000-8000-000000000631', 'ALLOW', 'NONE',             'SUBMISSION_HELP',       0, 'Benign submission question.',                                        'c3f1aa00000000000000000000000000000000000000000000000000000641aa', '/participant/dashboard', NOW() - INTERVAL '2 days'),
('17000000-0000-4000-8000-000000000652', '2af79072-be0e-59a6-a502-53f82d6bd9a3', '17000000-0000-4000-8000-000000000632', 'BLOCK', 'ASSIGNMENT_CODE',  'BLOCK_ASSIGNMENT_CODE', 4, 'User requested complete assignment code for submission as own work.', 'd4e2bb00000000000000000000000000000000000000000000000000000643bb', '/participant/dashboard', NOW() - INTERVAL '1 day'),
('17000000-0000-4000-8000-000000000653', '2af79072-be0e-59a6-a502-53f82d6bd9a3', '17000000-0000-4000-8000-000000000632', 'WARN',  'PROMPT_INJECTION', 'OUT_OF_SCOPE',          2, 'Message contained an instruction-override pattern; answered with guardrail notice.', 'e5f3cc00000000000000000000000000000000000000000000000000000645cc', '/participant/dashboard', NOW() - INTERVAL '1 day');

-- ---------------------------------------------------------------------
-- P. Announcement status coverage: a published result announcement for the
--    completed 2025 event and a CANCELLED announcement (EV-16).
-- ---------------------------------------------------------------------
INSERT INTO event_announcements (id, event_id, title, content, is_pinned, is_result_announcement, published_at, scheduled_at, status, target_scope, target_id, send_email, send_in_app, created_by, created_at, updated_at) VALUES
('17000000-0000-4000-8000-0000000007a1', '6953e3ce-f471-540d-a19d-b9224bf9870e', 'SEAL Spring 2025 Final Results', 'Final results are published. Congratulations to Legacy Web Winners and Legacy AI Winners!', TRUE,  TRUE,  TIMESTAMP '2025-04-20 10:05:00', NULL, 'PUBLISHED', 'ALL', NULL, TRUE,  TRUE, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', TIMESTAMP '2025-04-20 10:00:00', TIMESTAMP '2025-04-20 10:05:00'),
('17000000-0000-4000-8000-0000000007a2', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'Maintenance window (cancelled)', 'Planned platform maintenance was cancelled; no downtime will occur.',                        FALSE, FALSE, NULL, TIMESTAMP '2026-06-20 09:00:00', 'CANCELLED', 'ALL', NULL, FALSE, TRUE, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', TIMESTAMP '2026-06-15 09:00:00', TIMESTAMP '2026-06-18 09:00:00');

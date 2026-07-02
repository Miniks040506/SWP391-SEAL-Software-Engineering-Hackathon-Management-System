-- ==========================================================================
-- V6__seed_m5_results_audit_rbl.sql
-- Flyway seed migration for Module 5 - Results, Audit & RBL Research.
-- Auto-assembled from manual seeds v19 (base) + v20 (extra volume)
-- + v21 (new-feature data), grouped by module and ordered by FK deps.
-- Runs on the V1 baseline schema. Requires ddl-auto = validate | none.
-- Test password for all users: Password@123
-- ==========================================================================

-- ---- rankings ----
-- from seed v19
INSERT INTO rankings (id, submission_id, round_id, track_id, total_score, score_breakdown, judge_count, rank_position, is_advanced, advance_reason, calculated_at, calculated_by) VALUES
('ab8a3a38-7fdb-5cef-acbd-c41bb7efa261', 'a4669f66-3105-59f0-81be-3bfd94754fc3', 'd92484b1-2090-5067-87d2-ec03f227fc96', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 8.42, '{"technical": {"average": 8.4}, "innovation": {"average": 8.2}, "business": {"average": 8.5}, "presentation": {"average": 8.6}}'::jsonb, 2, 1, TRUE, 'TOP_N', TIMESTAMP '2026-06-10 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('4cdfa37a-964c-54a2-9c79-ed01a222ed48', 'c28dc162-a53e-5608-9b49-03f1771979f9', 'd92484b1-2090-5067-87d2-ec03f227fc96', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 7.72, '{"technical": {"average": 7.8}, "innovation": {"average": 7.5}, "business": {"average": 7.7}, "presentation": {"average": 7.9}}'::jsonb, 2, 2, TRUE, 'TOP_N', TIMESTAMP '2026-06-10 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('ce35d1ae-2da5-5562-9a18-c158f27ecc4e', '9f14482a-2c3e-5b43-950d-24c582a5d096', 'd92484b1-2090-5067-87d2-ec03f227fc96', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', 8.82, '{"technical": {"average": 8.9}, "innovation": {"average": 9.1}, "business": {"average": 8.5}, "presentation": {"average": 8.6}}'::jsonb, 2, 1, TRUE, 'TOP_N', TIMESTAMP '2026-06-10 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('6b903ae5-f0d5-5960-aa5b-4af283852d49', '091ed901-4b6a-5355-8a56-c71c1a144569', 'd92484b1-2090-5067-87d2-ec03f227fc96', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', 6.92, '{"technical": {"average": 7.0}, "innovation": {"average": 7.1}, "business": {"average": 6.5}, "presentation": {"average": 7.0}}'::jsonb, 2, 2, FALSE, 'MIN_SCORE_FAILED', TIMESTAMP '2026-06-10 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('245b9f8f-c419-5c7e-a5dd-3aeab9d18b5a', 'a7ae9277-658d-583d-92b2-c354934dbcbe', '0a07562f-7cb6-54f8-bd66-9d8332cb2781', '24851727-7c4f-5389-9d8e-b00d69d8ce0e', 9.12, '{"technical": {"average": 9.3}, "innovation": {"average": 9.0}, "business": {"average": 8.9}, "presentation": {"average": 9.2}}'::jsonb, 2, 1, FALSE, NULL, TIMESTAMP '2025-04-20 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('fd4d1b09-6b7e-51cc-bd2a-0d69c366188c', '4bce68f0-4093-5071-a6de-e09e4076abeb', '0a07562f-7cb6-54f8-bd66-9d8332cb2781', '24851727-7c4f-5389-9d8e-b00d69d8ce0e', 8.22, '{"technical": {"average": 8.3}, "innovation": {"average": 8.1}, "business": {"average": 8.0}, "presentation": {"average": 8.5}}'::jsonb, 2, 2, FALSE, NULL, TIMESTAMP '2025-04-20 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('24055cc2-4051-5a38-8de1-1792a27b7bbc', '23e3e861-09ba-56df-a51c-96ddf5614070', '0a07562f-7cb6-54f8-bd66-9d8332cb2781', '5e63285e-769c-5ad2-8728-c0d335433811', 9.28, '{"technical": {"average": 9.5}, "innovation": {"average": 9.6}, "business": {"average": 8.9}, "presentation": {"average": 9.1}}'::jsonb, 2, 1, FALSE, NULL, TIMESTAMP '2025-04-20 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('7eab6354-5ee8-5f22-a1d6-bc9d1542f7bf', 'ef64a5ec-d680-52d4-a4f7-e5b3231e0676', '0a07562f-7cb6-54f8-bd66-9d8332cb2781', '5e63285e-769c-5ad2-8728-c0d335433811', 0.00, '{"disqualified": {"flag": 1.0}}'::jsonb, 2, 99, FALSE, 'DISQUALIFIED', TIMESTAMP '2025-04-20 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5');

-- ---- prizes ----
-- from seed v19
INSERT INTO prizes (id, event_id, track_id, rank_position, title, description, value, currency, sponsor_name, awarded_team_id, awarded_at) VALUES
('5946dde5-7a78-5690-aef7-188f969d6d90', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 1, 'Web Track Champion', 'Award for best web solution.', 3000000.00, 'VND', 'FPT Software', NULL, NULL),
('e2f25a39-494d-5531-9bcb-b9f98c235874', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', 1, 'AI Track Champion', 'Award for best AI solution.', 3000000.00, 'VND', 'FPT AI', NULL, NULL),
('3744727c-9922-5bb9-ada1-d144c9acceee', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', NULL, 1, 'Overall Grand Prize', 'Overall event winner.', 5000000.00, 'VND', 'PDP', NULL, NULL),
('af99b1a4-d617-5b5c-986a-dc63f7760558', '6953e3ce-f471-540d-a19d-b9224bf9870e', '24851727-7c4f-5389-9d8e-b00d69d8ce0e', 1, 'Web Champion 2025', 'Awarded web track winner.', 3000000.00, 'VND', 'FPT Software', 'c3942d11-0e5f-5007-b4e6-418fe6bac396', TIMESTAMP '2025-04-20 10:00:00'),
('59d47473-e9f6-5117-9b73-ee0d3dd844ab', '6953e3ce-f471-540d-a19d-b9224bf9870e', '5e63285e-769c-5ad2-8728-c0d335433811', 1, 'AI Champion 2025', 'Awarded AI track winner.', 3000000.00, 'VND', 'FPT AI', 'cfddde8d-ccef-534f-ad54-2571ebe147dd', TIMESTAMP '2025-04-20 10:00:00');

-- from seed v21
INSERT INTO prizes (id, event_id, track_id, rank_position, title, description, value, currency, sponsor_name, awarded_team_id, awarded_at) VALUES
('4a000000-0000-4000-8000-0000000005a1', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 2, 'Web Track Runner-up', 'Second place, web track.', 1500000.00, 'VND', 'FPT Software', NULL, NULL),
('4a000000-0000-4000-8000-0000000005a2', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 3, 'Web Track Third Place', 'Third place, web track.', 800000.00, 'VND', 'FPT Software', NULL, NULL),
('4a000000-0000-4000-8000-0000000005a3', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', 2, 'AI Track Runner-up', 'Second place, AI track.', 1500000.00, 'VND', 'FPT AI', NULL, NULL),
('4a000000-0000-4000-8000-0000000005a4', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', NULL, 2, 'Overall Runner-up', 'Overall second place.', 3000000.00, 'VND', 'PDP', NULL, NULL);

-- ---- disqualifications ----
-- from seed v19
INSERT INTO disqualifications (id, submission_id, issued_by, reason, evidence_url, appeal_note, appeal_status, issued_at) VALUES
('5907ed6e-50a8-5d30-8be2-b94f0876692c', 'ef64a5ec-d680-52d4-a4f7-e5b3231e0676', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'Repository history did not match final demo and plagiarism evidence was reported.', 'https://drive.google.com/file/d/disq-evidence/view', 'Team requested review and provided explanation.', 'PENDING', TIMESTAMP '2025-04-18 15:00:00');

-- from seed v21
INSERT INTO disqualifications (id, submission_id, issued_by, reason, evidence_url, appeal_note, appeal_status, issued_at) VALUES
('4a000000-0000-4000-8000-000000000301', '4a000000-0000-4000-8000-000000000102', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'Commit history shows large unattributed code drop close to the deadline; possible external authorship.', 'https://drive.google.com/file/d/summer-gamma-disq-evidence/view', 'Team disputes the finding and requests a review of the commit timeline.', 'PENDING', TIMESTAMP '2026-06-28 10:00:00');

-- ---- export_jobs ----
-- from seed v19
INSERT INTO export_jobs (id, requested_by, export_type, params, status, file_url, file_name, file_size_bytes, row_count, error_message, requested_at, started_at, completed_at, expires_at) VALUES
('68710225-b591-5b10-a14d-210ce70788f8', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'RANKING', '{"eventId": "9d1822f7-ec66-52fe-8569-4faeb6b0a85b", "roundId": "d92484b1-2090-5067-87d2-ec03f227fc96"}'::jsonb, 'QUEUED', NULL, NULL, NULL, NULL, NULL, TIMESTAMP '2026-06-10 09:00:00', NULL, NULL, NULL),
('7d4fe91d-ace0-521e-a218-bb095d86ee7b', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'TEAM_LIST', '{"eventId": "9d1822f7-ec66-52fe-8569-4faeb6b0a85b"}'::jsonb, 'DONE', 'https://example.com/exports/team-list.csv', 'team-list.csv', 2048, 10, NULL, TIMESTAMP '2026-06-09 10:00:00', TIMESTAMP '2026-06-09 10:01:00', TIMESTAMP '2026-06-09 10:02:00', TIMESTAMP '2026-06-11 10:02:00');

-- from seed v21
INSERT INTO export_jobs (id, requested_by, export_type, params, status, file_url, file_name, file_size_bytes, row_count, error_message, requested_at, started_at, completed_at, expires_at) VALUES

('4a000000-0000-4000-8000-0000000000a1', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'RANKING',
 '{"eventId": "9d1822f7-ec66-52fe-8569-4faeb6b0a85b", "roundId": "d92484b1-2090-5067-87d2-ec03f227fc96", "format": "CSV"}'::jsonb,
 'DONE', 'https://example.com/exports/summer-qual-ranking.csv', 'summer-qual-ranking.csv', 4096, 4, NULL,
 TIMESTAMP '2026-06-11 09:00:00', TIMESTAMP '2026-06-11 09:00:05', TIMESTAMP '2026-06-11 09:00:30', TIMESTAMP '2026-07-11 09:00:30'),


('4a000000-0000-4000-8000-0000000000a2', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'SCORE_REPORT',
 '{"eventId": "9d1822f7-ec66-52fe-8569-4faeb6b0a85b", "roundId": "d92484b1-2090-5067-87d2-ec03f227fc96", "includeDraft": false}'::jsonb,
 'DONE', 'https://example.com/exports/summer-scores.xlsx', 'summer-scores.xlsx', 20480, 20, NULL,
 TIMESTAMP '2026-06-11 09:05:00', TIMESTAMP '2026-06-11 09:05:05', TIMESTAMP '2026-06-11 09:05:40', TIMESTAMP '2026-07-11 09:05:40'),


('4a000000-0000-4000-8000-0000000000a3', '99701e51-ee61-5105-8b22-4b546557a27c', 'SCORE_DATASET_ANONYMIZED',
 '{"eventId": "9d1822f7-ec66-52fe-8569-4faeb6b0a85b", "anonymize": true, "includeCriteria": true}'::jsonb,
 'DONE', 'https://example.com/exports/rbl-dataset-anon.csv', 'rbl-dataset-anon.csv', 65536, 80, NULL,
 TIMESTAMP '2026-06-11 09:10:00', TIMESTAMP '2026-06-11 09:10:10', TIMESTAMP '2026-06-11 09:11:00', TIMESTAMP '2026-07-11 09:11:00'),


('4a000000-0000-4000-8000-0000000000a4', '99701e51-ee61-5105-8b22-4b546557a27c', 'SCORE_DATASET_ANONYMIZED',
 '{"eventId": "6953e3ce-f471-540d-a19d-b9224bf9870e", "anonymize": true}'::jsonb,
 'QUEUED', NULL, NULL, NULL, NULL, NULL,
 TIMESTAMP '2026-06-12 08:00:00', NULL, NULL, NULL),


('4a000000-0000-4000-8000-0000000000a5', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'TEAM_LIST',
 '{"eventId": "9d1822f7-ec66-52fe-8569-4faeb6b0a85b"}'::jsonb,
 'PROCESSING', NULL, NULL, NULL, NULL, NULL,
 TIMESTAMP '2026-06-12 08:30:00', TIMESTAMP '2026-06-12 08:30:05', NULL, NULL),


('4a000000-0000-4000-8000-0000000000a6', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'CALIBRATION_REPORT',
 '{"eventId": "9d1822f7-ec66-52fe-8569-4faeb6b0a85b", "calibrationRoundId": "6438c4af-3c8a-58ad-9f88-379b84e51e74"}'::jsonb,
 'DONE', 'https://example.com/exports/summer-calibration.pdf', 'summer-calibration.pdf', 30720, 4, NULL,
 TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:05', TIMESTAMP '2026-06-12 09:00:25', TIMESTAMP '2026-07-12 09:00:25'),


('4a000000-0000-4000-8000-0000000000a7', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'FULL_EVENT_REPORT',
 '{"eventId": "9d1822f7-ec66-52fe-8569-4faeb6b0a85b", "sections": ["teams", "submissions", "rankings"]}'::jsonb,
 'QUEUED', NULL, NULL, NULL, NULL, NULL,
 TIMESTAMP '2026-06-12 09:30:00', NULL, NULL, NULL),


('4a000000-0000-4000-8000-0000000000a8', '99701e51-ee61-5105-8b22-4b546557a27c', 'ADMIN_ANNUAL_REPORT',
 '{"year": 2025, "includeIrrMetrics": true}'::jsonb,
 'DONE', 'https://example.com/exports/admin-annual-2025.pdf', 'admin-annual-2025.pdf', 102400, 200, NULL,
 TIMESTAMP '2026-06-12 10:00:00', TIMESTAMP '2026-06-12 10:00:10', TIMESTAMP '2026-06-12 10:01:00', TIMESTAMP '2026-07-12 10:01:00'),


('4a000000-0000-4000-8000-0000000000a9', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'RANKING',
 '{"eventId": "9d1822f7-ec66-52fe-8569-4faeb6b0a85b", "roundId": "d7104abc-8192-5a20-bcd8-4b99748297bb"}'::jsonb,
 'FAILED', NULL, NULL, NULL, NULL, 'No confirmed scores found for the requested round.',
 TIMESTAMP '2026-06-12 10:30:00', TIMESTAMP '2026-06-12 10:30:05', TIMESTAMP '2026-06-12 10:30:15', NULL),


('4a000000-0000-4000-8000-0000000000aa', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'TEAM_LIST',
 '{"eventId": "6953e3ce-f471-540d-a19d-b9224bf9870e"}'::jsonb,
 'DONE', 'https://example.com/exports/spring2025-team-list.csv', 'spring2025-team-list.csv', 1024, 6, NULL,
 TIMESTAMP '2026-05-01 09:00:00', TIMESTAMP '2026-05-01 09:00:05', TIMESTAMP '2026-05-01 09:00:20', TIMESTAMP '2026-05-03 09:00:20'),


('4a000000-0000-4000-8000-0000000000ab', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'SCORE_REPORT',
 '{"eventId": "6953e3ce-f471-540d-a19d-b9224bf9870e", "roundId": "0a07562f-7cb6-54f8-bd66-9d8332cb2781"}'::jsonb,
 'PROCESSING', NULL, NULL, NULL, NULL, NULL,
 TIMESTAMP '2026-06-12 11:00:00', TIMESTAMP '2026-06-12 11:00:05', NULL, NULL);

-- ---- audit_logs ----
-- from seed v19
INSERT INTO audit_logs (id, actor_id, action_type, target_table, target_id, before_state, after_state, context, ip_address, user_agent, created_at) VALUES
('a08ea385-4971-5189-86d9-0888f4ce0d06', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'JUDGE_ASSIGNED', 'round_judge_assignments', 'b30e8542-4f67-56c4-a81f-8dcd34dd7f3c', NULL, '{"round": "Qualification Round", "judge": "Judge Architecture"}'::jsonb, '{"source": "seed"}'::jsonb, '127.0.0.1', 'seed-script', TIMESTAMP '2026-06-05 09:00:00'),
('775f722d-5ad8-53fb-9db7-4d7014fdd4d7', '35fb4dd4-d4f0-5f08-b17f-856159cd2793', 'MENTOR_FEEDBACK_CREATED', 'mentor_feedbacks', '2094f137-1dff-5598-8529-b100587d0334', NULL, '{"team": "Alpha Coders", "visibility": "PUBLISHED"}'::jsonb, '{"source": "seed"}'::jsonb, '127.0.0.1', 'seed-script', TIMESTAMP '2026-06-09 10:00:00'),
('4e2b13ea-03e8-5205-a9d1-3984ea9d7061', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'RESULT_PUBLISHED', 'hackathon_events', '6953e3ce-f471-540d-a19d-b9224bf9870e', NULL, '{"status": "COMPLETED"}'::jsonb, '{"source": "seed"}'::jsonb, '127.0.0.1', 'seed-script', TIMESTAMP '2025-04-20 10:00:00');

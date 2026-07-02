-- ==========================================================================
-- V3__seed_m2_event_config.sql
-- Flyway seed migration for Module 2 - Event & Configuration Management.
-- Auto-assembled from manual seeds v19 (base) + v20 (extra volume)
-- + v21 (new-feature data), grouped by module and ordered by FK deps.
-- Runs on the V1 baseline schema. Requires ddl-auto = validate | none.
-- Test password for all users: Password@123
-- ==========================================================================

-- ---- hackathon_events ----
-- from seed v19
INSERT INTO hackathon_events (id, name, slug, season, year, description, banner_url, registration_open, registration_close, status, result_published_at, created_at, update_at, created_by) VALUES
('bc0c786f-c241-5528-988e-39a3cdec4160', 'SEAL Spring 2026', 'seal-spring-2026', 'SPRING', 2026, 'Spring hackathon focusing on student team formation and early registration.', 'https://res.cloudinary.com/demo/image/upload/v1/seal/events/spring-2026-banner.jpg', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-25 23:59:00', 'REGISTRATION', NULL, TIMESTAMP '2026-04-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'SEAL Summer 2026', 'seal-summer-2026', 'SUMMER', 2026, 'Main API testing event: tracks, rounds, submissions, judges, mentor feedback and rankings.', 'https://res.cloudinary.com/demo/image/upload/v1/seal/events/summer-2026-banner.jpg', TIMESTAMP '2026-05-01 08:00:00', TIMESTAMP '2026-05-31 23:59:00', 'ONGOING', NULL, TIMESTAMP '2026-04-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('9e37549a-3993-5299-b782-ce4f57e92f75', 'SEAL Fall 2026', 'seal-fall-2026', 'FALL', 2026, 'Draft event used to test create/edit event configuration APIs.', 'https://res.cloudinary.com/demo/image/upload/v1/seal/events/fall-2026-banner.jpg', TIMESTAMP '2026-09-01 08:00:00', TIMESTAMP '2026-09-30 23:59:00', 'DRAFT', NULL, TIMESTAMP '2026-04-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00', '2cc37edd-03ca-5dfd-9336-2ffbaab22596'),
('6953e3ce-f471-540d-a19d-b9224bf9870e', 'SEAL Spring 2025', 'seal-spring-2025', 'SPRING', 2025, 'Completed event with published result, ranking and awarded prizes.', 'https://res.cloudinary.com/demo/image/upload/v1/seal/events/spring-2025-banner.jpg', TIMESTAMP '2025-03-01 08:00:00', TIMESTAMP '2025-03-20 23:59:00', 'COMPLETED', TIMESTAMP '2025-04-20 10:00:00', TIMESTAMP '2026-04-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5'),
('abf57ce2-6e0e-5d4a-bdb2-75ce9175604d', 'SEAL Summer 2025 Cancelled', 'seal-summer-2025-cancelled', 'SUMMER', 2025, 'Cancelled demo event for status transition testing.', 'https://res.cloudinary.com/demo/image/upload/v1/seal/events/summer-2025-cancelled-banner.jpg', TIMESTAMP '2025-06-01 08:00:00', TIMESTAMP '2025-06-25 23:59:00', 'CANCELLED', NULL, TIMESTAMP '2026-04-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00', '2cc37edd-03ca-5dfd-9336-2ffbaab22596');

-- ---- tracks ----
-- from seed v19
INSERT INTO tracks (id, name, description, required_link_types, max_teams, min_members, max_members, display_order, event_id) VALUES
('6b1a064c-f51d-58f0-aec5-db7cd7e57716', 'Backend Services', 'APIs, security, integration and data persistence.', '["REPOSITORY", "DEMO", "REPORT"]', 20, 3, 5, 1, 'bc0c786f-c241-5528-988e-39a3cdec4160'),
('b7771bfe-9cdc-5438-b7a6-3c7608ac4883', 'Product & UX', 'User experience, product validation and presentation.', '["DEMO", "SLIDE", "REPORT"]', 18, 3, 5, 2, 'bc0c786f-c241-5528-988e-39a3cdec4160'),
('8039cc28-1b76-556f-8bc2-2e544416d4c8', 'Web Innovation', 'Full-stack web apps with real user workflows.', '["REPOSITORY", "DEMO", "SLIDE"]', 30, 3, 5, 1, '9d1822f7-ec66-52fe-8569-4faeb6b0a85b'),
('c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', 'AI Solutions', 'AI/ML applications, RAG, automation and data products.', '["REPOSITORY", "DEMO", "REPORT"]', 24, 3, 5, 2, '9d1822f7-ec66-52fe-8569-4faeb6b0a85b'),
('bacf7939-4158-55ee-9376-fc50c9b855e2', 'Mobile Apps', 'Mobile-first and cross-platform solutions.', '["REPOSITORY", "DEMO", "VIDEO"]', 20, 3, 5, 3, '9d1822f7-ec66-52fe-8569-4faeb6b0a85b'),
('0b01f400-c2d4-5f9a-be73-1e376f917994', 'Open Innovation', 'Any software product aligned with SEAL theme.', '["REPOSITORY", "DEMO"]', 30, 3, 5, 1, '9e37549a-3993-5299-b782-ce4f57e92f75'),
('24851727-7c4f-5389-9d8e-b00d69d8ce0e', 'Web Innovation', 'Completed web track.', '["REPOSITORY", "DEMO", "SLIDE"]', 20, 3, 5, 1, '6953e3ce-f471-540d-a19d-b9224bf9870e'),
('5e63285e-769c-5ad2-8728-c0d335433811', 'AI Solutions', 'Completed AI track.', '["REPOSITORY", "DEMO", "REPORT"]', 20, 3, 5, 2, '6953e3ce-f471-540d-a19d-b9224bf9870e');

-- ---- rounds ----
-- from seed v19
INSERT INTO rounds (id, event_id, name, order_index, description, submission_deadline, judging_deadline, status, is_final, submission_locked_at, grading_locked_at, advancement_confirmed_at) VALUES
('e59cf106-4750-54a8-9e1c-1fb7eef1265a', 'bc0c786f-c241-5528-988e-39a3cdec4160', 'Information Session', 1, 'Registration orientation and team preparation.', TIMESTAMP '2026-06-26 23:59:00', TIMESTAMP '2026-06-28 23:59:00', 'UPCOMING', FALSE, NULL, NULL, NULL),
('82e35947-a92f-5a39-a993-a37ed1d2ab55', 'bc0c786f-c241-5528-988e-39a3cdec4160', 'Qualification Round', 2, 'First deliverable after registration closes.', TIMESTAMP '2026-07-05 23:59:00', TIMESTAMP '2026-07-08 23:59:00', 'UPCOMING', FALSE, NULL, NULL, NULL),
('d92484b1-2090-5067-87d2-ec03f227fc96', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'Qualification Round', 1, 'Submit repository, demo and report/slide depending on track.', TIMESTAMP '2026-06-18 23:59:00', TIMESTAMP '2026-06-22 23:59:00', 'OPEN', FALSE, NULL, NULL, NULL),
('d7104abc-8192-5a20-bcd8-4b99748297bb', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'Final Demo Round', 2, 'Final pitch and product demo for advanced teams.', TIMESTAMP '2026-06-28 23:59:00', TIMESTAMP '2026-06-30 18:00:00', 'UPCOMING', TRUE, NULL, NULL, NULL),
('c7306ad8-e08f-509e-ae1e-9d1c546c887a', '9e37549a-3993-5299-b782-ce4f57e92f75', 'Draft Round', 1, 'Draft round used for configuration testing.', TIMESTAMP '2026-10-10 23:59:00', TIMESTAMP '2026-10-15 23:59:00', 'UPCOMING', FALSE, NULL, NULL, NULL),
('2c2c32f0-7b00-5477-8859-ad4c23c166f2', '6953e3ce-f471-540d-a19d-b9224bf9870e', 'Qualification Round', 1, 'Completed qualification round.', TIMESTAMP '2025-04-01 23:59:00', TIMESTAMP '2025-04-05 23:59:00', 'RESULTS_READY', FALSE, TIMESTAMP '2025-04-02 00:10:00', TIMESTAMP '2025-04-06 18:00:00', TIMESTAMP '2025-04-07 09:00:00'),
('0a07562f-7cb6-54f8-bd66-9d8332cb2781', '6953e3ce-f471-540d-a19d-b9224bf9870e', 'Final Demo Round', 2, 'Completed final demo round.', TIMESTAMP '2025-04-15 23:59:00', TIMESTAMP '2025-04-18 18:00:00', 'RESULTS_READY', TRUE, TIMESTAMP '2025-04-16 00:10:00', TIMESTAMP '2025-04-19 18:00:00', TIMESTAMP '2025-04-20 09:00:00');

-- ---- advance_rules ----
-- from seed v19
INSERT INTO advance_rules (id, round_id, track_id, rule_type, value, priority, description) VALUES
('6b9b94e0-4fe8-52e5-9095-fb3391762fa9', 'd92484b1-2090-5067-87d2-ec03f227fc96', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 'TOP_N', 3, 1, 'Top 3 web teams advance to final.'),
('7b79a604-a650-54ce-9c4f-153e79aab486', 'd92484b1-2090-5067-87d2-ec03f227fc96', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', 'TOP_N', 2, 1, 'Top 2 AI teams advance to final.'),
('48e609d9-3f83-5797-82e7-5b1fc47114c2', 'd92484b1-2090-5067-87d2-ec03f227fc96', NULL, 'MIN_SCORE', 6.5, 2, 'Global minimum score to qualify.'),
('39e120c7-7c80-5a6a-ab81-c594cbb44651', '2c2c32f0-7b00-5477-8859-ad4c23c166f2', NULL, 'TOP_PERCENT', 50, 1, 'Top 50 percent advance.');

-- ---- scoring_criteria ----
-- from seed v19
INSERT INTO scoring_criteria (id, name, description, rubric, max_score, default_weight, category, is_technical, is_default, is_active, created_at) VALUES
('8cb05ef6-4318-50dc-9911-d41f9c6728f6', 'Technical Implementation', 'Code quality, architecture, API design, security and maintainability.', '0-4 weak / 5-7 acceptable / 8-10 production-ready technical solution.', 10, 1.5, 'TECHNICAL', TRUE, TRUE, TRUE, TIMESTAMP '2026-04-01 08:00:00'),
('040de64c-ccd2-5ec1-acfa-5f3405d7b0ff', 'Innovation', 'Originality, creativity and technology differentiation.', 'Evaluate uniqueness and practical novelty.', 10, 1.0, 'INNOVATION', FALSE, TRUE, TRUE, TIMESTAMP '2026-04-01 08:00:00'),
('a12e1fce-d7b2-5d4c-a9a0-02b78bebcc1c', 'Business Value', 'Problem relevance, market fit and value proposition.', 'Evaluate whether the product solves a real problem.', 10, 1.0, 'BUSINESS', FALSE, TRUE, TRUE, TIMESTAMP '2026-04-01 08:00:00'),
('794e8b18-c627-5b8e-9b9e-d28f53582b8e', 'Presentation & Demo', 'Storytelling, demo flow, Q&A and slide quality.', 'Evaluate clarity and persuasion.', 10, 1.0, 'PRESENTATION', FALSE, TRUE, TRUE, TIMESTAMP '2026-04-01 08:00:00'),
('17f73dac-4911-5837-af2a-75c647bfe813', 'Agile Process', 'Team collaboration, Git history, planning and iteration evidence.', 'Evaluate process traceability and delivery discipline.', 10, 0.8, 'TECHNICAL', TRUE, FALSE, TRUE, TIMESTAMP '2026-04-01 08:00:00');

-- ---- event_criteria ----
-- from seed v19
INSERT INTO event_criteria (id, event_id, criteria_id, name_override, description_override, rubric_override, weight_override, max_score_override, is_technical_override, is_active, applies_to_round_ids, display_order) VALUES
('853acfed-a265-5931-af69-456c4d9a522a', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '8cb05ef6-4318-50dc-9911-d41f9c6728f6', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, 1),
('9fa11673-4fb2-5f00-9641-30f924093617', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '040de64c-ccd2-5ec1-acfa-5f3405d7b0ff', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, 2),
('42a9272d-fc7b-524d-83b2-610640100f0c', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'a12e1fce-d7b2-5d4c-a9a0-02b78bebcc1c', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, 3),
('7fee79e5-ec63-5699-9428-3e25b411885e', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '794e8b18-c627-5b8e-9b9e-d28f53582b8e', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, 4),
('0cfa724d-9d3b-5576-af11-77ae9e87b4d1', '6953e3ce-f471-540d-a19d-b9224bf9870e', '8cb05ef6-4318-50dc-9911-d41f9c6728f6', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, 1),
('01a1eb83-3fee-5efc-adf0-119c7c1e09c2', '6953e3ce-f471-540d-a19d-b9224bf9870e', '040de64c-ccd2-5ec1-acfa-5f3405d7b0ff', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, 2),
('212cbda2-ddac-50eb-9f63-7f12f319e248', '6953e3ce-f471-540d-a19d-b9224bf9870e', 'a12e1fce-d7b2-5d4c-a9a0-02b78bebcc1c', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, 3),
('b6ee570a-6691-58e0-a33f-0d5a0bc623c7', '6953e3ce-f471-540d-a19d-b9224bf9870e', '794e8b18-c627-5b8e-9b9e-d28f53582b8e', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, NULL, 4),
('74ff8b44-3bbc-5747-a232-1e962a4089c1', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', NULL, 'Scalability Readiness', 'Custom criterion for final round scalability.', 'Evaluate deployment, monitoring and scaling plan.', 1.2, 10, TRUE, TRUE, '["d7104abc-8192-5a20-bcd8-4b99748297bb"]', 5);

-- ---- event_announcements ----
-- from seed v19
INSERT INTO event_announcements (id, event_id, title, content, is_pinned, is_result_announcement, published_at, scheduled_at, status, target_scope, target_id, send_email, send_in_app, created_by, created_at, updated_at) VALUES
('743f7171-8511-5afc-8b79-e7e53ce76d1e', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'Welcome to SEAL Summer 2026', 'Please check your track page, mentor assignment and submission deadline.', TRUE, FALSE, TIMESTAMP '2026-06-01 08:30:00', NULL, 'PUBLISHED', 'ALL', NULL, TRUE, TRUE, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-01 08:30:00'),
('2ba8d401-2708-5a41-bee9-9a4307ddeec2', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'Web Track Technical Reminder', 'Web teams must submit repository, demo and slide links before deadline.', FALSE, FALSE, TIMESTAMP '2026-06-07 09:00:00', NULL, 'PUBLISHED', 'TRACK', '8039cc28-1b76-556f-8bc2-2e544416d4c8', FALSE, TRUE, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', TIMESTAMP '2026-06-07 08:00:00', TIMESTAMP '2026-06-07 09:00:00'),
('433e773b-b2bb-58b0-9953-afca840e01d9', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', 'Result Announcement Schedule', 'Final qualification results will be published after judging lock.', FALSE, TRUE, NULL, TIMESTAMP '2026-06-23 09:00:00', 'SCHEDULED', 'ALL', NULL, TRUE, TRUE, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', TIMESTAMP '2026-06-09 08:00:00', TIMESTAMP '2026-06-09 08:00:00'),
('bfa6ce27-0160-55df-bb9e-0dd1b8d0b04b', '9e37549a-3993-5299-b782-ce4f57e92f75', 'Draft Planning Note', 'Internal draft announcement for coordinator testing.', FALSE, FALSE, NULL, NULL, 'DRAFT', 'COORDINATION', NULL, FALSE, TRUE, '2cc37edd-03ca-5dfd-9336-2ffbaab22596', TIMESTAMP '2026-06-10 09:00:00', TIMESTAMP '2026-06-10 09:00:00');

-- ---- announcement_target_tracks ----
-- from seed v19
INSERT INTO announcement_target_tracks (announcement_id, track_id) VALUES
('2ba8d401-2708-5a41-bee9-9a4307ddeec2', '8039cc28-1b76-556f-8bc2-2e544416d4c8');

-- ---- announcement_target_roles ----
-- from seed v19
INSERT INTO announcement_target_roles (announcement_id, role_name) VALUES
('bfa6ce27-0160-55df-bb9e-0dd1b8d0b04b', 'COORDINATOR'),
('bfa6ce27-0160-55df-bb9e-0dd1b8d0b04b', 'ADMIN');

-- ---- notification_templates ----
-- from seed v19
INSERT INTO notification_templates (id, type, subject_template, title_template, body_template, html_template, active, created_at, updated_at) VALUES
('952eca1a-ab97-5e92-96ab-866b087b212e', 'TEAM_INVITATION_SENT', 'You are invited to join {teamName}', 'Team invitation: {teamName}', '{inviterName} invited you to join {teamName} for {eventName}.', '<h2>Team invitation</h2><p>{inviterName} invited you to join <strong>{teamName}</strong> for {eventName}.</p><p><a href="{acceptUrl}">Accept invitation</a> · <a href="{rejectUrl}">Reject</a></p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('c5cc7858-c5b6-5517-a92c-432ce4a8c486', 'TEAM_INVITATION_ACCEPTED', '{memberName} accepted the invitation to join {teamName}', 'Invitation accepted', '{memberName} accepted the invitation to join {teamName}.', '<h2>Invitation accepted</h2><p>{memberName} accepted the invitation to join <strong>{teamName}</strong>.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('50b105c8-6f50-55de-a474-3d6db1098e84', 'TEAM_INVITATION_REJECTED', '{inviteeEmail} declined the invitation to join {teamName}', 'Invitation declined', '{inviteeEmail} declined the invitation to join {teamName}.', '<h2>Invitation declined</h2><p>{inviteeEmail} declined the invitation to join <strong>{teamName}</strong>.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('f1a972f8-0595-52d3-a8f7-d7f846a1a221', 'TEAM_JOIN_REQUEST_SENT', 'A student requested to join {teamName}', 'Team join request received', '{requesterName} requested to join {teamName}.', '<h2>Team join request</h2><p><strong>{requesterName}</strong> requested to join <strong>{teamName}</strong>.</p><p><a href="{acceptUrl}">Accept request</a> · <a href="{rejectUrl}">Reject</a></p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('3e4c55e0-4a4f-590c-bd82-62cc84d23304', 'TEAM_JOIN_REQUEST_ACCEPTED', 'Your request to join {teamName} was accepted', 'Join request accepted', 'Your request to join {teamName} was accepted.', '<h2>Join request accepted</h2><p>Your request to join <strong>{teamName}</strong> was accepted.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('96d923c7-2c05-5868-b6fc-c3d5d87cddab', 'TEAM_JOIN_REQUEST_REJECTED', 'Your request to join {teamName} was rejected', 'Join request rejected', 'Your request to join {teamName} was rejected.', '<h2>Join request rejected</h2><p>Your request to join <strong>{teamName}</strong> was rejected.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('9af21cce-22d0-54a6-bcf9-b2100a92c233', 'TEAM_REGISTERED', '{teamName} registered for {trackName}', 'Team registered', 'Your team {teamName} has registered for {trackName}.', '<h2>Team registered</h2><p>Your team <strong>{teamName}</strong> has registered for <strong>{trackName}</strong>.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('a74389b5-c068-5bf3-abe1-22c0d3e01df0', 'SUBMISSION_SUBMITTED', '{teamName} submitted deliverables', 'Submission submitted', '{teamName} submitted deliverables for {roundName}.', '<h2>Submission submitted</h2><p>{teamName} submitted deliverables for <strong>{roundName}</strong>.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('50780c37-c873-5c3a-aedc-d7dfeab41c92', 'SUBMISSION_UPDATED', '{teamName} updated submission', 'Submission updated', '{teamName} updated deliverables for {roundName}.', '<h2>Submission updated</h2><p>{teamName} updated deliverables for <strong>{roundName}</strong>.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('bce20f3e-f65e-593e-bd5d-ae97c14c8a99', 'ROUND_OPENED', '{roundName} is now open', 'Round opened', '{roundName} is open. Teams can now submit deliverables.', '<h2>Round opened</h2><p><strong>{roundName}</strong> is open. Teams can now submit deliverables.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('05532c52-31e9-55ec-80c9-ad07d710c384', 'ROUND_CLOSED', '{roundName} has been closed', 'Round closed', '{roundName} is now closed. Please wait for judging readiness.', '<h2>Round closed</h2><p><strong>{roundName}</strong> is now closed.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('2d696710-ecc8-56b2-9b1f-4cc16c0b86e9', 'SUBMISSION_LOCKED', 'Submissions locked for {roundName}', 'Submissions locked', 'Submissions for {roundName} have been locked. Further edits are disabled.', '<h2>Submissions locked</h2><p>Submissions for <strong>{roundName}</strong> have been locked. Further edits are disabled.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('403d11d0-b06d-5752-b9be-3d1769fea4dc', 'MENTOR_FEEDBACK_PUBLISHED', 'Mentor feedback is available for {teamName}', 'Mentor feedback published', 'Mentor feedback is available for {teamName}.', '<h2>Mentor feedback</h2><p>New mentor feedback is available for <strong>{teamName}</strong>.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('85de7c76-b067-5e83-bf4a-a15a8ddb6dc9', 'MENTOR_FEEDBACK', 'Mentor feedback is available for {teamName}', 'Mentor feedback published', 'Mentor feedback is available for {teamName}.', '<h2>Mentor feedback</h2><p>New mentor feedback is available for <strong>{teamName}</strong>.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('b5fc39ca-eabc-55b3-ae10-c33fa8e7fe94', 'JUDGE_ASSIGNED', 'You are assigned to judge {roundName}', 'Judge assignment', 'You have been assigned to judge submissions in {roundName}.', '<h2>Judge assignment</h2><p>You have been assigned to judge submissions in <strong>{roundName}</strong>.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('fa6f0529-7e2f-5862-92b3-90332ea5195b', 'ANNOUNCEMENT_PUBLISHED', 'New announcement: {announcementTitle}', 'Announcement published', 'A new announcement has been published for {eventName}.', '<h2>New announcement</h2><p>{announcementTitle}</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('d3fbe06f-4f60-5620-9fe0-d0edc991bde9', 'DEADLINE_REMINDER', 'Reminder: {deadlineName}', 'Deadline reminder', 'Reminder: {deadlineName} is coming soon.', '<h2>Deadline reminder</h2><p>{deadlineName} is coming soon.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('54e33d24-0a56-5a39-8e15-269ab3c140d6', 'SUBMISSION_REMINDER', 'Submission deadline reminder', 'Submission reminder', 'Please submit all deliverable links before the deadline.', '<h2>Submission reminder</h2><p>Please submit all deliverable links before the deadline.</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('695e388d-5036-5d99-b2fe-fc5da161748c', 'GENERAL', '{title}', 'General notification', '{body}', '<h2>{title}</h2><p>{body}</p>', TRUE, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00');

-- ---- notifications ----
-- from seed v19
INSERT INTO notifications (id, event_id, created_by, type, title, body, target_scope, target_id, channel, scheduled_at, sent_at, status, failure_reason, recipient_count, created_at) VALUES
('bbff9c58-861b-5fe9-8f45-6803e730cec7', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'GENERAL', 'Welcome to SEAL Summer', 'Welcome message sent to all participants.', 'ALL', NULL, 'BOTH', NULL, TIMESTAMP '2026-06-01 08:30:00', 'SENT', NULL, 35, TIMESTAMP '2026-06-01 08:30:00'),
('cbe4ff16-76a8-57ed-be6a-4903e4fd5d02', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'SUBMISSION_REMINDER', 'Submission deadline reminder', 'Please submit all deliverable links before the deadline.', 'TRACK', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 'EMAIL', TIMESTAMP '2026-06-17 09:00:00', NULL, 'SCHEDULED', NULL, 12, TIMESTAMP '2026-06-10 08:30:00'),
('0d63f9f3-c10a-573b-b0ea-5879dced647f', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '35fb4dd4-d4f0-5f08-b17f-856159cd2793', 'MENTOR_FEEDBACK', 'Mentor feedback published', 'Your mentor has published feedback for your submission.', 'TEAM', 'c8a7ea92-97b9-5d7d-b9a8-eb0243689cb0', 'BOTH', NULL, TIMESTAMP '2026-06-09 10:00:00', 'SENT', NULL, 4, TIMESTAMP '2026-06-09 10:00:00');

-- ---- notification_recipients ----
-- from seed v19
INSERT INTO notification_recipients (id, notification_id, user_id, delivered_at, read_at, created_at) VALUES
('14e1a130-39c5-53bb-a983-6e75cb80f5fd', 'bbff9c58-861b-5fe9-8f45-6803e730cec7', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', TIMESTAMP '2026-06-01 08:31:00', TIMESTAMP '2026-06-01 09:15:00', TIMESTAMP '2026-06-01 08:30:00'),
('70d78216-2fe9-590f-8fd4-caa4cb16c8fa', 'bbff9c58-861b-5fe9-8f45-6803e730cec7', '2af79072-be0e-59a6-a502-53f82d6bd9a3', TIMESTAMP '2026-06-01 08:31:00', NULL, TIMESTAMP '2026-06-01 08:30:00'),
('8aa069db-fc6c-55f7-ae3c-88e83cc58a4e', 'bbff9c58-861b-5fe9-8f45-6803e730cec7', '4d3b07b7-1a15-58db-8384-1729c866143e', TIMESTAMP '2026-06-01 08:31:00', NULL, TIMESTAMP '2026-06-01 08:30:00'),
('137809a6-112a-5395-ac8d-54eb7c8918b8', 'cbe4ff16-76a8-57ed-be6a-4903e4fd5d02', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', NULL, NULL, TIMESTAMP '2026-06-10 08:30:00'),
('f1ba4a99-89ec-597f-ac0a-562ce29e78f1', '0d63f9f3-c10a-573b-b0ea-5879dced647f', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', TIMESTAMP '2026-06-09 10:01:00', TIMESTAMP '2026-06-09 10:30:00', TIMESTAMP '2026-06-09 10:00:00'),
('dc940985-5cc2-527a-be8a-aa495c30782c', '0d63f9f3-c10a-573b-b0ea-5879dced647f', '2af79072-be0e-59a6-a502-53f82d6bd9a3', TIMESTAMP '2026-06-09 10:01:00', NULL, TIMESTAMP '2026-06-09 10:00:00'),
('9877efa0-a808-5c33-9ee3-568d642b1f28', '0d63f9f3-c10a-573b-b0ea-5879dced647f', '4d3b07b7-1a15-58db-8384-1729c866143e', TIMESTAMP '2026-06-09 10:01:00', NULL, TIMESTAMP '2026-06-09 10:00:00'),
('f29be7c4-f9e1-580a-a440-753fb559cb2e', '0d63f9f3-c10a-573b-b0ea-5879dced647f', '193f759b-f3d2-5dd4-8a19-06ba016e7e20', TIMESTAMP '2026-06-09 10:01:00', NULL, TIMESTAMP '2026-06-09 10:00:00');

-- ---- email_outbox ----
-- from seed v19
INSERT INTO email_outbox (id, notification_id, to_email, cc_emails, subject, html_body, status, attempt_count, scheduled_at, sent_at, last_error, idempotency_key, created_at, updated_at) VALUES
('31ed3b1b-5a6c-5bc3-8ed1-c3b4f7383806', '0d63f9f3-c10a-573b-b0ea-5879dced647f', 'student01@seal.test', 'student02@seal.test,student03@seal.test,student04@seal.test', 'Mentor feedback is available for Alpha Coders', '<h2>Mentor feedback</h2><p>Your mentor has published feedback for Alpha Coders.</p>', 'SENT', 1, NULL, TIMESTAMP '2026-06-09 10:01:00', NULL, 'notif-0d63f9f3-team-c8a7ea92-email', TIMESTAMP '2026-06-09 10:00:00', TIMESTAMP '2026-06-09 10:01:00'),
('ed26c259-9889-5a80-a2ad-5f490a2f9b44', 'cbe4ff16-76a8-57ed-be6a-4903e4fd5d02', 'student01@seal.test', 'student02@seal.test,student03@seal.test,student04@seal.test', 'Submission deadline reminder', '<h2>Submission reminder</h2><p>Please submit all deliverable links before the deadline.</p>', 'PENDING', 0, TIMESTAMP '2026-06-17 09:00:00', NULL, NULL, 'notif-cbe4ff16-track-web-alpha-email', TIMESTAMP '2026-06-10 08:30:00', TIMESTAMP '2026-06-10 08:30:00'),
('e179f4d9-78e4-5944-b0ea-287da3f22acd', 'bbff9c58-861b-5fe9-8f45-6803e730cec7', 'student02@seal.test', NULL, 'Welcome to SEAL Summer', '<h2>Welcome to SEAL Summer</h2><p>Welcome message sent to all participants.</p>', 'FAILED', 1, NULL, NULL, 'SMTP sandbox failure example', 'notif-bbff9c58-student02-email', TIMESTAMP '2026-06-01 08:30:00', TIMESTAMP '2026-06-01 08:32:00');

-- ---- email_delivery_logs ----
-- from seed v19
INSERT INTO email_delivery_logs (id, email_outbox_id, recipient_email, status, message, created_at) VALUES
('346b5b44-051a-5b3d-8b80-cf247d199fb1', '31ed3b1b-5a6c-5bc3-8ed1-c3b4f7383806', 'student01@seal.test', 'SENT', 'Seeded successful TEAM feedback email to leader with CC members.', TIMESTAMP '2026-06-09 10:01:00'),
('dcd70e8f-84c6-5cc9-92af-f70b4dc4b0e5', 'ed26c259-9889-5a80-a2ad-5f490a2f9b44', 'student01@seal.test', 'PENDING', 'Scheduled reminder waiting for dispatch.', TIMESTAMP '2026-06-10 08:30:00'),
('a0ae0764-4089-5440-97c5-e60cf40a7c29', 'e179f4d9-78e4-5944-b0ea-287da3f22acd', 'student02@seal.test', 'FAILED', 'SMTP sandbox failure example.', TIMESTAMP '2026-06-01 08:32:00');

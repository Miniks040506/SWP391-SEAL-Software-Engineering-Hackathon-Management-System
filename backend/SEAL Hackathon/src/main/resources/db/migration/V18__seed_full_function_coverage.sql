-- ==========================================================================
-- V18__seed_full_function_coverage.sql
-- Extends V17 with disposable happy-path fixtures and principal negative
-- states. The original Fable inventory counted 267 REST endpoints; the
-- current controller/OpenAPI inventory contains 300 operations. V19 adds
-- the remaining state/filter/error fixtures, while docs/demo-test-v19
-- supplies the revised 300-operation execution matrix.
--
-- Sections:
--   A. Free students (student57..69) + special users (pending2 / deactivate.me)
--      -> createTeam, inviteMember, joinByCode, join-requests, approve/reject
--         user, deactivateUser can all run without touching graded fixtures.
--   B. Sandbox Wolves team (FORMING, no track) -> destructive team ops
--      (updateTeam, transferLeader, removeMember, leaveTeam, toggleJoinCode,
--       registerTeamForTrack happy path, deleteTeam at the very end).
--   C. Spring Starters gets a 3rd member -> min-member rule satisfied.
--   D. Approval Reject Crew (2nd PENDING_APPROVAL team) -> rejectRegistration
--      while Approval Pending Crew stays reserved for approveRegistration.
--   E. LIVE calibration round (window open NOW-1d .. NOW+6d) with benchmark
--      for all 5 active Summer criteria -> getScoreSheet / submitCalibrationScores
--      by judge1/judge5; judge3 pre-scored so distribution has data.
--   F. Final-round grading fixtures: judge assignments on the Final Demo Round
--      (judge1 web, judge3 AI, judge5 mobile = disposable for DELETE tests).
--   G. Final Draft Crew DRAFT submission in the OPEN final round
--      -> saveSubmissionDraft/updateSubmission/addLinks/submitExistingSubmission.
--   H. DRAFT notification (send-now) + sacrificial notifications for
--      student66 -> markAsRead / markAllAsRead / deleteNotification / clear.
--   I. Expired-but-OPEN round on the Fall draft event
--      -> RoundDeadlineTransitionService + closeRound negative/positive.
--   J. Disposable events (Fall 2027 = DELETE target, Spring 2027 = cancel +
--      advance-status target).
--   K. Disposable rows: track, event-criteria, scoring criterion (inactive),
--      prize (rank 4), advance rules on final round, mentor assignment,
--      DRAFT mentor feedback -> update/delete tests never damage core data.
--   L. Second live PENDING invitations -> accept vs reject vs cancel each
--      have their own row.
--
-- All "live" windows are NOW()-relative so the data does not decay.
-- Test password for every user remains: Password@123
-- ==========================================================================

-- ---------------------------------------------------------------------
-- A. Free students and special users.
--    student57 -> createTeam            student58 -> inviteMember target
--    student59 -> joinByCode target     student60 -> join-request creator
--    student61..64 -> Sandbox Wolves    student65 -> Spring Starters 3rd member
--    student66 -> notification sacrifice user (do NOT use in team flows)
--    student67..69 -> Approval Reject Crew
--    pending2.student -> rejectUser     deactivate.me -> deactivateUser
--    student72..74 -> isolated Final Draft Crew for final-round submission
-- ---------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, email_verified_at, email_verification_token, email_verification_expires_at, oauth_provider, oauth_provider_id, password_reset_token, password_reset_expires_at, avatar_url, last_login_at, failed_login_count, locked_until, created_at, updated_at) VALUES
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000057', 'student57@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 57', '0914000057', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2057', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000058', 'student58@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 58', '0914000058', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2058', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000059', 'student59@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 59', '0914000059', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2059', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000060', 'student60@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 60', '0914000060', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2060', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000061', 'student61@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 61', '0914000061', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2061', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000062', 'student62@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 62', '0914000062', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2062', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000063', 'student63@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 63', '0914000063', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2063', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000064', 'student64@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 64', '0914000064', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2064', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000065', 'student65@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 65', '0914000065', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2065', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000066', 'student66@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 66', '0914000066', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2066', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000067', 'student67@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 67', '0914000067', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2067', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000068', 'student68@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 68', '0914000068', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2068', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000069', 'student69@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 69', '0914000069', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2069', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000070', 'pending2.student@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Pending Student Two', '0914000070', 'STUDENT', 'PENDING_APPROVAL', NOW() - INTERVAL '1 day', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Pending%20Two', NULL, 0, NULL, NOW() - INTERVAL '1 day', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000071', 'deactivate.me@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Deactivate Target', '0914000071', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Deactivate%20Target', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000072', 'student72@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 72', '0914000072', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2072', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000073', 'student73@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 73', '0914000073', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2073', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW()),
                                                                                                                                                                                                                                                                                                                                      ('18000000-0000-4000-8000-000000000074', 'student74@seal.test', '$2a$10$7DFpP6OzFw2Fofpag0651eNa4vPtMmGt.SSXXvqeBl1ANTiyjvmeS', 'Student 74', '0914000074', 'STUDENT', 'ACTIVE', NOW() - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, 'https://api.dicebear.com/7.x/initials/svg?seed=Student%2074', NULL, 0, NULL, NOW() - INTERVAL '10 days', NOW());

INSERT INTO student_profile (id, student_type, student_code, university_name, major, graduation_year, verified_at, user_id) VALUES
                                                                                                                                ('18000000-0000-4000-8000-000000000157', 'FPT',      'SE220057', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000057'),
                                                                                                                                ('18000000-0000-4000-8000-000000000158', 'FPT',      'SE220058', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000058'),
                                                                                                                                ('18000000-0000-4000-8000-000000000159', 'EXTERNAL', 'EXT22059', 'HCMUT',          'Computer Science',     2027, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000059'),
                                                                                                                                ('18000000-0000-4000-8000-000000000160', 'FPT',      'SE220060', 'FPT University', 'AI Engineering',       2029, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000060'),
                                                                                                                                ('18000000-0000-4000-8000-000000000161', 'FPT',      'SE220061', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000061'),
                                                                                                                                ('18000000-0000-4000-8000-000000000162', 'FPT',      'SE220062', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000062'),
                                                                                                                                ('18000000-0000-4000-8000-000000000163', 'EXTERNAL', 'EXT22063', 'UIT',            'Computer Science',     2027, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000063'),
                                                                                                                                ('18000000-0000-4000-8000-000000000164', 'FPT',      'SE220064', 'FPT University', 'Information Systems',  2029, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000064'),
                                                                                                                                ('18000000-0000-4000-8000-000000000165', 'FPT',      'SE220065', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000065'),
                                                                                                                                ('18000000-0000-4000-8000-000000000166', 'FPT',      'SE220066', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000066'),
                                                                                                                                ('18000000-0000-4000-8000-000000000167', 'FPT',      'SE220067', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000067'),
                                                                                                                                ('18000000-0000-4000-8000-000000000168', 'EXTERNAL', 'EXT22068', 'UEH',            'Digital Business',     2027, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000068'),
                                                                                                                                ('18000000-0000-4000-8000-000000000169', 'FPT',      'SE220069', 'FPT University', 'AI Engineering',       2029, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000069'),
                                                                                                                                ('18000000-0000-4000-8000-000000000170', 'FPT',      'SE220070', 'FPT University', 'Software Engineering', 2029, NULL,                       '18000000-0000-4000-8000-000000000070'),
                                                                                                                                ('18000000-0000-4000-8000-000000000171', 'FPT',      'SE220071', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000071'),
                                                                                                                                ('18000000-0000-4000-8000-000000000172', 'FPT',      'SE220072', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000072'),
                                                                                                                                ('18000000-0000-4000-8000-000000000173', 'FPT',      'SE220073', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000073'),
                                                                                                                                ('18000000-0000-4000-8000-000000000174', 'FPT',      'SE220074', 'FPT University', 'Software Engineering', 2028, NOW() - INTERVAL '10 days', '18000000-0000-4000-8000-000000000074');

-- ---------------------------------------------------------------------
-- B. Sandbox Wolves: FORMING team with NO track. 4 members so that
--    removeMember / leaveTeam can each run once and the team still has
--    >= 3 members for the registerTeamForTrack happy path afterwards.
-- ---------------------------------------------------------------------
INSERT INTO teams (id, track_id, leader_id, name, join_code, join_code_enabled, project_title, description, status, member_count, registered_at, created_at, updated_at, registration_status, registration_reviewed_at, registration_reviewed_by, registration_rejection_reason) VALUES
    ('18000000-0000-4000-8000-000000000201', NULL, '18000000-0000-4000-8000-000000000061', 'Sandbox Wolves', 'SBOX26', TRUE, 'Sandbox Playground', 'Disposable team reserved for destructive team-management tests.', 'FORMING', 4, NULL, NOW() - INTERVAL '3 days', NOW(), NULL, NULL, NULL, NULL);

INSERT INTO team_member (id, role, joined_at, left_at, left_reason, user_id, team_id) VALUES
                                                                                          ('18000000-0000-4000-8000-000000000211', 'LEADER', NOW() - INTERVAL '3 days', NULL, NULL, '18000000-0000-4000-8000-000000000061', '18000000-0000-4000-8000-000000000201'),
                                                                                          ('18000000-0000-4000-8000-000000000212', 'MEMBER', NOW() - INTERVAL '3 days', NULL, NULL, '18000000-0000-4000-8000-000000000062', '18000000-0000-4000-8000-000000000201'),
                                                                                          ('18000000-0000-4000-8000-000000000213', 'MEMBER', NOW() - INTERVAL '3 days', NULL, NULL, '18000000-0000-4000-8000-000000000063', '18000000-0000-4000-8000-000000000201'),
                                                                                          ('18000000-0000-4000-8000-000000000214', 'MEMBER', NOW() - INTERVAL '3 days', NULL, NULL, '18000000-0000-4000-8000-000000000064', '18000000-0000-4000-8000-000000000201');

-- ---------------------------------------------------------------------
-- C. Spring Starters third member (min_members = 3 rule).
-- ---------------------------------------------------------------------
INSERT INTO team_member (id, role, joined_at, left_at, left_reason, user_id, team_id) VALUES
    ('18000000-0000-4000-8000-000000000221', 'MEMBER', NOW() - INTERVAL '2 days', NULL, NULL, '18000000-0000-4000-8000-000000000065', '08162ff2-bae7-58c5-ac7d-549a21277b29');

UPDATE teams SET member_count = 3, updated_at = NOW()
WHERE id = '08162ff2-bae7-58c5-ac7d-549a21277b29';

-- ---------------------------------------------------------------------
-- D. Approval Reject Crew: second PENDING_APPROVAL registration so
--    approve (Approval Pending Crew) and reject (this team) both work.
-- ---------------------------------------------------------------------
INSERT INTO teams (id, track_id, leader_id, name, join_code, join_code_enabled, project_title, description, status, member_count, registered_at, created_at, updated_at, registration_status, registration_reviewed_at, registration_reviewed_by, registration_rejection_reason) VALUES
    ('18000000-0000-4000-8000-000000000202', '6b1a064c-f51d-58f0-aec5-db7cd7e57716', '18000000-0000-4000-8000-000000000067', 'Approval Reject Crew', 'REJX26', TRUE, 'Timetable Optimizer', 'Second pending registration reserved for the coordinator REJECT test.', 'REGISTERED', 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 days', NOW(), 'PENDING_APPROVAL', NULL, NULL, NULL);

INSERT INTO team_member (id, role, joined_at, left_at, left_reason, user_id, team_id) VALUES
                                                                                          ('18000000-0000-4000-8000-000000000215', 'LEADER', NOW() - INTERVAL '4 days', NULL, NULL, '18000000-0000-4000-8000-000000000067', '18000000-0000-4000-8000-000000000202'),
                                                                                          ('18000000-0000-4000-8000-000000000216', 'MEMBER', NOW() - INTERVAL '4 days', NULL, NULL, '18000000-0000-4000-8000-000000000068', '18000000-0000-4000-8000-000000000202'),
                                                                                          ('18000000-0000-4000-8000-000000000217', 'MEMBER', NOW() - INTERVAL '4 days', NULL, NULL, '18000000-0000-4000-8000-000000000069', '18000000-0000-4000-8000-000000000202');

-- Dedicated approved Web track team. This keeps the final DRAFT fixture
-- independent from Beta Builders and any submission created during prior tests.
INSERT INTO teams (id, track_id, leader_id, name, join_code, join_code_enabled, project_title, description, status, member_count, registered_at, created_at, updated_at, registration_status, registration_reviewed_at, registration_reviewed_by, registration_rejection_reason) VALUES
    ('18000000-0000-4000-8000-000000000203', '8039cc28-1b76-556f-8bc2-2e544416d4c8', '18000000-0000-4000-8000-000000000072', 'Final Draft Crew', 'FDRAFT26', TRUE, 'Accessible Final Demo', 'Isolated team reserved for final-round draft, link, upload, and submit tests.', 'COMPETING', 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 days', NOW(), 'APPROVED', NOW() - INTERVAL '2 days', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', NULL);

INSERT INTO team_member (id, role, joined_at, left_at, left_reason, user_id, team_id) VALUES
                                                                                          ('18000000-0000-4000-8000-000000000218', 'LEADER', NOW() - INTERVAL '5 days', NULL, NULL, '18000000-0000-4000-8000-000000000072', '18000000-0000-4000-8000-000000000203'),
                                                                                          ('18000000-0000-4000-8000-000000000219', 'MEMBER', NOW() - INTERVAL '5 days', NULL, NULL, '18000000-0000-4000-8000-000000000073', '18000000-0000-4000-8000-000000000203'),
                                                                                          ('18000000-0000-4000-8000-000000000220', 'MEMBER', NOW() - INTERVAL '5 days', NULL, NULL, '18000000-0000-4000-8000-000000000074', '18000000-0000-4000-8000-000000000203');

-- ---------------------------------------------------------------------
-- E. LIVE calibration round for SEAL Summer 2026: window is open NOW so
--    judges can actually call submitCalibrationScores. Benchmark covers all
--    5 active Summer event criteria. Judge3 intentionally has no scores and
--    must complete this calibration before final-round grading.
--    (The old round 6438c4af stays closed & unpublished: use it for the
--     publishDistribution happy path.)
-- ---------------------------------------------------------------------
INSERT INTO calibration_rounds (id, event_id, sample_submission_id, benchmark_scores, description, start_at, end_at, is_mandatory, distribution_published_at) VALUES
    ('18000000-0000-4000-8000-000000000301', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '4a000000-0000-4000-8000-000000000101',
     '{"853acfed-a265-5931-af69-456c4d9a522a": 8.0, "9fa11673-4fb2-5f00-9641-30f924093617": 7.5, "42a9272d-fc7b-524d-83b2-610640100f0c": 7.5, "7fee79e5-ec63-5699-9428-3e25b411885e": 8.0, "74ff8b44-3bbc-5747-a232-1e962a4089c1": 7.0}'::jsonb,
     'LIVE calibration before final-round scoring. Window is currently open.',
     NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', TRUE, NULL);

-- ---------------------------------------------------------------------
-- F. Final Demo Round judge assignments. judge5 -> mobile is DISPOSABLE:
--    it has no submissions to lose, so DELETE /judge-assignments tests use it.
-- ---------------------------------------------------------------------
INSERT INTO round_judge_assignments (id, round_id, judge_id, track_id, scoring_progress, total_to_score, assigned_by, assigned_at, reminded_at) VALUES
                                                                                                                                                    ('18000000-0000-4000-8000-000000000321', 'd7104abc-8192-5a20-bcd8-4b99748297bb', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 0, 2, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', NOW() - INTERVAL '1 day', NULL),
                                                                                                                                                    ('18000000-0000-4000-8000-000000000322', 'd7104abc-8192-5a20-bcd8-4b99748297bb', '1aea112d-a34e-54a5-95f9-9a68f1aca4ef', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', 0, 1, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', NOW() - INTERVAL '1 day', NULL),
                                                                                                                                                    ('18000000-0000-4000-8000-000000000323', 'd7104abc-8192-5a20-bcd8-4b99748297bb', '17000000-0000-4000-8000-000000000741', 'bacf7939-4158-55ee-9376-fc50c9b855e2', 0, 0, '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', NOW() - INTERVAL '1 day', NULL);

WITH required_scores AS (
    SELECT DISTINCT
        calibration.id AS calibration_round_id,
        assignment.judge_id,
        benchmark.key::uuid AS event_criteria_id,
        benchmark.value::real AS value
    FROM calibration_rounds calibration
    JOIN submissions sample ON sample.id = calibration.sample_submission_id
    JOIN round_judge_assignments assignment
      ON assignment.round_id = sample.round_id
     AND assignment.judge_id <> '1aea112d-a34e-54a5-95f9-9a68f1aca4ef'
    CROSS JOIN LATERAL jsonb_each_text(calibration.benchmark_scores) benchmark
    WHERE calibration.id = '18000000-0000-4000-8000-000000000301'
)
INSERT INTO calibration_scores (
    id, calibration_round_id, judge_id, event_criteria_id,
    value, deviation_from_benchmark, judge_comment, scored_at
)
SELECT
    gen_random_uuid(),
    calibration_round_id,
    judge_id,
    event_criteria_id,
    value,
    0.0,
    'Summer 2026 completed final calibration fixture.',
    NOW() - INTERVAL '12 hours'
FROM required_scores;

-- ---------------------------------------------------------------------
-- G. Final Draft Crew DRAFT submission in the OPEN Final Demo Round.
--    Delta Vision keeps NO final submission (reserved for the
--    submitDeliverables "create new" happy path).
-- ---------------------------------------------------------------------
INSERT INTO submissions (id, team_id, round_id, note, submitted_at, updated_at, status, submission_number) VALUES
    ('18000000-0000-4000-8000-000000000401', '18000000-0000-4000-8000-000000000203', 'd7104abc-8192-5a20-bcd8-4b99748297bb', 'Final Draft Crew final-round DRAFT (edit/submit-me).', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', 'DRAFT', 1);

INSERT INTO submission_links (id, submission_id, link_type, url, label, storage_provider, object_key, original_file_name, content_type, file_size_bytes, repo_metadata, is_primary, display_order, created_at, updated_at) VALUES
                                                                                                                                                                                                                               ('18000000-0000-4000-8000-000000000411', '18000000-0000-4000-8000-000000000401', 'REPOSITORY', 'https://github.com/seal-demo/final-draft-crew', 'Final Repository (draft)', 'GITHUB', NULL, NULL, NULL, NULL, NULL, TRUE, 1, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
                                                                                                                                                                                                                               ('18000000-0000-4000-8000-000000000412', '18000000-0000-4000-8000-000000000401', 'DEMO',       'https://final-draft.demo.seal.test',           'Final Demo (draft)',       'EXTERNAL_URL', NULL, NULL, NULL, NULL, NULL, TRUE, 2, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');

-- ---------------------------------------------------------------------
-- H. Notifications:
--    - one DRAFT notification -> POST /notifications/{id}/send
--    - two SENT notifications whose only recipient is student66 ->
--      markAsRead / markAllAsRead / deleteNotification / clear tests
--      never remove anybody else's inbox rows.
-- ---------------------------------------------------------------------
INSERT INTO notifications (id, event_id, created_by, type, title, body, target_scope, target_id, channel, scheduled_at, sent_at, status, failure_reason, recipient_count, created_at) VALUES
                                                                                                                                                                                          ('18000000-0000-4000-8000-000000000501', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'GENERAL', 'Draft notification (send me now)', 'Draft notification reserved for the send-now endpoint test.', 'TRACK', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 'IN_APP', NULL, NULL, 'DRAFT', NULL, NULL, NOW() - INTERVAL '1 hour'),
                                                                                                                                                                                          ('18000000-0000-4000-8000-000000000502', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'GENERAL', 'Inbox item one for Student 66',    'Sacrificial inbox row #1 (mark me as read).',                 'USER', '18000000-0000-4000-8000-000000000066', 'IN_APP', NULL, NOW() - INTERVAL '2 days', 'SENT', NULL, 1, NOW() - INTERVAL '2 days'),
                                                                                                                                                                                          ('18000000-0000-4000-8000-000000000503', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'GENERAL', 'Inbox item two for Student 66',    'Sacrificial inbox row #2 (delete me).',                       'USER', '18000000-0000-4000-8000-000000000066', 'IN_APP', NULL, NOW() - INTERVAL '1 day',  'SENT', NULL, 1, NOW() - INTERVAL '1 day');

INSERT INTO notification_recipients (id, notification_id, user_id, delivered_at, read_at, created_at) VALUES
                                                                                                          ('18000000-0000-4000-8000-000000000511', '18000000-0000-4000-8000-000000000502', '18000000-0000-4000-8000-000000000066', NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '2 days'),
                                                                                                          ('18000000-0000-4000-8000-000000000512', '18000000-0000-4000-8000-000000000503', '18000000-0000-4000-8000-000000000066', NOW() - INTERVAL '1 day',  NULL, NOW() - INTERVAL '1 day');

-- ---------------------------------------------------------------------
-- I. Expired-but-still-OPEN round on the Fall draft event: the scheduler
--    function transitionExpiredOpenRoundsToPendingLock() finds it, and it
--    doubles as a closeRound() target that does not touch live rounds.
--    Constraints: start < deadline <= end, judging <= end.
-- ---------------------------------------------------------------------
INSERT INTO rounds (id, event_id, name, order_index, description, submission_deadline, judging_deadline, status, is_final, submission_locked_at, grading_locked_at, advancement_confirmed_at, start_at, end_at) VALUES
    ('18000000-0000-4000-8000-000000000601', '9e37549a-3993-5299-b782-ce4f57e92f75', 'Expired Open Round', 2, 'OPEN round whose submission deadline has already passed (scheduler fixture).', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '1 day', 'OPEN', FALSE, NULL, NULL, NULL, NOW() - INTERVAL '3 days', NOW() + INTERVAL '1 day');

-- ---------------------------------------------------------------------
-- J. Disposable events. Fall 2027 exists ONLY to be deleted; Spring 2027
--    exists ONLY to be advanced/cancelled. Both DRAFT, owned by coordinator2.
-- ---------------------------------------------------------------------
INSERT INTO hackathon_events (id, name, slug, season, year, description, banner_url, registration_open, registration_close, status, result_published_at, created_at, update_at, created_by, completed_at, variance_threshold_points, competition_start_at, competition_end_at) VALUES
                                                                                                                                                                                                                                                                                   ('18000000-0000-4000-8000-000000000701', 'SEAL Fall 2027 (Delete Me)',   'seal-fall-2027-delete-me',   'FALL',   2027, 'Disposable DRAFT event reserved for the deleteEvent test.',              NULL, TIMESTAMP '2027-09-01 08:00:00', TIMESTAMP '2027-09-30 23:59:00', 'DRAFT', NULL, NOW(), NOW(), '2cc37edd-03ca-5dfd-9336-2ffbaab22596', NULL, 3.00, TIMESTAMP '2027-10-01 08:00:00', TIMESTAMP '2027-10-20 23:59:00'),
                                                                                                                                                                                                                                                                                   ('18000000-0000-4000-8000-000000000702', 'SEAL Spring 2027 (Cancel Me)', 'seal-spring-2027-cancel-me', 'SPRING', 2027, 'Disposable DRAFT event reserved for advance-status and cancel tests.',   NULL, TIMESTAMP '2027-03-01 08:00:00', TIMESTAMP '2027-03-31 23:59:00', 'DRAFT', NULL, NOW(), NOW(), '2cc37edd-03ca-5dfd-9336-2ffbaab22596', NULL, 3.00, TIMESTAMP '2027-04-01 08:00:00', TIMESTAMP '2027-04-20 23:59:00');

-- ---------------------------------------------------------------------
-- K. Disposable rows so UPDATE/DELETE tests never destroy core fixtures.
-- ---------------------------------------------------------------------
-- K1. Second track on the Fall draft event: deleteTrack target (no teams).
INSERT INTO tracks (id, name, description, required_link_types, max_teams, min_members, max_members, display_order, event_id) VALUES
    ('18000000-0000-4000-8000-000000000801', 'Throwaway Track', 'Disposable track reserved for updateTrack/deleteTrack tests.', '["REPOSITORY", "DEMO"]', 10, 3, 5, 2, '9e37549a-3993-5299-b782-ce4f57e92f75');

-- K2. Custom event-criterion on the Fall draft event: update/delete target.
INSERT INTO event_criteria (id, event_id, criteria_id, name_override, description_override, rubric_override, weight_override, max_score_override, is_technical_override, is_active, applies_to_round_ids, display_order) VALUES
    ('18000000-0000-4000-8000-000000000802', '9e37549a-3993-5299-b782-ce4f57e92f75', NULL, 'Draft Custom Criterion', 'Disposable custom criterion for update/delete tests.', 'Any rubric.', 1.0, 10, FALSE, TRUE, NULL, 1);

-- K3. Inactive, unused scoring-criteria template: activate -> deactivate ->
--     delete can run in a full cycle without touching real templates.
INSERT INTO scoring_criteria (id, name, description, rubric, max_score, default_weight, category, is_technical, is_default, is_active, created_at) VALUES
    ('18000000-0000-4000-8000-000000000803', 'Deprecated Sample Criterion', 'Unused template reserved for activate/deactivate/delete tests.', 'N/A', 10, 1.0, 'PROCESS', FALSE, FALSE, FALSE, NOW());

-- K4. Disposable prize (web track, rank 4) -> updatePrize/deletePrize target;
--     ranks 1-3 stay intact for assign-from-ranking and award tests.
INSERT INTO prizes (id, event_id, track_id, rank_position, title, description, value, currency, sponsor_name, awarded_team_id, awarded_at) VALUES
    ('18000000-0000-4000-8000-000000000804', '9d1822f7-ec66-52fe-8569-4faeb6b0a85b', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 4, 'Consolation Prize (Disposable)', 'Reserved for updatePrize/deletePrize tests.', 500000.00, 'VND', 'PDP', NULL, NULL);

-- K5. Advance rules on the Final Demo Round: one real TOP_N (used by the
--     final advancement chain) and one disposable WILDCARD (update/delete).
INSERT INTO advance_rules (id, round_id, track_id, rule_type, value, priority, description) VALUES
                                                                                                ('18000000-0000-4000-8000-000000000805', 'd7104abc-8192-5a20-bcd8-4b99748297bb', NULL, 'TOP_N',    1, 1, 'Final round: champion per track.'),
                                                                                                ('18000000-0000-4000-8000-000000000806', 'd7104abc-8192-5a20-bcd8-4b99748297bb', NULL, 'WILDCARD', 1, 9, 'Disposable rule reserved for update/delete advance-rule tests.');

-- K6. Disposable mentor assignment (mentor3 -> Spring backend track).
INSERT INTO mentor_assignment (id, user_id, track_id, assigned_by, note, assigned_at) VALUES
    ('18000000-0000-4000-8000-000000000807', '6191c31a-d587-5ace-a357-99fa216e4e95', '6b1a064c-f51d-58f0-aec5-db7cd7e57716', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'Disposable assignment reserved for the remove-mentor test.', NOW() - INTERVAL '1 day');

-- K7. Second DRAFT mentor feedback (mentor1 on Beta Builders) -> DELETE
--     target; the older draft e2a58d43 stays for update + publish.
INSERT INTO mentor_feedbacks (id, team_id, submission_id, mentor_user_id, round_id, content, category, visibility, is_visible_to_team, created_at, updated_at, published_at) VALUES
    ('18000000-0000-4000-8000-000000000808', '116fd0f3-5388-5a49-8439-3464b4bc8d3d', 'c28dc162-a53e-5608-9b49-03f1771979f9', '35fb4dd4-d4f0-5f08-b17f-856159cd2793', 'd92484b1-2090-5067-87d2-ec03f227fc96', 'Draft note reserved for the delete-feedback test.', 'GENERAL', 'DRAFT', FALSE, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL);

-- ---------------------------------------------------------------------
-- L. Live PENDING invitations so accept / reject / cancel each own a row:
--    - accept:  token-pending-alpha-live      (V17, Alpha -> oauth.google)
--    - reject:  token-pending-beta-reject     (Beta -> reset.expired)
--    - cancel:  token-pending-gamma-cancel    (Gamma -> student66)
-- ---------------------------------------------------------------------
INSERT INTO team_invitations (id, team_id, invited_by, invite_email, invitee_user_id, token, status, type, message, expires_at, created_at, respond_at, response_reason) VALUES
                                                                                                                                                                             ('18000000-0000-4000-8000-000000000901', '116fd0f3-5388-5a49-8439-3464b4bc8d3d', '84a84e8d-b13d-5865-b50c-6a9a98d7ae63', 'reset.expired@seal.test', '17000000-0000-4000-8000-000000000705', 'token-pending-beta-reject',  'PENDING', 'INVITATION', 'Join Beta Builders as the 5th member?',            NOW() + INTERVAL '7 days', NOW(), NULL, NULL),
                                                                                                                                                                             ('18000000-0000-4000-8000-000000000902', 'a5133b30-7943-5acc-82fb-85c1f52c6098', 'a9d87494-eb4e-5369-bfbd-9bfdc4c8d515', 'student66@seal.test',     '18000000-0000-4000-8000-000000000066', 'token-pending-gamma-cancel', 'PENDING', 'INVITATION', 'Placeholder invitation reserved for the cancel test.', NOW() + INTERVAL '7 days', NOW(), NULL, NULL);

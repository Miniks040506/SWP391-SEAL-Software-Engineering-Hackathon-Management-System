-- ==========================================================================
-- V4__seed_m3_team_participation.sql
-- Flyway seed migration for Module 3 - Team & Participation Management.
-- Auto-assembled from manual seeds v19 (base) + v20 (extra volume)
-- + v21 (new-feature data), grouped by module and ordered by FK deps.
-- Runs on the V1 baseline schema. Requires ddl-auto = validate | none.
-- Test password for all users: Password@123
-- ==========================================================================

-- ---- teams ----
-- from seed v19
INSERT INTO teams (id, track_id, leader_id, name, join_code, join_code_enabled, project_title, description, status, member_count, registered_at, created_at, updated_at) VALUES
('c8a7ea92-97b9-5d7d-b9a8-eb0243689cb0', '8039cc28-1b76-556f-8bc2-2e544416d4c8', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', 'Alpha Coders', 'ALPHA26', TRUE, 'Smart queue management platform', 'Full-stack platform for campus service queues.', 'COMPETING', 4, TIMESTAMP '2026-06-01 10:00:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('116fd0f3-5388-5a49-8439-3464b4bc8d3d', '8039cc28-1b76-556f-8bc2-2e544416d4c8', '84a84e8d-b13d-5865-b50c-6a9a98d7ae63', 'Beta Builders', 'BETA26', TRUE, 'CampusEats Ordering', 'Campus food ordering and pickup optimization.', 'COMPETING', 4, TIMESTAMP '2026-06-02 10:00:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('a5133b30-7943-5acc-82fb-85c1f52c6098', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', 'a9d87494-eb4e-5369-bfbd-9bfdc4c8d515', 'Gamma AI', 'GAMMA26', TRUE, 'RAG Study Assistant', 'RAG assistant for course material search.', 'COMPETING', 4, TIMESTAMP '2026-06-03 10:00:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('0ec99158-0ea1-5160-a533-5ecf065b47b8', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', '90feb779-4bca-5d88-982b-b2325804cbb1', 'Delta Vision', 'DELTA26', TRUE, 'AI Code Review Bot', 'AI-assisted code review and learning feedback.', 'REGISTERED', 3, TIMESTAMP '2026-06-04 10:00:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('55705f79-5844-5a94-a74c-53f75aa37dee', 'bacf7939-4158-55ee-9376-fc50c9b855e2', 'ceca3872-33f4-56a9-90d0-2373d56e92b6', 'Mobile Ninjas', 'MOBILE26', TRUE, 'Event Companion App', 'Mobile app for hackathon schedule and notification.', 'REGISTERED', 3, TIMESTAMP '2026-06-05 10:00:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('08162ff2-bae7-58c5-ac7d-549a21277b29', '6b1a064c-f51d-58f0-aec5-db7cd7e57716', 'b8161300-4a8a-5e55-a3b7-9dfe80877886', 'Spring Starters', 'SPRING26', TRUE, 'Secure API Starter', 'Team forming for Spring event.', 'FORMING', 2, NULL, TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('c3942d11-0e5f-5007-b4e6-418fe6bac396', '24851727-7c4f-5389-9d8e-b00d69d8ce0e', '2af79072-be0e-59a6-a502-53f82d6bd9a3', 'Legacy Web Winners', 'LW2025', TRUE, 'Clinic Booking System', 'Completed winning web project.', 'WINNER', 4, TIMESTAMP '2025-03-10 10:00:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('c381d1b1-c595-5810-9f7c-671e690e9eae', '24851727-7c4f-5389-9d8e-b00d69d8ce0e', '1eb11a23-5b1f-5841-9ea4-b365ab420f88', 'Legacy Web Runner', 'LR2025', TRUE, 'Learning Analytics Dashboard', 'Completed runner-up web project.', 'ADVANCED', 4, TIMESTAMP '2025-03-11 10:00:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('cfddde8d-ccef-534f-ad54-2571ebe147dd', '5e63285e-769c-5ad2-8728-c0d335433811', 'f4f25d7d-be51-557d-b6ca-bef956e4bbab', 'Legacy AI Winners', 'LA2025', TRUE, 'Vietnamese Legal RAG', 'Completed winning AI project.', 'WINNER', 4, TIMESTAMP '2025-03-12 10:00:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00'),
('44d64c0a-7a15-5cd1-95f2-369b96c1f949', '5e63285e-769c-5ad2-8728-c0d335433811', '931e509f-2b37-5c88-9bf0-ce93614f8828', 'Legacy AI Runner', 'LAR2025', TRUE, 'Traffic Sign Detector', 'Completed runner-up AI project.', 'ADVANCED', 4, TIMESTAMP '2025-03-13 10:00:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-10 09:00:00');

-- from seed v20
INSERT INTO teams (id, track_id, leader_id, name, join_code, join_code_enabled, project_title, description, status, member_count, registered_at, created_at, updated_at) VALUES
('48b12ed9-38e9-526e-a7eb-4d4ffab99866', '8039cc28-1b76-556f-8bc2-2e544416d4c8', '6658c13d-3e97-556b-abd2-ceb883fcc7df', 'Vanguard Squad', 'APT0026', TRUE, 'Vanguard Project', 'Generated test team 0 for WEB track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00'),
('0744eaa0-536f-5a7d-b3e5-1f5ca75864c2', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 'a6074f37-925c-5df7-86c6-32a22f437cb1', 'Quantum Squad', 'APT0126', TRUE, 'Quantum Project', 'Generated test team 1 for WEB track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00'),
('13a3ff77-6ea7-5d9b-9432-ef84e8db75e9', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 'a202c560-e8f0-5a13-88a6-18fc1a68bcac', 'Nebula Squad', 'APT0226', TRUE, 'Nebula Project', 'Generated test team 2 for WEB track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00'),
('fb4f6299-a38e-591f-8b82-da200fec409b', '8039cc28-1b76-556f-8bc2-2e544416d4c8', 'eb8d0bab-24e3-5f1c-bca4-6be39b8bc898', 'Pixel Squad', 'APT0326', TRUE, 'Pixel Project', 'Generated test team 3 for WEB track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00'),
('6940d96e-1ed6-59d7-b25d-2f3dc521752e', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', '1c1e7a2b-18fc-5099-9ba6-bbba2c5e0ab9', 'Cipher Squad', 'APT0426', TRUE, 'Cipher Project', 'Generated test team 4 for AI track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00'),
('80e2d511-f65b-55c2-8ed2-94cdc3585254', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', 'd8e76c1b-f79f-5239-a485-d646f1ed0a12', 'Forge Squad', 'APT0526', TRUE, 'Forge Project', 'Generated test team 5 for AI track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00'),
('d68b533f-34bc-5925-a116-e47ea6d7abc2', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', '9ac16a01-4129-5cc8-b45e-8489ba150ff6', 'Atlas Squad', 'APT0626', TRUE, 'Atlas Project', 'Generated test team 6 for AI track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00'),
('79bbd08f-398b-572c-947e-6d4d5e37d6b6', 'bacf7939-4158-55ee-9376-fc50c9b855e2', 'f8a46fda-f62b-5561-850b-ac0b628a2dd5', 'Nomad Squad', 'APT0726', TRUE, 'Nomad Project', 'Generated test team 7 for MOB track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00'),
('566ef6f7-ff0a-5fa6-bd27-74b0b4856a28', 'bacf7939-4158-55ee-9376-fc50c9b855e2', 'adb65df4-a1ea-57b8-b74d-a71b8e323e09', 'Zephyr Squad', 'APT0826', TRUE, 'Zephyr Project', 'Generated test team 8 for MOB track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00'),
('1a8b0853-b5e2-53d9-9c80-3f7735e3faac', 'bacf7939-4158-55ee-9376-fc50c9b855e2', 'a0e709c9-f7a4-53c1-bf4f-a52b7a7c0881', 'Orbit Squad', 'APT0926', TRUE, 'Orbit Project', 'Generated test team 9 for MOB track.', 'COMPETING', 3, TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00', TIMESTAMP '2026-06-12 09:00:00');

-- ---- team_member ----
-- from seed v19
INSERT INTO team_member (id, role, joined_at, left_at, left_reason, user_id, team_id) VALUES
('becf8343-a408-576f-9d20-b4bfcd284f90', 'LEADER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '9084de5c-695d-57ca-b0f4-1d0f6153bf85', 'c8a7ea92-97b9-5d7d-b9a8-eb0243689cb0'),
('4a0e7d77-2b44-51e0-a9ef-e3490882404a', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '2af79072-be0e-59a6-a502-53f82d6bd9a3', 'c8a7ea92-97b9-5d7d-b9a8-eb0243689cb0'),
('aedc4d92-6aef-5bd7-809e-efbe2e2b99c7', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '4d3b07b7-1a15-58db-8384-1729c866143e', 'c8a7ea92-97b9-5d7d-b9a8-eb0243689cb0'),
('81e5d297-cc96-5bd0-bbdb-660c51ff403c', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '193f759b-f3d2-5dd4-8a19-06ba016e7e20', 'c8a7ea92-97b9-5d7d-b9a8-eb0243689cb0'),
('b9be131a-4fd5-5ede-b6b9-8876a1f354d3', 'LEADER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '84a84e8d-b13d-5865-b50c-6a9a98d7ae63', '116fd0f3-5388-5a49-8439-3464b4bc8d3d'),
('7a91bd30-d0d0-558f-a6b5-df31ea729ded', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '1eb11a23-5b1f-5841-9ea4-b365ab420f88', '116fd0f3-5388-5a49-8439-3464b4bc8d3d'),
('3cb514d3-b2eb-5ec9-886d-3a5253dbd44b', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, 'e277172a-54cc-5de8-a704-0e9d3dde7cc9', '116fd0f3-5388-5a49-8439-3464b4bc8d3d'),
('b8706526-b1cb-593a-a1e7-3375f1e816b9', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '977cce80-ac07-5767-a9c4-39717e5e9bed', '116fd0f3-5388-5a49-8439-3464b4bc8d3d'),
('d68af5c9-7a06-5a79-8a70-a958d090e9b9', 'LEADER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, 'a9d87494-eb4e-5369-bfbd-9bfdc4c8d515', 'a5133b30-7943-5acc-82fb-85c1f52c6098'),
('d394b522-fe7e-534f-957d-6fc7bd7b3d5b', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, 'f4f25d7d-be51-557d-b6ca-bef956e4bbab', 'a5133b30-7943-5acc-82fb-85c1f52c6098'),
('ad3c6ae9-426e-554e-ab54-ee239ae299d4', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '55b6d818-0a7e-5c07-b441-936ea49335bf', 'a5133b30-7943-5acc-82fb-85c1f52c6098'),
('4baee339-517a-535d-8aad-1263468be4ff', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, 'b8161300-4a8a-5e55-a3b7-9dfe80877886', 'a5133b30-7943-5acc-82fb-85c1f52c6098'),
('4e0f4c82-f70a-5fb2-a546-2aa36d79f8e6', 'LEADER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '90feb779-4bca-5d88-982b-b2325804cbb1', '0ec99158-0ea1-5160-a533-5ecf065b47b8'),
('8a14ee32-1f27-5a72-a306-348c75af0d89', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '931e509f-2b37-5c88-9bf0-ce93614f8828', '0ec99158-0ea1-5160-a533-5ecf065b47b8'),
('fd005d76-8cfc-515f-ab0a-8ed9cdc687b8', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '868e415d-3a8f-590e-824c-4d50ffc298ae', '0ec99158-0ea1-5160-a533-5ecf065b47b8'),
('1e2731dc-754d-5213-94de-c2a9b42b0f01', 'LEADER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, 'ceca3872-33f4-56a9-90d0-2373d56e92b6', '55705f79-5844-5a94-a74c-53f75aa37dee'),
('7d7ea53c-3dc5-5fcb-8bd4-af49307ef7e0', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '249a065b-d061-54b1-a2ef-2f903b975a20', '55705f79-5844-5a94-a74c-53f75aa37dee'),
('e2ef4ce6-2876-5be0-85ae-6f48be2d62f0', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '6fbc2650-35ea-5bcb-b2e9-f88241cb14c0', '55705f79-5844-5a94-a74c-53f75aa37dee'),
('c5fbc52f-2c8d-5ce7-8774-7698741451b8', 'LEADER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, 'b8161300-4a8a-5e55-a3b7-9dfe80877886', '08162ff2-bae7-58c5-ac7d-549a21277b29'),
('150832bd-5c88-57c2-9393-e4c40f0f07a0', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', NULL, NULL, '977cce80-ac07-5767-a9c4-39717e5e9bed', '08162ff2-bae7-58c5-ac7d-549a21277b29'),
('98f758ed-a590-5a33-ab7d-41e94fd0a2b9', 'LEADER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '2af79072-be0e-59a6-a502-53f82d6bd9a3', 'c3942d11-0e5f-5007-b4e6-418fe6bac396'),
('12a6ab91-2867-59b4-8ff0-e60e9d1993c9', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '9084de5c-695d-57ca-b0f4-1d0f6153bf85', 'c3942d11-0e5f-5007-b4e6-418fe6bac396'),
('82d2e9f6-4f48-5bd1-958b-4b57f0ad5cac', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '4d3b07b7-1a15-58db-8384-1729c866143e', 'c3942d11-0e5f-5007-b4e6-418fe6bac396'),
('925f1d05-fb5c-5010-b2e0-21082efd6f32', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '84a84e8d-b13d-5865-b50c-6a9a98d7ae63', 'c3942d11-0e5f-5007-b4e6-418fe6bac396'),
('b622307c-b6ba-5c6d-80f3-bb1f7d3c7404', 'LEADER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '1eb11a23-5b1f-5841-9ea4-b365ab420f88', 'c381d1b1-c595-5810-9f7c-671e690e9eae'),
('d552c9dc-1d38-545c-a4f1-c26429fefde1', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, 'e277172a-54cc-5de8-a704-0e9d3dde7cc9', 'c381d1b1-c595-5810-9f7c-671e690e9eae'),
('600554c3-3e1a-5742-b7c6-3944a2b707ee', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, 'a9d87494-eb4e-5369-bfbd-9bfdc4c8d515', 'c381d1b1-c595-5810-9f7c-671e690e9eae'),
('eec4fd64-ac17-5995-bd50-711a809fdef0', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, 'f4f25d7d-be51-557d-b6ca-bef956e4bbab', 'c381d1b1-c595-5810-9f7c-671e690e9eae'),
('c6ea276b-e412-589c-8c5f-0ed34d00cb4d', 'LEADER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, 'f4f25d7d-be51-557d-b6ca-bef956e4bbab', 'cfddde8d-ccef-534f-ad54-2571ebe147dd'),
('61e293d2-1f03-5f03-b76a-44038fda5fc6', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '55b6d818-0a7e-5c07-b441-936ea49335bf', 'cfddde8d-ccef-534f-ad54-2571ebe147dd'),
('5363f67d-2123-5c4d-b2e8-e51f8894f1f6', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '90feb779-4bca-5d88-982b-b2325804cbb1', 'cfddde8d-ccef-534f-ad54-2571ebe147dd'),
('61af581c-5704-5d60-a361-4e3d61f0b1a2', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '931e509f-2b37-5c88-9bf0-ce93614f8828', 'cfddde8d-ccef-534f-ad54-2571ebe147dd'),
('7ac7bdcc-a94e-521f-940d-7f3b52218940', 'LEADER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '931e509f-2b37-5c88-9bf0-ce93614f8828', '44d64c0a-7a15-5cd1-95f2-369b96c1f949'),
('8dc9ffa7-fcc7-562e-a7fc-2dd01b893225', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '868e415d-3a8f-590e-824c-4d50ffc298ae', '44d64c0a-7a15-5cd1-95f2-369b96c1f949'),
('ac728714-e8ef-5e5c-8463-8aa51b2225b7', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, 'ceca3872-33f4-56a9-90d0-2373d56e92b6', '44d64c0a-7a15-5cd1-95f2-369b96c1f949'),
('07ad76cc-8e1b-51a8-93ae-f68e231832c0', 'MEMBER', TIMESTAMP '2025-03-12 09:00:00', NULL, NULL, '249a065b-d061-54b1-a2ef-2f903b975a20', '44d64c0a-7a15-5cd1-95f2-369b96c1f949'),
('5cbf272f-52a2-5a55-bdda-e10efff9ae2d', 'MEMBER', TIMESTAMP '2026-06-02 09:00:00', TIMESTAMP '2026-06-07 14:00:00', 'SELF_LEFT', '6fbc2650-35ea-5bcb-b2e9-f88241cb14c0', '0ec99158-0ea1-5160-a533-5ecf065b47b8');

-- from seed v20
INSERT INTO team_member (id, role, joined_at, left_at, left_reason, user_id, team_id) VALUES
('1f388846-dc93-5482-955e-afe77f98801a', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '6658c13d-3e97-556b-abd2-ceb883fcc7df', '48b12ed9-38e9-526e-a7eb-4d4ffab99866'),
('2ad8134a-57c9-5b0c-a5ef-1131711fd837', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '5395718c-033f-5ced-8d9c-bce864a484b3', '48b12ed9-38e9-526e-a7eb-4d4ffab99866'),
('58c3c253-5cb3-57e4-a03c-0147486cf1fa', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'e2a214ff-4d54-5f5e-bcc7-57ca66e424ce', '48b12ed9-38e9-526e-a7eb-4d4ffab99866'),
('eca54510-82b5-5c8d-8ec8-11002789b770', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'a6074f37-925c-5df7-86c6-32a22f437cb1', '0744eaa0-536f-5a7d-b3e5-1f5ca75864c2'),
('eb91b149-0b74-5760-8b21-0ffe2db80fc6', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '0f8f72a0-1e96-57a6-b549-6ba7a089e7c5', '0744eaa0-536f-5a7d-b3e5-1f5ca75864c2'),
('d7a4b392-0ad5-5547-960b-23aa6ddaa76e', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '9acdacbc-b3aa-551e-b56f-bb433bd212e9', '0744eaa0-536f-5a7d-b3e5-1f5ca75864c2'),
('49fe3d4c-7363-5349-a47d-b62de2bb0992', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'a202c560-e8f0-5a13-88a6-18fc1a68bcac', '13a3ff77-6ea7-5d9b-9432-ef84e8db75e9'),
('418183bb-cbee-5076-a1cd-c26507cbdc7e', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '9431affb-8e5d-5de8-8d09-b3347da7385b', '13a3ff77-6ea7-5d9b-9432-ef84e8db75e9'),
('d6c75da6-6dfb-559e-9deb-b0a329c1f31c', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'cfb4a2b8-eed5-5768-873b-f407d07d3194', '13a3ff77-6ea7-5d9b-9432-ef84e8db75e9'),
('45640dc5-ac50-54eb-bb8e-656cf7478def', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'eb8d0bab-24e3-5f1c-bca4-6be39b8bc898', 'fb4f6299-a38e-591f-8b82-da200fec409b'),
('f3f87feb-a0cb-594c-a30e-347aa9765af9', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '044ca207-6b84-55be-9e3a-f7bcd22a9ece', 'fb4f6299-a38e-591f-8b82-da200fec409b'),
('9bc18ed9-3336-576d-91aa-5e261fbe8788', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '15673176-5bc9-5631-b391-412fee4ce8e5', 'fb4f6299-a38e-591f-8b82-da200fec409b'),
('ef73786f-38e7-5dde-9fb6-8bfd31d7e503', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '1c1e7a2b-18fc-5099-9ba6-bbba2c5e0ab9', '6940d96e-1ed6-59d7-b25d-2f3dc521752e'),
('9ee42ec9-87ba-52db-b04b-608ec51072b4', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '8fc462f6-bb30-534f-82c3-6f5f4ffcaf26', '6940d96e-1ed6-59d7-b25d-2f3dc521752e'),
('c8f5082f-3e52-5084-b519-92ec79def650', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'b7d86730-b4d2-5f4c-9a59-a54020b2cbd2', '6940d96e-1ed6-59d7-b25d-2f3dc521752e'),
('5633dee8-ca75-59b2-9cfd-c5322145bdfe', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'd8e76c1b-f79f-5239-a485-d646f1ed0a12', '80e2d511-f65b-55c2-8ed2-94cdc3585254'),
('50db3526-441c-5340-a196-ece989d3ed74', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '04d337ef-bd68-54e9-8b45-e6bd85dd726a', '80e2d511-f65b-55c2-8ed2-94cdc3585254'),
('ea8648e5-f4af-5737-b636-157edef80a27', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'a3aa389b-dd91-555e-84a7-ddec19710b70', '80e2d511-f65b-55c2-8ed2-94cdc3585254'),
('cbb0487c-92e3-5d7b-9c76-83b54d25d00c', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '9ac16a01-4129-5cc8-b45e-8489ba150ff6', 'd68b533f-34bc-5925-a116-e47ea6d7abc2'),
('08184f52-da1a-5f49-a826-59d2123c42d3', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '304216f9-a077-52f7-9f40-76745ba480af', 'd68b533f-34bc-5925-a116-e47ea6d7abc2'),
('6be0e500-7200-5eca-b205-626a4edad574', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '69c8bef4-55f8-5369-8428-c6e458b40ead', 'd68b533f-34bc-5925-a116-e47ea6d7abc2'),
('f921fe5d-27fd-5202-a046-3b03b84b092c', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'f8a46fda-f62b-5561-850b-ac0b628a2dd5', '79bbd08f-398b-572c-947e-6d4d5e37d6b6'),
('a238d702-6249-53d1-86e2-2ade0fd63568', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '90860465-64d2-537d-8060-b60caf11ad96', '79bbd08f-398b-572c-947e-6d4d5e37d6b6'),
('3175f41d-07d9-535a-8f8b-8db4745cea3f', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'e779e228-60c8-5577-990b-ca189be7bb99', '79bbd08f-398b-572c-947e-6d4d5e37d6b6'),
('57727998-8cff-5682-98e5-8b3c0afa5e80', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'adb65df4-a1ea-57b8-b74d-a71b8e323e09', '566ef6f7-ff0a-5fa6-bd27-74b0b4856a28'),
('a47d28b5-a7c2-54e3-82ce-da11b4fdceed', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '7596b651-0d63-5d8e-9fb2-466a545278a1', '566ef6f7-ff0a-5fa6-bd27-74b0b4856a28'),
('1b4d7c63-3ca1-5c60-a203-11d71abf1560', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'f248ee9c-177d-5166-9a9c-7fb29d004fcc', '566ef6f7-ff0a-5fa6-bd27-74b0b4856a28'),
('9b5c840b-be66-5e0a-bb9d-746d78043d9c', 'LEADER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'a0e709c9-f7a4-53c1-bf4f-a52b7a7c0881', '1a8b0853-b5e2-53d9-9c80-3f7735e3faac'),
('54bd1580-a14e-5115-89c8-cd8fb1b59bed', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, 'cdb94b44-3f76-52f1-9738-26b4d3f9ad4c', '1a8b0853-b5e2-53d9-9c80-3f7735e3faac'),
('eceabaa9-7d55-56c9-b80f-f67adf24cb5f', 'MEMBER', TIMESTAMP '2026-06-12 09:00:00', NULL, NULL, '5a40d862-1e69-5a98-837e-7ff99604db51', '1a8b0853-b5e2-53d9-9c80-3f7735e3faac');

-- ---- team_invitations ----
-- from seed v19
INSERT INTO team_invitations (id, team_id, invited_by, invite_email, invitee_user_id, token, status, type, message, expires_at, created_at, respond_at, response_reason) VALUES
('07517a1d-5746-5ada-a432-ab6c0faabf30', 'c8a7ea92-97b9-5d7d-b9a8-eb0243689cb0', '9084de5c-695d-57ca-b0f4-1d0f6153bf85', 'pending.student@seal.test', 'c87bdd42-07d8-5f44-8e54-ac96313f306d', 'token-pending-alpha', 'PENDING', 'INVITATION', NULL, TIMESTAMP '2026-06-12 23:59:00', TIMESTAMP '2026-06-10 08:00:00', NULL, NULL),
('9b5577a5-58d1-52a6-ac96-140a73a13d8a', '116fd0f3-5388-5a49-8439-3464b4bc8d3d', '84a84e8d-b13d-5865-b50c-6a9a98d7ae63', 'student17@seal.test', '977cce80-ac07-5767-a9c4-39717e5e9bed', 'token-accepted-beta', 'ACCEPTED', 'INVITATION', NULL, TIMESTAMP '2026-06-10 23:59:00', TIMESTAMP '2026-06-08 08:00:00', TIMESTAMP '2026-06-08 12:00:00', NULL),
('e02025b3-2a4b-584b-a5ec-cdcc0e4b74af', 'a5133b30-7943-5acc-82fb-85c1f52c6098', 'a9d87494-eb4e-5369-bfbd-9bfdc4c8d515', 'external.member@example.com', NULL, 'token-declined-gamma', 'DECLINED', 'INVITATION', NULL, TIMESTAMP '2026-06-09 23:59:00', TIMESTAMP '2026-06-07 08:00:00', TIMESTAMP '2026-06-07 13:00:00', 'Declined by invitee'),
('25bdeb1c-67cf-5c9b-a337-0b71ef6aa6e1', '55705f79-5844-5a94-a74c-53f75aa37dee', 'ceca3872-33f4-56a9-90d0-2373d56e92b6', 'late.member@example.com', NULL, 'token-expired-mobile', 'EXPIRED', 'INVITATION', NULL, TIMESTAMP '2026-06-05 23:59:00', TIMESTAMP '2026-06-01 08:00:00', TIMESTAMP '2026-06-06 00:01:00', 'Expired before response'),
('c508094a-e33e-5801-833b-e33c9004320a', '0ec99158-0ea1-5160-a533-5ecf065b47b8', '90feb779-4bca-5d88-982b-b2325804cbb1', 'cancelled@example.com', NULL, 'token-cancelled-delta', 'CANCELLED', 'INVITATION', NULL, TIMESTAMP '2026-06-11 23:59:00', TIMESTAMP '2026-06-09 08:00:00', TIMESTAMP '2026-06-09 10:00:00', 'Cancelled by leader'),
-- v18/v19: join-request flow is stored in team_invitations using type = JOIN_REQUEST, not a new table.
('c4bb2a1f-4df7-5e68-997b-e6aa8b90e65d', '08162ff2-bae7-58c5-ac7d-549a21277b29', '193f759b-f3d2-5dd4-8a19-06ba016e7e20', 'student18@seal.test', '193f759b-f3d2-5dd4-8a19-06ba016e7e20', 'token-join-request-spring-starters', 'PENDING', 'JOIN_REQUEST', 'Hi leader, I would like to join your Spring Starters team.', TIMESTAMP '2026-06-20 23:59:00', TIMESTAMP '2026-06-10 09:30:00', NULL, NULL);

-- ---- mentor_assignment ----
-- from seed v19
INSERT INTO mentor_assignment (id, user_id, track_id, assigned_by, note, assigned_at) VALUES
('ebdfdc33-cef2-5b08-ba75-1ee680d2ee91', '35fb4dd4-d4f0-5f08-b17f-856159cd2793', '8039cc28-1b76-556f-8bc2-2e544416d4c8', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'Backend/API mentor for web track.', TIMESTAMP '2026-06-01 09:00:00'),
('53a175ab-ec85-5f67-95b0-8498a830dc63', '6191c31a-d587-5ace-a357-99fa216e4e95', 'c8c619b7-551c-50e4-b1a2-de5b8b7a7bb9', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'AI/RAG mentor for AI track.', TIMESTAMP '2026-06-01 09:10:00'),
('bf772373-9a64-54b7-a382-ba28e0d27c03', 'b8b0f328-5011-5998-bc84-5b1fbb46b7da', 'bacf7939-4158-55ee-9376-fc50c9b855e2', '0406b2de-5dcd-59c7-ad4c-e614f1f201a5', 'Product and mobile UX mentor.', TIMESTAMP '2026-06-01 09:20:00'),
('6f6d350e-3466-55d9-bd29-7a5c08e50292', 'b8b0f328-5011-5998-bc84-5b1fbb46b7da', 'b7771bfe-9cdc-5438-b7a6-3c7608ac4883', '2cc37edd-03ca-5dfd-9336-2ffbaab22596', 'Product mentor for Spring event.', TIMESTAMP '2026-06-02 10:00:00');

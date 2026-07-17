-- Remove fabricated evidence from the Final Draft Crew acceptance draft.
-- Participants must add real evidence through the submission workflow.
DELETE FROM submission_links
WHERE submission_id = '18000000-0000-4000-8000-000000000401'
  AND id IN (
      '18000000-0000-4000-8000-000000000411',
      '18000000-0000-4000-8000-000000000412'
  )
  AND url IN (
      'https://github.com/seal-demo/final-draft-crew',
      'https://final-draft.demo.seal.test'
  );

-- Complete judge1's mandatory calibration fixtures so the documented
-- judge acceptance account can use the normal grading authorization path.
INSERT INTO calibration_scores (
    id, calibration_round_id, judge_id, event_criteria_id,
    value, deviation_from_benchmark, judge_comment, scored_at
) VALUES
    ('24000000-0000-4000-8000-000000000001', '6438c4af-3c8a-58ad-9f88-379b84e51e74', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '42a9272d-fc7b-524d-83b2-610640100f0c', 8.0, 0.0, 'Acceptance calibration: business value.', CURRENT_TIMESTAMP),
    ('24000000-0000-4000-8000-000000000002', '6438c4af-3c8a-58ad-9f88-379b84e51e74', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '7fee79e5-ec63-5699-9428-3e25b411885e', 8.5, 0.0, 'Acceptance calibration: presentation.', CURRENT_TIMESTAMP),
    ('24000000-0000-4000-8000-000000000003', '18000000-0000-4000-8000-000000000301', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '853acfed-a265-5931-af69-456c4d9a522a', 8.0, 0.0, 'Acceptance calibration: technical implementation.', CURRENT_TIMESTAMP),
    ('24000000-0000-4000-8000-000000000004', '18000000-0000-4000-8000-000000000301', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '9fa11673-4fb2-5f00-9641-30f924093617', 7.5, 0.0, 'Acceptance calibration: innovation.', CURRENT_TIMESTAMP),
    ('24000000-0000-4000-8000-000000000005', '18000000-0000-4000-8000-000000000301', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '42a9272d-fc7b-524d-83b2-610640100f0c', 7.5, 0.0, 'Acceptance calibration: business value.', CURRENT_TIMESTAMP),
    ('24000000-0000-4000-8000-000000000006', '18000000-0000-4000-8000-000000000301', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '7fee79e5-ec63-5699-9428-3e25b411885e', 8.0, 0.0, 'Acceptance calibration: presentation.', CURRENT_TIMESTAMP),
    ('24000000-0000-4000-8000-000000000007', '18000000-0000-4000-8000-000000000301', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '74ff8b44-3bbc-5747-a232-1e962a4089c1', 7.0, 0.0, 'Acceptance calibration: scalability.', CURRENT_TIMESTAMP)
ON CONFLICT ON CONSTRAINT uk_calibration_score_round_judge_criteria DO NOTHING;

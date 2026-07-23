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

-- Complete judge1's closed qualification calibration fixture.
INSERT INTO calibration_scores (
    id, calibration_round_id, judge_id, event_criteria_id,
    value, deviation_from_benchmark, judge_comment, scored_at
) VALUES
    ('24000000-0000-4000-8000-000000000001', '6438c4af-3c8a-58ad-9f88-379b84e51e74', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '42a9272d-fc7b-524d-83b2-610640100f0c', 8.0, 0.0, 'Acceptance calibration: business value.', CURRENT_TIMESTAMP),
    ('24000000-0000-4000-8000-000000000002', '6438c4af-3c8a-58ad-9f88-379b84e51e74', '79f650d1-4a5b-552a-8f9b-98570a7a2021', '7fee79e5-ec63-5699-9428-3e25b411885e', 8.5, 0.0, 'Acceptance calibration: presentation.', CURRENT_TIMESTAMP)
ON CONFLICT ON CONSTRAINT uk_calibration_score_round_judge_criteria DO NOTHING;

-- Complete the remaining judges' closed qualification calibration. Judge3
-- still has the separate live final-round calibration pending in V18.
WITH target_judges(judge_id) AS (
    VALUES
        ('1aea112d-a34e-54a5-95f9-9a68f1aca4ef'::uuid),
        ('17000000-0000-4000-8000-000000000741'::uuid),
        ('13790868-1c36-58a0-af63-7d2fa2458082'::uuid)
), required_scores AS (
    SELECT
        calibration.id AS calibration_round_id,
        target_judges.judge_id,
        benchmark.key::uuid AS event_criteria_id,
        benchmark.value::real AS value,
        calibration.end_at - INTERVAL '1 hour' AS scored_at
    FROM calibration_rounds calibration
    CROSS JOIN target_judges
    CROSS JOIN LATERAL jsonb_each_text(calibration.benchmark_scores) benchmark
    JOIN event_criteria criteria
      ON criteria.id = benchmark.key::uuid
     AND criteria.event_id = calibration.event_id
     AND criteria.is_active = TRUE
    WHERE calibration.id = '6438c4af-3c8a-58ad-9f88-379b84e51e74'
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
    'Seed repair for closed qualification calibration.',
    scored_at
FROM required_scores
ON CONFLICT ON CONSTRAINT uk_calibration_score_round_judge_criteria DO NOTHING;

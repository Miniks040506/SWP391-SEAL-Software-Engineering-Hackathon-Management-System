-- judge3 and judge5 have qualification-round assignments, but the mandatory
-- qualification calibration closed before their fixture scores were complete.
-- Fill only missing rows from the coordinator's benchmark so the historical
-- round remains closed and the test accounts can use the normal grading path.
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
    id,
    calibration_round_id,
    judge_id,
    event_criteria_id,
    value,
    deviation_from_benchmark,
    judge_comment,
    scored_at
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

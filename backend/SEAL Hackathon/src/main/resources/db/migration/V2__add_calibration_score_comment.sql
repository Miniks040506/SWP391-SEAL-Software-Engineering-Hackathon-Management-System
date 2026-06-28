ALTER TABLE calibration_scores
    ADD COLUMN IF NOT EXISTS judge_comment TEXT;

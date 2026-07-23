package com.t7.seal.entities;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CalibrationRoundTest {

    @Test
    void appliesOnlyToItsSampleSubmissionRound() {
        UUID qualificationRoundId = UUID.randomUUID();
        CalibrationRound calibration = CalibrationRound.builder()
                .sampleSubmission(Submission.builder()
                        .round(Round.builder().id(qualificationRoundId).build())
                        .build())
                .build();

        assertTrue(calibration.appliesToRound(qualificationRoundId));
        assertFalse(calibration.appliesToRound(UUID.randomUUID()));
        assertFalse(calibration.appliesToRound(null));
    }
}

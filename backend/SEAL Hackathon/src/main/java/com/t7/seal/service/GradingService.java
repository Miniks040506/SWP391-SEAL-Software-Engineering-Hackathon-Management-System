package com.t7.seal.service;

import com.t7.seal.request.grading.ConfirmScoreSheetRequest;
import com.t7.seal.request.grading.SaveScoreSheetRequest;
import com.t7.seal.request.grading.UpdateScoreRequest;
import com.t7.seal.response.grading.ScoreResponse;
import com.t7.seal.response.grading.ScoreSheetResponse;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface GradingService {
    ScoreSheetResponse getScoreSheets(UUID submissionId, Authentication authentication);

    ScoreSheetResponse saveDraft(UUID submissionId,
                                 SaveScoreSheetRequest saveScoreSheetRequest,
                                 Authentication authentication);

    ScoreSheetResponse submitFinal(UUID submissionId,
                                   SaveScoreSheetRequest saveScoreSheetRequest,
                                   Authentication authentication);

    ScoreSheetResponse confirmScoreSheet(UUID submissionId,
                                         ConfirmScoreSheetRequest confirmScoreSheetRequest,
                                         Authentication authentication);

    ScoreResponse updateScore(UUID scoreId, UpdateScoreRequest request, Authentication authentication);

    ScoreResponse confirmScore(UUID scoreId, Authentication authentication);
}

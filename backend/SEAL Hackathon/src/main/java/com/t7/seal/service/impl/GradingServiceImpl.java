package com.t7.seal.service.impl;

import com.t7.seal.request.grading.ConfirmScoreSheetRequest;
import com.t7.seal.request.grading.SaveScoreSheetRequest;
import com.t7.seal.response.grading.ScoreResponse;
import com.t7.seal.response.grading.ScoreSheetResponse;
import com.t7.seal.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GradingServiceImpl implements GradingService {
    @Override
    public ScoreSheetResponse getScoreSheets(UUID submissionId, Authentication authentication) {
        return null;
    }

    @Override
    public ScoreSheetResponse saveDraft(
            UUID submissionId,
            SaveScoreSheetRequest saveScoreSheetRequest,
            Authentication authentication
    ) {
        return null;
    }

    @Override
    public ScoreSheetResponse submitFinal(UUID submissionId, SaveScoreSheetRequest saveScoreSheetRequest, Authentication authentication) {
        return null;
    }

    @Override
    public ScoreSheetResponse confirmScoreSheet(UUID submissionId, ConfirmScoreSheetRequest confirmScoreSheetRequest, Authentication authentication) {
        return null;
    }

    @Override
    public ScoreResponse updateScore(UUID scoreId, Authentication authentication) {
        return null;
    }

    @Override
    public ScoreResponse confirmScore(UUID scoreId, Authentication authentication) {
        return null;
    }
}

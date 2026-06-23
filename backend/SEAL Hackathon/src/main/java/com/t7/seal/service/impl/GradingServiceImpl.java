package com.t7.seal.service.impl;

import com.t7.seal.entities.Judge;
import com.t7.seal.entities.User;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.JudgeRepository;
import com.t7.seal.request.grading.ConfirmScoreSheetRequest;
import com.t7.seal.request.grading.SaveScoreSheetRequest;
import com.t7.seal.response.grading.ScoreResponse;
import com.t7.seal.response.grading.ScoreSheetResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GradingServiceImpl implements GradingService {

    private final CurrentUserService currentUserService;
    private final JudgeRepository judgeRepository;

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

    //HELPERS
    private Judge currentJudge(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        if (!user.isJudge()) {
            throw new UnauthorizedException("Only judges can access assigned submissions.");
        }
        if (!user.isActive()) {
            throw new UnauthorizedException("Judge account is not ACTIVE.");
        }

        Judge judge = judgeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new UnauthorizedException("Judge profile was not found."));

        if (Boolean.TRUE.equals(judge.getIsTemporary()) && !judge.isTemporaryActive(LocalDateTime.now())) {
            throw new UnauthorizedException("Temporary judge account has expired.");
        }
        return judge;
    }
}

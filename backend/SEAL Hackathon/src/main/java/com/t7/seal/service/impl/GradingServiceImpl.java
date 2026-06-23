package com.t7.seal.service.impl;

import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.entities.*;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.*;
import com.t7.seal.request.grading.ConfirmScoreSheetRequest;
import com.t7.seal.request.grading.SaveScoreSheetRequest;
import com.t7.seal.response.grading.ScoreResponse;
import com.t7.seal.response.grading.ScoreSheetResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GradingServiceImpl implements GradingService {

    private final CurrentUserService currentUserService;

    private final JudgeRepository judgeRepository;
    private final SubmissionRepository submissionRepository;
    private final RoundJudgeAssignmentRepository roundJudgeAssignmentRepository;
    private final EventCriteriaRepository eventCriteriaRepository;
    private final ScoreRepository scoreRepository;

    @Transactional(readOnly = true)
    @Override
    public ScoreSheetResponse getScoreSheets(UUID submissionId, Authentication authentication) {
        Judge judge = currentJudge(authentication);
        Submission submission = getSubmission(submissionId);

        ensureJudgeCanView(judge, submission);

        return toScoreSheetResponse(submission, judge);
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

    private Submission getSubmission(UUID submissionId) {
        return submissionRepository.findDetailById(submissionId)
                .orElseThrow(() -> new UnauthorizedException("Submission not found."));
    }

    private void ensureJudgeCanView(Judge judge, Submission submission) {
        if (!isAssigned(submission, judge)) {
            throw new UnauthorizedException("This submission is not assigned to you.");
        }

        if (!isScorable(submission)) {
            throw new UnauthorizedException("Only submitted or late submissions can be viewed and graded.");
        }
    }

    private boolean isAssigned(Submission submission, Judge judge) {
        Team team = submission.getTeam();
        Track track = team == null ? null : team.getTrack();
        UUID roundId = submission.getRound() == null ? null : submission.getRound().getId();
        UUID trackId = track == null ? null : track.getId();

        return roundJudgeAssignmentRepository.findByJudgeIdAndRoundIdWithRoundAndTrack(judge.getId(), roundId)
                .stream()
                .anyMatch(assignment -> assignment.canScore(roundId, trackId));
    }

    private boolean isScorable(Submission submission) {
        return submission.getStatus() == SubmissionStatus.SUBMITTED
                || submission.getStatus() == SubmissionStatus.LATE;
    }

    private ScoreSheetResponse toScoreSheetResponse(Submission submission, Judge judge) {
        List<ScoreResponse> scores = scoreRepository
                .findBySubmissionIdAndJudgeIdOrderByEventCriteriaDisplayOrderAsc(submission.getId(), judge.getId())
                .stream()
                .map(this::toScoreResponse)
                .toList();

        long criteriaCount = activeCriteriaFor(submission).size();
        long confirmedCount = scores.stream().filter(s -> Boolean.FALSE.equals(s.isDraft())).count();
        boolean confirmed = criteriaCount > 0 && confirmedCount >= criteriaCount;

        return new ScoreSheetResponse(
                submission.getId(),
                judge.getId(),
                confirmed,
                scores
        );
    }

    private List<EventCriteria> activeCriteriaFor(Submission submission) {
        Round round = submission.getRound();
        UUID roundId = round.getId();

        return eventCriteriaRepository.findByEventIdAndIsActiveTrueOrderByDisplayOrderAsc(round.getEvent().getId())
                .stream()
                .filter(c -> c.appliesToRound(roundId))
                .toList();
    }

    private ScoreResponse toScoreResponse(Score score) {
        return new ScoreResponse(
                score.getId(),
                score.getSubmission().getId(),
                score.getJudge().getId(),
                score.getEventCriteria().getId(),
                score.getValue() == null ? null : score.getValue().doubleValue(),
                score.getComment(),
                score.getIsDraft(),
                score.getScoredAt()
        );
    }
}

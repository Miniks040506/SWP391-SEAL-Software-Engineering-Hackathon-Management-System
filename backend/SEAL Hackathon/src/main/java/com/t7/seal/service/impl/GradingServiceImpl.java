package com.t7.seal.service.impl;

import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.*;
import com.t7.seal.request.grading.ConfirmScoreSheetRequest;
import com.t7.seal.request.grading.SaveScoreSheetRequest;
import com.t7.seal.request.grading.ScoreItemRequest;
import com.t7.seal.request.grading.UpdateScoreRequest;
import com.t7.seal.response.grading.ScoreResponse;
import com.t7.seal.response.grading.ScoreSheetResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradingServiceImpl implements GradingService {

    private final CurrentUserService currentUserService;

    private final JudgeRepository judgeRepository;
    private final SubmissionRepository submissionRepository;
    private final RoundJudgeAssignmentRepository roundJudgeAssignmentRepository;
    private final EventCriteriaRepository eventCriteriaRepository;
    private final ScoreRepository scoreRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    @Override
    public ScoreSheetResponse getScoreSheets(UUID submissionId, Authentication authentication) {
        Judge judge = currentJudge(authentication);
        Submission submission = getSubmission(submissionId);

        ensureJudgeCanView(judge, submission);

        return toScoreSheetResponse(submission, judge);
    }

    @Transactional
    @Override
    public ScoreSheetResponse saveDraft(
            UUID submissionId,
            SaveScoreSheetRequest saveScoreSheetRequest,
            Authentication authentication
    ) {
        Judge judge = currentJudge(authentication);
        Submission submission = getSubmission(submissionId);

        ensureJudgeCanMutate(submission, judge, false);

        upsertScore(submission, judge, saveScoreSheetRequest, true, false);

        recordAuditLog(judge.getUser(), AuditActionType.SCORE_CREATE,
                submission, Map.of("mode", "DRAFT"));

        return toScoreSheetResponse(submission, judge);
    }

    @Transactional
    @Override
    public ScoreSheetResponse submitFinal(
            UUID submissionId,
            SaveScoreSheetRequest saveScoreSheetRequest,
            Authentication authentication
    ) {
        Judge judge = currentJudge(authentication);
        Submission submission = getSubmission(submissionId);

        ensureJudgeCanMutate(submission, judge, true);

        upsertScore(submission, judge, saveScoreSheetRequest, false, true);

        recordAuditLog(judge.getUser(), AuditActionType.SCORE_CONFIRMED,
                submission, Map.of("mode", "FINAL_SUBMIT"));

        return toScoreSheetResponse(submission, judge);
    }

    @Transactional
    @Override
    public ScoreSheetResponse confirmScoreSheet(
            UUID submissionId,
            ConfirmScoreSheetRequest request,
            Authentication authentication
    ) {
        Judge judge = currentJudge(authentication);
        Submission submission = getSubmission(submissionId);
        ensureJudgeCanMutate(submission, judge, true);

        List<EventCriteria> activeCriteria = activeCriteriaFor(submission);
        List<Score> existing = scoreRepository
                .findBySubmissionIdAndJudgeIdOrderByEventCriteriaDisplayOrderAsc(submission.getId(), judge.getId());

        Map<UUID, Score> byCriteriaId = existing.stream()
                .collect(Collectors.toMap(
                        s -> s.getEventCriteria().getId(),
                        Function.identity(),
                        (a, b) -> a)
                );

        for (EventCriteria criterion : activeCriteria) {
            Score score = byCriteriaId.get(criterion.getId());
            if (score == null || score.getValue() == null) {
                throw new BadRequestException("All active criteria must be scored before final submission.");
            }

            validateScoreValue(criterion, score.getValue().doubleValue());
            score.confirm();
        }

        scoreRepository.saveAll(existing);

        recordAuditLog(judge.getUser(), AuditActionType.SCORE_CONFIRMED,
                submission, Map.of("confirmationNote", request == null
                        || request.confirmationNote() == null ? "" : request.confirmationNote()));

        return toScoreSheetResponse(submission, judge);
    }

    @Transactional
    @Override
    public ScoreResponse updateScore(
            UUID scoreId,
            UpdateScoreRequest request,
            Authentication authentication
    ) {
        Judge judge = currentJudge(authentication);
        Score score = getScore(scoreId);

        if (!judge.getId().equals(score.getJudge().getId())) {
            throw new UnauthorizedException("You can only update your own scores.");
        }

        ensureJudgeCanMutate(score.getSubmission(), judge, false);

        if (score.isConfirmed()) {
            throw new ConflictException("Final submitted score cannot be edited.");
        }

        validateScoreValue(score.getEventCriteria(), request.value());

        score.setValue(request.value().floatValue());
        score.setComment(trimToNull(request.comment()));
        score.markAsDraft();

        Score saved = scoreRepository.save(score);
        recordAuditLog(judge.getUser(), AuditActionType.SCORE_UPDATE, score.getSubmission(), Map.of(
                "scoreId", score.getId().toString(),
                "eventCriteriaId", score.getEventCriteria().getId().toString()
        ));

        return toScoreResponse(saved);
    }

    @Transactional
    @Override
    public ScoreResponse confirmScore(UUID scoreId, Authentication authentication) {
        Judge judge = currentJudge(authentication);
        Score score = getScore(scoreId);

        if (!judge.getId().equals(score.getJudge().getId())) {
            throw new UnauthorizedException("You can only confirm your own scores.");
        }

        ensureJudgeCanMutate(score.getSubmission(), judge, false);
        validateScoreValue(score.getEventCriteria(), score.getValue().doubleValue());
        score.confirm();

        Score saved = scoreRepository.save(score);
        recordAuditLog(judge.getUser(), AuditActionType.SCORE_CONFIRMED, score.getSubmission(), Map.of(
                "scoreId", score.getId().toString(),
                "eventCriteriaId", score.getEventCriteria().getId().toString()
        ));
        return toScoreResponse(saved);
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
                .orElseThrow(() -> new BadRequestException("Submission not found."));
    }

    private Score getScore(UUID scoreId) {
        return scoreRepository.findByIdWithSubmissionRoundJudgeCriteria(scoreId)
                .orElseThrow(() -> new BadRequestException("Score not found."));
    }

    private void ensureJudgeCanView(Judge judge, Submission submission) {
        if (!isAssigned(submission, judge)) {
            throw new UnauthorizedException("This submission is not assigned to you.");
        }

        if (!isScorable(submission)) {
            throw new ConflictException("Only submitted or late submissions can be viewed and graded.");
        }
    }

    private void ensureJudgeCanMutate(Submission submission, Judge judge, boolean finalSubmit) {
        ensureJudgeCanView(judge, submission);

        Round round = submission.getRound();
        if (round.getSubmissionLockedAt() == null) {
            throw new ConflictException("Submission window must be locked before judge can start.");
        }

        if (round.getGradingLockedAt() != null) {
            throw new ConflictException("Grading is locked for this round.");
        }

        if (finalSubmit && activeCriteriaFor(submission).isEmpty()) {
            throw new ConflictException("No active scoring criteria are available for this round.");
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

    private List<EventCriteria> activeCriteriaFor(Submission submission) {
        Round round = submission.getRound();
        UUID roundId = round.getId();

        return eventCriteriaRepository.findByEventIdAndIsActiveTrueOrderByDisplayOrderAsc(round.getEvent().getId())
                .stream()
                .filter(c -> c.appliesToRound(roundId))
                .toList();
    }

    private void validateScoreValue(EventCriteria criterion, Double value) {

        if (value == null) {
            throw new BadRequestException("Score value cannot be null.");
        }

        if (value < 0) {
            throw new BadRequestException("Score value must be greater than or equal to 0.");
        }

        Float max = criterion.getEffectiveMaxScore();
        if (max != null && value > max) {
            throw new BadRequestException("Score value must be less than or equal to the max score.");
        }
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

    private void upsertScore(Submission submission, Judge judge, SaveScoreSheetRequest request,
                             boolean draft, boolean requiredAllCriteria) {
        if (request == null || request.scores() == null || request.scores().isEmpty()) {
            throw new BadRequestException("Score sheet must contain at least one score.");
        }

        List<EventCriteria> activeCriteria = activeCriteriaFor(submission);
        Map<UUID, EventCriteria> criteriaById = activeCriteria.stream()
                .collect(Collectors.toMap(EventCriteria::getId, Function.identity()));
        Set<UUID> seenCriteria = new HashSet<>();

        if (requiredAllCriteria && request.scores().size() < activeCriteria.size()) {
            throw new BadRequestException("All active must be score before final submission.");
        }

        for (ScoreItemRequest scoreItem : request.scores()) {
            if (!seenCriteria.add(scoreItem.eventCriteriaId())) {
                throw new BadRequestException("Duplicate score item for criteria.");
            }

            EventCriteria criterion = criteriaById.get(scoreItem.eventCriteriaId());
            if (criterion == null) {
                throw new BadRequestException("Criteria is inactive or not available for this round: "
                        + scoreItem.eventCriteriaId());
            }

            validateScoreValue(criterion, scoreItem.value());

            Score score = scoreRepository
                    .findBySubmissionIdAndJudgeIdAndEventCriteriaId(submission.getId(), judge.getId(), criterion.getId())
                    .orElseGet(() -> Score.builder()
                            .submission(submission)
                            .judge(judge)
                            .eventCriteria(criterion)
                            .build());

            if (score.isConfirmed()) {
                throw new ConflictException("Final submitted score cannot be edited.");
            }

            score.setValue(scoreItem.value().floatValue());
            score.setComment(scoreItem.comment());
            score.setIsDraft(draft);
            scoreRepository.save(score);
        }

        if (requiredAllCriteria) {
            long confirmedCount = scoreRepository.countBySubmissionIdAndJudgeIdAndIsDraftFalse(submission.getId(), judge.getId());
            long expectedCount = activeCriteria.size();
            if (confirmedCount < expectedCount) {
                throw new BadRequestException("All active criteria must be scored before final submission.");
            }
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void recordAuditLog(User actor, AuditActionType actionType,
                                Submission submission, Map<String, Object> context) {

        Map<String, Object> saveContext = new HashMap<>();
        if (context != null) {
            saveContext.putAll(context);
        }
        saveContext.put("roundId", submission.getRound().getId().toString());
        saveContext.put("eventId", submission.getRound().getEvent().getId().toString());

        if (submission.getTeam() != null) {
            saveContext.put("teamId", submission.getTeam().getId().toString());
        }

        auditLogService.record(
                actor,
                actionType,
                "score",
                submission.getId(),
                null,
                Map.of("submissionId", submission.getId().toString()),
                saveContext
        );
    }
}

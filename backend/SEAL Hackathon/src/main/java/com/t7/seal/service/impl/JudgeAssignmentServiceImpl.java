package com.t7.seal.service.impl;

import com.t7.seal.domain.NotificationChannel;
import com.t7.seal.domain.NotificationStatus;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.entities.EventCriteria;
import com.t7.seal.entities.Judge;
import com.t7.seal.entities.Notification;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.RoundJudgeAssignment;
import com.t7.seal.entities.Submission;
import com.t7.seal.entities.SubmissionLink;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.EventCriteriaRepository;
import com.t7.seal.repository.JudgeRepository;
import com.t7.seal.repository.MentorAssignmentRepository;
import com.t7.seal.repository.NotificationRepository;
import com.t7.seal.repository.RoundJudgeAssignmentRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.ScoreRepository;
import com.t7.seal.repository.SubmissionLinkRepository;
import com.t7.seal.repository.SubmissionRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.request.round.AssignJudgeRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.grading.AssignedSubmissionResponse;
import com.t7.seal.response.grading.GradingSubmissionDetailResponse;
import com.t7.seal.response.grading.JudgeSubmissionAssignmentResponse;
import com.t7.seal.response.round.JudgeAssignmentResponse;
import com.t7.seal.response.submission.SubmissionLinkResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.EmailService;
import com.t7.seal.service.JudgeAssignmentService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JudgeAssignmentServiceImpl implements JudgeAssignmentService {

    private static final int MAX_PAGE_SIZE = 100;

    private final RoundJudgeAssignmentRepository assignmentRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final JudgeRepository judgeRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionLinkRepository submissionLinkRepository;
    private final EventCriteriaRepository eventCriteriaRepository;
    private final ScoreRepository scoreRepository;
    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public List<JudgeAssignmentResponse> getJudgeAssignments(UUID roundId) {
        return assignmentRepository.findByRoundIdWithJudgeAndTrack(roundId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public JudgeAssignmentResponse assignJudge(UUID roundId, AssignJudgeRequest request, Authentication authentication) {
        User assignedBy = currentUserService.getCurrentUser(authentication);

        if (request.judgeId() == null) {
            throw new BadRequestException("judgeId is required.");
        }

        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found."));

        assertAssignmentEditable(round.getEvent().getStatus());

        Judge judge = judgeRepository.findByIdWithUser(request.judgeId())
                .orElseThrow(() -> new NotFoundException("Judge not found."));
        ensureJudgeCanBeAssigned(judge);

        Track track = null;

        if (request.trackId() != null) {
            track = trackRepository.findById(request.trackId())
                    .orElseThrow(() -> new NotFoundException("Track not found."));

            if (!track.getEvent().getId().equals(round.getEvent().getId())) {
                throw new BadRequestException("Track does not belong to the same event as round.");
            }
        }

        UUID trackId = track == null ? null : track.getId();

        if (assignmentRepository.existsOverlappingAssignment(roundId, judge.getId(), trackId)) {
            throw new ConflictException("Judge is already assigned to this round/track.");
        }

        if (hasMentorConflict(round, track, judge.getUser().getId())) {
            throw new ConflictException("This user is already assigned as mentor for this track/event.");
        }

        RoundJudgeAssignment assignment = new RoundJudgeAssignment();
        assignment.setRound(round);
        assignment.setJudge(judge);
        assignment.setTrack(track);
        assignment.setAssignedBy(assignedBy);
        assignment.setScoringProgress(0);

        Integer totalToScore = request.totalToScore();
        if (totalToScore == null) {
            totalToScore = Math.toIntExact(submissionRepository.count(assignedSubmissionSpecForSlot(round, track, null)));
        }
        assignment.setTotalToScore(totalToScore);

        RoundJudgeAssignment saved = assignmentRepository.save(assignment);
        createJudgeAssignedNotification(saved, assignedBy);
        sendJudgeAssignedEmailSafely(saved);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void removeJudgeAssignment(UUID roundId, UUID assignmentId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        RoundJudgeAssignment assignment = assignmentRepository.findByIdAndRoundId(assignmentId, roundId)
                .orElseThrow(() -> new NotFoundException("Judge assignment not found."));

        assertAssignmentEditable(assignment.getRound().getEvent().getStatus());

        assignmentRepository.delete(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JudgeAssignmentResponse> getMyAssignments(Authentication authentication) {
        Judge judge = currentJudge(authentication);
        return assignmentRepository.findByJudgeIdWithRoundAndTrack(judge.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<JudgeSubmissionAssignmentResponse> getMySubmissionQueue(
            UUID roundId,
            String status,
            int page,
            int size,
            Authentication authentication
    ) {
        Judge judge = currentJudge(authentication);
        List<RoundJudgeAssignment> assignments = findMyAssignments(judge, roundId);

        if (assignments.isEmpty()) {
            return emptyPage(page, normalizeSize(size));
        }

        SubmissionStatus parsedStatus = parseSubmissionStatus(status);
        int safePage = Math.max(page, 0);
        int safeSize = normalizeSize(size);

        Page<Submission> result = submissionRepository.findAll(
                assignedSubmissionSpec(assignments, parsedStatus),
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "submittedAt"))
        );

        return new PageResponse<>(
                result.getContent().stream()
                        .map(submission -> toJudgeSubmissionResponse(submission, judge))
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    private List<RoundJudgeAssignment> findMyAssignments(Judge judge, UUID roundId) {
        if (roundId == null) {
            return assignmentRepository.findByJudgeIdWithRoundAndTrack(judge.getId());
        }
        return assignmentRepository.findByJudgeIdAndRoundIdWithRoundAndTrack(judge.getId(), roundId);
    }

    private Specification<Submission> assignedSubmissionSpecForSlot(Round round, Track track, SubmissionStatus status) {
        RoundJudgeAssignment slot = new RoundJudgeAssignment();
        slot.setRound(round);
        slot.setTrack(track);
        return assignedSubmissionSpec(List.of(slot), status);
    }

    private Specification<Submission> assignedSubmissionSpec(List<RoundJudgeAssignment> assignments, SubmissionStatus status) {
        return (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }

            Join<Submission, Round> roundJoin = root.join("round");
            Join<Submission, Team> teamJoin = root.join("team");
            Join<Team, Track> trackJoin = teamJoin.join("track", JoinType.LEFT);

            List<Predicate> assignmentPredicates = new ArrayList<>();
            for (RoundJudgeAssignment assignment : assignments) {
                Predicate byRound = cb.equal(roundJoin.get("id"), assignment.getRound().getId());
                if (assignment.getTrack() == null) {
                    assignmentPredicates.add(byRound);
                } else {
                    assignmentPredicates.add(cb.and(
                            byRound,
                            cb.equal(trackJoin.get("id"), assignment.getTrack().getId())
                    ));
                }
            }

            Predicate assignmentScope = cb.or(assignmentPredicates.toArray(Predicate[]::new));
            Predicate statusScope = status == null
                    ? root.get("status").in(SubmissionStatus.SUBMITTED, SubmissionStatus.LATE)
                    : cb.equal(root.get("status"), status);

            return cb.and(assignmentScope, statusScope);
        };
    }

    private SubmissionStatus parseSubmissionStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return SubmissionStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid submission status: " + status);
        }
    }

    private int normalizeSize(int size) {
        return Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    }

    private <T> PageResponse<T> emptyPage(int page, int size) {
        return new PageResponse<>(List.of(), Math.max(page, 0), size, 0, 0, true);
    }

    private JudgeSubmissionAssignmentResponse toJudgeSubmissionResponse(Submission submission, Judge judge) {
        Team team = submission.getTeam();
        Track track = team == null ? null : team.getTrack();
        Round round = submission.getRound();
        long criteriaCount = countCriteriaForRound(round);
        long confirmedScoreCount = scoreRepository.countBySubmissionIdAndJudgeIdAndIsDraftFalse(submission.getId(), judge.getId());
        String gradingStatus = resolveGradingStatus(round, criteriaCount, confirmedScoreCount);

        return new JudgeSubmissionAssignmentResponse(
                submission.getId(),
                team == null ? null : team.getId(),
                team == null ? null : team.getName(),
                team == null ? null : team.getProjectTitle(),
                track == null ? null : track.getId(),
                track == null ? null : track.getName(),
                round == null ? null : round.getId(),
                round == null ? null : round.getName(),
                submission.getStatus() == null ? null : submission.getStatus().name(),
                submission.getSubmissionNumber(),
                submission.getSubmittedAt(),
                submission.getUpdatedAt(),
                round != null && round.isSubmissionLocked(),
                round == null ? null : round.getSubmissionLockedAt(),
                confirmedScoreCount,
                criteriaCount,
                gradingStatus
        );
    }

    private long countCriteriaForRound(Round round) {
        if (round == null || round.getEvent() == null) {
            return 0;
        }
        return eventCriteriaRepository
                .findByEventIdAndIsActiveTrueOrderByDisplayOrderAsc(round.getEvent().getId())
                .stream()
                .filter(criteria -> criteria.appliesToRound(round.getId()))
                .count();
    }

    private String resolveGradingStatus(Round round, long criteriaCount, long confirmedScoreCount) {
        if (criteriaCount > 0 && confirmedScoreCount >= criteriaCount) {
            return "GRADED";
        }
        if (round != null && round.isSubmissionLocked()) {
            return "READY";
        }
        return "PENDING";
    }

    private Judge currentJudge(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        if (!user.isJudge()) {
            throw new UnauthorizedException("Only judges can access assigned submissions.");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Judge account is not ACTIVE.");
        }

        return judgeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new UnauthorizedException("Judge profile was not found."));
    }


    private void assertAssignmentEditable(RegistrationStatus status) {
        if (status == RegistrationStatus.JUDGING
                || status == RegistrationStatus.COMPLETED
                || status == RegistrationStatus.CANCELLED) {
            throw new ConflictException("Judge assignments are locked in event status " + status + ".");
        }
    }

    private void ensureJudgeCanBeAssigned(Judge judge) {
        User user = judge.getUser();

        if (user == null || !user.isJudge()) {
            throw new BadRequestException("Selected user is not a judge.");
        }

        if (!user.isActive()) {
            throw new BadRequestException("Judge account must be ACTIVE.");
        }

        if (Boolean.TRUE.equals(judge.getIsTemporary())
                && !judge.isTemporaryActive(LocalDateTime.now())) {
            throw new ConflictException("Temporary judge account has expired.");
        }
    }

    private boolean hasMentorConflict(Round round, Track track, UUID judgeUserId) {
        if (track != null) {
            return mentorAssignmentRepository.existsByTrackIdAndUserId(track.getId(), judgeUserId);
        }

        return mentorAssignmentRepository.existsByEventIdAndUserId(round.getEvent().getId(), judgeUserId);
    }

    private JudgeAssignmentResponse toResponse(RoundJudgeAssignment assignment) {
        return new JudgeAssignmentResponse(
                assignment.getId(),
                assignment.getRound().getId(),
                assignment.getJudge().getId(),
                assignment.getJudge().getUser().getFullName(),
                assignment.getTrack() == null ? null : assignment.getTrack().getId(),
                assignment.getScoringProgress(),
                assignment.getTotalToScore()
        );
    }
}

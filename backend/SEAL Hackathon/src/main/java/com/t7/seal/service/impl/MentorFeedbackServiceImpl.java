package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.*;
import com.t7.seal.request.mentor.CreateMentorFeedbackRequest;
import com.t7.seal.response.mentor.MentorFeedbackResponse;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.MentorFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MentorFeedbackServiceImpl implements MentorFeedbackService {

    private final MentorFeedbackRepository mentorFeedbackRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final RoundRepository roundRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    @Override
    public MentorFeedbackResponse createFeedback(
            UUID teamId,
            CreateMentorFeedbackRequest request,
            Authentication authentication
    ) {
        Team team = getTeam(teamId);
        User mentor = getCurrentUser(authentication);

        ensureMentorAssignedToTeam(team, authentication);

        Submission submission = resovleSubmission(request.submissionId(), team);
        Round round = resovleRound(request.roundId(), submission, team);

        MentorFeedback mentorFeedback = MentorFeedback.builder()
                .team(team)
                .submission(submission)
                .round(round)
                .mentor(mentor)
                .category(parseCategory(request.category()))
                .content(requiredContent(request.content()))
                .visibleToTeam(Boolean.TRUE.equals(request.visibleToTeam()))
                .visibility(MentorFeedbackVisibility.DRAFT)
                .build();

        if (Boolean.TRUE.equals(request.publish())) {
            mentorFeedback.publish(LocalDateTime.now());
        }

        MentorFeedback saved = mentorFeedbackRepository.save(mentorFeedback);

        if (saved.isPublished()) {
            createFeedbackNotification(saved);
        }

        return toMentorFeedbackResponse(saved);
    }

    @Override
    public List<MentorFeedbackResponse> getTeamFeedback(UUID teamId, Authentication authentication) {
        return null;
    }

    @Override
    public List<MentorFeedbackResponse> getMentorTeamFeedback(UUID teamId, Authentication authentication) {
        Team team = getTeam(teamId);

        ensureMentorAssignedToTeam(team, authentication);

        return mentorFeedbackRepository.findByTeamIdOrderByCreatedAtDesc(teamId)
                .stream()
                .map(this::toMentorFeedbackResponse)
                .toList();
    }

    @Override
    public MentorFeedbackResponse getMentorFeedbackById(UUID feedbackId, Authentication authentication) {
        return null;
    }

    @Override
    public MentorFeedbackResponse updateFeedback(UUID feedbackId, CreateMentorFeedbackRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public void deleteFeedback(UUID feedbackId, Authentication authentication) {

    }

    @Override
    public MentorFeedbackResponse publishFeedback(UUID feedbackId, Authentication authentication) {
        return null;
    }

    //HELPERS
    private Team getTeam(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found " + teamId));
    }

    private User getCurrentUser(Authentication authentication) {
        UUID userId = CurrentUser.id(authentication);

        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found " + userId));
    }

    private void ensureMentorAssignedToTeam(Team team, Authentication authentication) {
        UUID currentUserId = CurrentUser.id(authentication);

        if (CurrentUser.isAdminOrCoordinator(authentication)) {
            return;
        }

        if (!isMentorAssignedToTeam(team, CurrentUser.id(authentication))) {
            throw new UnauthorizedException("Mentor is not assigned to this team's track.");
        }
    }

    private boolean isMentorAssignedToTeam(Team team, UUID userId) {
        return team.getTrack() != null && mentorAssignmentRepository
                .existsByTrackIdAndUserId(team.getTrack().getId(), userId);
    }

    private Submission resovleSubmission(UUID submissionId, Team team) {
        if (submissionId == null) {
            return null;
        }

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found " + submissionId));

        if (!submission.getTeam().getId().equals(team.getId())) {
            throw new BadRequestException("Submission does not belong to this team.");
        }

        return submission;
    }

    private Round resovleRound(UUID roundId, Submission submission, Team team) {
        if (submission != null) {
            return submission.getRound();
        }

        if (roundId == null) {
            return null;
        }

        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found " + roundId));

        if (team.getTrack() == null
                || round.getEvent() == null
                || team.getTrack().getEvent() == null
                || !round.getEvent().getId().equals(team.getTrack().getEvent().getId())) {
            throw new BadRequestException("Round does not belong to this team's event.");
        }

        return round;
    }

    private MentorFeedbackCategory parseCategory(String category) {
        if (category == null || category.isBlank()) {
            return MentorFeedbackCategory.GENERAL;
        }

        try {
            return MentorFeedbackCategory.valueOf(category.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported mentor feedback category: " + category);
        }
    }

    private String requiredContent(String content) {
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Feedback content is required.");
        }
        return content.trim();
    }

    private void createFeedbackNotification(MentorFeedback feedback) {
        Team team = feedback.getTeam();
        if (team == null || feedback.getMentor() == null) {
            return;
        }

        try {
            String teamName = team.getName() == null ? "Your team" : team.getName();
            String roundName = feedback.getRound() == null ? null : feedback.getRound().getName();
            String scopeText = roundName == null ? "" : " for " + roundName;

            notificationRepository.save(
                    Notification.builder()
                            .event(team.getTrack() == null ? null : team.getTrack().getEvent())
                            .createdBy(feedback.getMentor())
                            .type(NotificationType.MENTOR_FEEDBACK)
                            .title("Mentor feedback is available")
                            .body("Mentor feedback is available for " + teamName + scopeText + ".")
                            .targetScope(NotificationTargetScope.TEAM)
                            .targetId(team.getId())
                            .channel(NotificationChannel.BOTH)
                            .status(NotificationStatus.PROCESSING)
                            .recipientCount(team.getMemberCount())
                            .build()
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private MentorFeedbackResponse toMentorFeedbackResponse(MentorFeedback feedback) {
        Team team = feedback.getTeam();
        Submission submission = feedback.getSubmission();
        Round round = feedback.getRound();
        User mentor = feedback.getMentor();

        return new MentorFeedbackResponse(
                feedback.getId(),
                team == null ? null : team.getId(),
                team == null ? null : team.getName(),
                submission == null ? null : submission.getId(),
                round == null ? null : round.getId(),
                round == null ? null : round.getName(),
                mentor == null ? null : mentor.getId(),
                mentor == null ? null : mentor.getFullName(),
                feedback.getCategory() == null ? null : feedback.getCategory().name(),
                feedback.getContent(),
                feedback.getVisibility() == null ? null : feedback.getVisibility().name(),
                feedback.getVisibleToTeam(),
                feedback.getCreatedAt(),
                feedback.getUpdatedAt(),
                feedback.getPublishedAt()
        );
    }
}

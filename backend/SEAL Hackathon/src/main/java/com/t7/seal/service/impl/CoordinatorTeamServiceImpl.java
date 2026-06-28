package com.t7.seal.service.impl;

import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Submission;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.TeamMember;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.SubmissionRepository;
import com.t7.seal.repository.TeamMemberRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.coordinator.CoordinatorTeamDetailResponse;
import com.t7.seal.response.coordinator.CoordinatorTeamMemberResponse;
import com.t7.seal.response.coordinator.CoordinatorTeamSubmissionProgressResponse;
import com.t7.seal.response.coordinator.CoordinatorTeamSummaryResponse;
import com.t7.seal.service.CoordinatorTeamService;
import com.t7.seal.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CoordinatorTeamServiceImpl implements CoordinatorTeamService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<SubmissionStatus> SUBMITTED_STATUSES = EnumSet.of(
            SubmissionStatus.SUBMITTED,
            SubmissionStatus.LATE
    );

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final SubmissionRepository submissionRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    @Override
    public PageResponse<CoordinatorTeamSummaryResponse> getEventTeams(
            UUID eventId,
            UUID trackId,
            String status,
            String search,
            int page,
            int size,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);

        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        ensureTrackBelongsToEvent(event, trackId);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Page<Team> result = teamRepository.searchCoordinatorTeams(
                event.getId(),
                trackId,
                parseTeamStatus(status),
                normalizeSearch(search),
                PageRequest.of(safePage, safeSize)
        );

        return new PageResponse<>(
                result.getContent().stream().map(this::toSummaryResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public CoordinatorTeamDetailResponse getTeamSummary(UUID teamId, Authentication authentication) {
        ensureCoordinator(authentication);

        Team team = teamRepository.findCoordinatorDetailById(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found " + teamId));

        List<TeamMember> members = teamMemberRepository.findByTeamIdAndLeftAtIsNullOrderByJoinedAtAsc(teamId);
        List<Submission> submissions = submissionRepository.findByTeamIdOrderByRoundOrderIndexAsc(teamId);

        return toDetailResponse(team, members, submissions);
    }

    private void ensureTrackBelongsToEvent(HackathonEvent event, UUID trackId) {
        if (trackId == null) {
            return;
        }

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found " + trackId));
        if (track.getEvent() == null || !event.getId().equals(track.getEvent().getId())) {
            throw new BadRequestException("Track does not belong to the requested event.");
        }
    }

    private void ensureCoordinator(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.COORDINATOR) {
            throw new ForbiddenException("Only coordinator or admin can access team management.");
        }
    }

    private TeamStatus parseTeamStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return TeamStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid team status: " + status);
        }
    }

    private String normalizeSearch(String search) {
        return search == null || search.isBlank() ? null : search.trim();
    }

    private CoordinatorTeamSummaryResponse toSummaryResponse(Team team) {
        long submissionCount = submissionRepository.countByTeamId(team.getId());
        long submittedSubmissionCount = submissionRepository.countByTeamIdAndStatusIn(team.getId(), SUBMITTED_STATUSES);
        long missingSubmissionCount = missingSubmissionCount(team, submittedSubmissionCount);

        return new CoordinatorTeamSummaryResponse(
                team.getId(),
                team.getName(),
                team.getProjectTitle(),
                enumName(team.getStatus()),
                eventId(team),
                eventName(team),
                trackId(team),
                trackName(team),
                team.getLeader() == null ? null : team.getLeader().getId(),
                team.getLeader() == null ? null : team.getLeader().getFullName(),
                team.getLeader() == null ? null : team.getLeader().getEmail(),
                team.getMemberCount() == null ? 0 : team.getMemberCount(),
                submissionCount,
                submittedSubmissionCount,
                missingSubmissionCount,
                latestSubmissionStatus(team.getId()),
                team.getRegisteredAt(),
                team.getCreatedAt(),
                team.getUpdatedAt()
        );
    }

    private CoordinatorTeamDetailResponse toDetailResponse(
            Team team,
            List<TeamMember> members,
            List<Submission> submissions
    ) {
        long submittedSubmissionCount = submissions.stream()
                .filter(submission -> SUBMITTED_STATUSES.contains(submission.getStatus()))
                .count();

        return new CoordinatorTeamDetailResponse(
                team.getId(),
                team.getName(),
                team.getProjectTitle(),
                team.getDescription(),
                enumName(team.getStatus()),
                eventId(team),
                eventName(team),
                trackId(team),
                trackName(team),
                team.getLeader() == null ? null : team.getLeader().getId(),
                team.getLeader() == null ? null : team.getLeader().getFullName(),
                team.getLeader() == null ? null : team.getLeader().getEmail(),
                team.getJoinCode(),
                team.hasJoinCodeEnabled(),
                members.size(),
                submissions.size(),
                submittedSubmissionCount,
                missingSubmissionCount(team, submittedSubmissionCount),
                submissions.stream().reduce((previous, current) -> current)
                        .map(submission -> submission.getStatus())
                        .map(Enum::name)
                        .orElse(null),
                team.getRegisteredAt(),
                team.getCreatedAt(),
                team.getUpdatedAt(),
                members.stream().map(this::toMemberResponse).toList(),
                submissions.stream().map(this::toSubmissionProgressResponse).toList()
        );
    }

    private CoordinatorTeamMemberResponse toMemberResponse(TeamMember member) {
        User user = member.getUser();
        return new CoordinatorTeamMemberResponse(
                member.getId(),
                user == null ? null : user.getId(),
                user == null ? null : user.getFullName(),
                user == null ? null : user.getEmail(),
                member.getRole() == null ? null : member.getRole().name(),
                user == null || user.getStatus() == null ? null : user.getStatus().name(),
                member.getJoinedAt()
        );
    }

    private CoordinatorTeamSubmissionProgressResponse toSubmissionProgressResponse(Submission submission) {
        int linkCount = submission.getSubmissionLinks() == null ? 0 : submission.getSubmissionLinks().size();
        return new CoordinatorTeamSubmissionProgressResponse(
                submission.getRound() == null ? null : submission.getRound().getId(),
                submission.getRound() == null ? null : submission.getRound().getName(),
                submission.getRound() == null ? null : submission.getRound().getOrderIndex(),
                submission.getRound() == null || submission.getRound().getStatus() == null
                        ? null
                        : submission.getRound().getStatus().name(),
                submission.getId(),
                submission.getStatus() == null ? null : submission.getStatus().name(),
                submission.getSubmissionNumber(),
                submission.getSubmittedAt(),
                submission.getUpdatedAt(),
                linkCount,
                submission.getNote()
        );
    }

    private long missingSubmissionCount(Team team, long submittedSubmissionCount) {
        UUID eventId = eventId(team);
        if (eventId == null) {
            return 0;
        }

        long roundCount = roundRepository.countByEventId(eventId);
        return Math.max(0, roundCount - submittedSubmissionCount);
    }

    private String latestSubmissionStatus(UUID teamId) {
        return submissionRepository.findByTeamIdOrderByRoundOrderIndexAsc(teamId)
                .stream()
                .reduce((previous, current) -> current)
                .map(submission -> submission.getStatus())
                .map(Enum::name)
                .orElse(null);
    }

    private UUID eventId(Team team) {
        return team.getTrack() == null || team.getTrack().getEvent() == null
                ? null
                : team.getTrack().getEvent().getId();
    }

    private String eventName(Team team) {
        return team.getTrack() == null || team.getTrack().getEvent() == null
                ? null
                : team.getTrack().getEvent().getName();
    }

    private UUID trackId(Team team) {
        return team.getTrack() == null ? null : team.getTrack().getId();
    }

    private String trackName(Team team) {
        return team.getTrack() == null ? null : team.getTrack().getName();
    }

    private String enumName(Enum<?> value) {
        return value == null ? null : value.name();
    }
}

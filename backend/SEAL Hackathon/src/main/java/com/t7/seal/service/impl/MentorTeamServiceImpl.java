package com.t7.seal.service.impl;

import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.*;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.mentor.*;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.MentorTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorTeamServiceImpl implements MentorTeamService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<SubmissionStatus> SUBMITTED_STATUSES = EnumSet.of(
            SubmissionStatus.SUBMITTED,
            SubmissionStatus.LATE
    );

    private final CurrentUserService currentUserService;

    private final TrackRepository trackRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final TeamRepository teamRepository;
    private final SubmissionRepository submissionRepository;
    private final RoundRepository roundRepository;
    private final TeamMemberRepository teamMemberRepository;


    @Transactional(readOnly = true)
    @Override
    public List<MentorTrackResponse> getMyAssignedTracks(UUID eventId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        ensureMentorOrManager(user);

        List<MentorAssignment> assignments;
        if (user.getRole() == UserRole.COORDINATOR || user.getRole() == UserRole.ADMIN) {
            assignments = trackRepository.findAll()
                    .stream()
                    .filter(t -> eventId == null
                            || (t.getEvent() != null && t.getEvent().getId().equals(eventId))
                    )
                    .map(track -> MentorAssignment.builder()
                            .id(null)
                            .track(track)
                            .user(user)
                            .assignedBy(user)
                            .assignedAt(null)
                            .build()
                    )
                    .toList();
        } else {
            assignments = mentorAssignmentRepository.findAssignedTrackByUserId(user.getId(), eventId);
        }

        return assignments.stream()
                .map(this::toMentorTrackResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponse<MentorTeamProgressResponse> getTeamInAssignedTracks(
            UUID trackId,
            String status,
            String search,
            int page,
            int size,
            Authentication authentication
    ) {
        User user = currentUserService.getCurrentUser(authentication);
        Track track = findTrack(trackId);

        ensureCanViewTrack(user, track);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Page<Team> result = teamRepository.searchMentorTrackTeams(
                trackId,
                parseTeamStatus(status),
                normalizeSearch(search),
                PageRequest.of(safePage, safeSize));

        return new PageResponse<>(
                result.getContent().stream()
                        .map(this::toMentorTeamProgressResponse)
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public MentorTeamDetailResponse getAssignedTeamDetails(UUID teamId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        ensureMentorOrManager(user);

        Team team = teamRepository.findMentorDetailsById(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found"));

        if (team.getTrack() == null) {
            throw new BadRequestException("Team does not belong to any track.");
        }

        ensureCanViewTrack(user, team.getTrack());

        List<TeamMember> teamMembers = teamMemberRepository.findByTeamIdAndLeftAtIsNullOrderByJoinedAtAsc(teamId);
        List<Submission> submissions = submissionRepository.findByTeamIdOrderByRoundOrderIndexAsc(teamId);

        return toMentorTeamDetailResponse(team, teamMembers, submissions);
    }

    //HELPERS
    private void ensureMentorOrManager(User user) {
        if (user.getRole() == UserRole.MENTOR
                || user.getRole() == UserRole.COORDINATOR
                || user.getRole() == UserRole.ADMIN) {
            return;
        }
        throw new UnauthorizedException("Only assigned mentor or coordinator or admin can be accessed to this resource.");
    }

    private MentorTrackResponse toMentorTrackResponse(MentorAssignment assignment) {
        Track track = assignment.getTrack();
        long teamCount = teamRepository.countActiveMemberByTrackId(track.getId());
        long submittedCount = submissionRepository.countSubmittedOrLateByTrackId(track.getId());

        return new MentorTrackResponse(
                assignment.getId(),
                track.getId(),
                track.getName(),
                track.getDescription(),
                track.getEvent() == null ? null : track.getEvent().getId(),
                track.getEvent() == null ? null : track.getEvent().getName(),
                track.getEvent() == null || track.getEvent().getStatus() == null
                        ? null : track.getEvent().getStatus().name(),
                track.getMaxTeams(),
                track.getMinMembers(),
                track.getMaxMembers(),
                teamCount,
                submittedCount,
                assignment.getAssignedAt()
        );
    }

    private Track findTrack(UUID trackId) {
        if (trackId == null) {
            throw new BadRequestException("Track id is required");
        }
        return trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found"));
    }

    private void ensureCanViewTrack(User user, Track track) {
        ensureMentorOrManager(user);

        if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.COORDINATOR) {
            return;
        }

        if (mentorAssignmentRepository.existsByTrackIdAndUserId(track.getId(), user.getId())) {
            return;
        }
        throw new UnauthorizedException("You are not authorized to view this track.");
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

    private MentorTeamProgressResponse toMentorTeamProgressResponse(Team team) {
        List<Submission> submissions = submissionRepository
                .findByTeamIdOrderByRoundOrderIndexAsc(team.getId());

        long submittedSubmissionCount = submissions.stream()
                .filter(s -> SUBMITTED_STATUSES.contains(s.getStatus()))
                .count();

        return new MentorTeamProgressResponse(
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
                submissions.size(),
                submittedSubmissionCount,
                submissionCount(team, submittedSubmissionCount),
                latestSubmissionStatus(submissions),
                team.getRegisteredAt(),
                team.getCreatedAt(),
                team.getUpdatedAt(),
                buildRoundProgress(team, submissions)
        );
    }

    private String enumName(Enum<?> e) {
        return e == null ? null : e.name();
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

    private long submissionCount(Team team, long submittedSubmissionCount) {
        UUID eventId = eventId(team);
        if (eventId == null) {
            return 0;
        }

        long roundCount = roundRepository.countByEventId(eventId);

        return Math.max(0, roundCount - submittedSubmissionCount);
    }

    private String latestSubmissionStatus(List<Submission> submissions) {
        return submissions.stream()
                .reduce((previous, current) -> current)
                .map(Submission::getStatus)
                .map(Enum::name)
                .orElse(null);
    }

    private List<MentorTeamRoundProgressResponse> buildRoundProgress(
            Team team,
            List<Submission> submissions
    ) {
        UUID eventId = eventId(team);

        if (eventId == null) {
            return submissions.stream()
                    .map(this::toMentorTeamRoundProgressResponse)
                    .toList();
        }

        Map<UUID, Submission> byRoundId = submissions.stream()
                .filter(submission -> submission.getRound() != null
                        && submission.getRound().getId() != null)
                .collect(Collectors.toMap(
                        submission -> submission.getRound().getId(),
                        Function.identity(),
                        (left, right) -> right
                ));

        return roundRepository.findByEventIdOrderByOrderIndexAsc(eventId)
                .stream()
                .map(r -> {
                    Submission submission = byRoundId.get(r.getId());
                    if (submission != null) {
                        return toMentorTeamRoundProgressResponse(submission);
                    }

                    return new MentorTeamRoundProgressResponse(
                            r.getId(),
                            r.getName(),
                            r.getOrderIndex(),
                            enumName(r.getStatus()),
                            null,
                            "NOT_SUBMITTED",
                            null,
                            null,
                            null,
                            0,
                            null
                    );
                })
                .toList();
    }

    private MentorTeamRoundProgressResponse toMentorTeamRoundProgressResponse(Submission submission) {
        int linkCount = submission.getSubmissionLinks() == null ? 0 : submission.getSubmissionLinks().size();

        return new MentorTeamRoundProgressResponse(
                submission.getRound() == null ? null : submission.getRound().getId(),
                submission.getRound() == null ? null : submission.getRound().getName(),
                submission.getRound() == null ? null : submission.getRound().getOrderIndex(),
                submission.getRound() == null || submission.getRound().getStatus() == null
                        ? null : submission.getRound().getStatus().name(),
                submission.getId(),
                enumName(submission.getStatus()),
                submission.getSubmissionNumber(),
                submission.getSubmittedAt(),
                submission.getUpdatedAt(),
                linkCount,
                submission.getNote()
        );
    }

    private MentorTeamDetailResponse toMentorTeamDetailResponse(
            Team team,
            List<TeamMember> members,
            List<Submission> submissions
    ) {
        long submittedSubmissionCount = submissions.stream()
                .filter(s -> SUBMITTED_STATUSES.contains(s.getStatus()))
                .count();

        return new MentorTeamDetailResponse(
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
                members.size(),
                submissions.size(),
                submittedSubmissionCount,
                submissionCount(team, submittedSubmissionCount),
                latestSubmissionStatus(submissions),
                team.getRegisteredAt(),
                team.getCreatedAt(),
                team.getUpdatedAt(),
                members.stream().map(this::toMentorTeamMemberResponse).toList(),
                buildRoundProgress(team, submissions)
        );
    }

    private MentorTeamMemberResponse toMentorTeamMemberResponse(TeamMember teamMember) {
        User user = teamMember.getUser();

        return new MentorTeamMemberResponse(
                teamMember.getId(),
                user == null ? null : user.getId(),
                user == null ? null : user.getFullName(),
                user == null ? null : user.getEmail(),
                teamMember.getRole() == null ? null : teamMember.getRole().name(),
                user == null || user.getStatus() == null ? null : user.getStatus().name(),
                teamMember.getJoinedAt()
        );
    }
}

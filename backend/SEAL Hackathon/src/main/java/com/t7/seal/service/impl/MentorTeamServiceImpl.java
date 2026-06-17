package com.t7.seal.service.impl;

import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.MentorAssignment;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.MentorAssignmentRepository;
import com.t7.seal.repository.SubmissionRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.mentor.MentorTeamDetailResponse;
import com.t7.seal.response.mentor.MentorTeamProgressResponse;
import com.t7.seal.response.mentor.MentorTrackResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.MentorTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

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


    @Transactional(readOnly = true)
    @Override
    public List<MentorTrackResponse> getMyAssignedTracks(UUID eventId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        ensureMentorOrCoordinator(user);

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
    public PageResponse<MentorTeamProgressResponse> getTeamInAssignedTracks(UUID trackId, String status, String search, int page, int size, Authentication authentication) {
        return null;
    }

    @Transactional(readOnly = true)
    @Override
    public MentorTeamDetailResponse getTeamDetails(UUID teamId, Authentication authentication) {
        return null;
    }

    //HELPERS
    private void ensureMentorOrCoordinator(User user) {
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
}

package com.t7.seal.service.impl;

import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.SubmissionRepository;
import com.t7.seal.repository.TeamMemberRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.coordinator.CoordinatorTeamDetailResponse;
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
        throw new UnsupportedOperationException("Coordinator team summary endpoint is not implemented yet.");
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
            throw new UnauthorizedException("Only coordinator or admin can access team management.");
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
}

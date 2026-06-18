package com.t7.seal.service.impl;

import com.t7.seal.domain.InvitationStatus;
import com.t7.seal.domain.TeamInvitationType;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.User;
import com.t7.seal.repository.TeamInvitationRepository;
import com.t7.seal.repository.TeamMemberRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.response.team.FormingTeamResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.FormingTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FormingTeamServiceImpl implements FormingTeamService {

    private static final int DEFAULT_MAX_TEAM_MEMBERS = 5;
    private static final int MAX_PAGE_SIZE = 100;

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public Page<FormingTeamResponse> getFormingTeams(
            UUID eventId,
            UUID trackId,
            String search,
            int page,
            int size,
            Authentication authentication
    ) {
        User currentUser = currentUserService.getCurrentUser(authentication);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));

        return teamRepository.searchFormingTeams(eventId, trackId, trimToNull(search), pageable)
                .map(team -> toResponse(team, currentUser));
    }

    private FormingTeamResponse toResponse(Team team, User currentUser) {
        UUID userId = currentUser.getId();
        boolean alreadyMember = teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(team.getId(), userId);
        boolean pendingRequest = teamInvitationRepository
                .existsByTeamIdAndInviteeIdAndTypeAndStatusAndExpiresAtAfter(
                        team.getId(),
                        userId,
                        TeamInvitationType.JOIN_REQUEST,
                        InvitationStatus.PENDING,
                        LocalDateTime.now()
                );
        boolean hasSameTrackTeam = team.getTrack() != null
                && teamMemberRepository.existsActiveMembershipInSameTrack(
                        userId,
                        team.getId(),
                        team.getTrack().getId()
                );
        int maxMembers = maxMembersFor(team);
        boolean canRequestJoin = currentUser.isStudent()
                && currentUser.isActive()
                && !alreadyMember
                && !pendingRequest
                && !hasSameTrackTeam
                && team.isForming()
                && !team.isAtMemberLimit(maxMembers)
                && !team.getLeader().getId().equals(userId);

        return new FormingTeamResponse(
                team.getId(),
                team.getName(),
                team.getProjectTitle(),
                team.getDescription(),
                team.getLeader().getId(),
                team.getLeader().getFullName(),
                team.getTrack() == null ? null : team.getTrack().getId(),
                team.getTrack() == null ? null : team.getTrack().getName(),
                team.getTrack() == null || team.getTrack().getEvent() == null
                        ? null
                        : team.getTrack().getEvent().getId(),
                team.getTrack() == null || team.getTrack().getEvent() == null
                        ? null
                        : team.getTrack().getEvent().getName(),
                team.getStatus().name(),
                team.getMemberCount() == null ? 0 : team.getMemberCount(),
                maxMembers,
                team.hasJoinCodeEnabled(),
                canRequestJoin,
                alreadyMember,
                pendingRequest
        );
    }

    private int maxMembersFor(Team team) {
        return team.getTrack() != null && team.getTrack().getMaxMembers() != null
                ? team.getTrack().getMaxMembers()
                : DEFAULT_MAX_TEAM_MEMBERS;
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

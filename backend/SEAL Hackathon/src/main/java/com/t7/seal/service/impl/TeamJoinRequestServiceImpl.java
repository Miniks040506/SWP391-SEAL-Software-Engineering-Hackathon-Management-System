package com.t7.seal.service.impl;

import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.InvitationStatus;
import com.t7.seal.domain.MemberRole;
import com.t7.seal.domain.TeamInvitationType;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.entities.AuditLog;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.TeamInvitation;
import com.t7.seal.entities.TeamMember;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.AuditLogRepository;
import com.t7.seal.repository.StudentProfileRepository;
import com.t7.seal.repository.TeamInvitationRepository;
import com.t7.seal.repository.TeamMemberRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.request.team.CreateTeamJoinRequest;
import com.t7.seal.request.team.ReasonRequest;
import com.t7.seal.response.team.TeamJoinRequestResponse;
import com.t7.seal.response.team.TeamMemberResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.TeamJoinRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamJoinRequestServiceImpl implements TeamJoinRequestService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int DEFAULT_MAX_TEAM_MEMBERS = 5;
    private static final int REQUEST_TTL_HOURS = 48;

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AuditLogRepository auditLogRepository;
    private final CurrentUserService currentUserService;
    private final TeamJoinRequestMapper mapper;
    private final TeamJoinRequestNotifier notifier;

    @Override
    @Transactional
    public TeamJoinRequestResponse create(
            UUID teamId,
            CreateTeamJoinRequest request,
            Authentication authentication
    ) {
        User requester = currentUserService.getCurrentUser(authentication);
        ensureActiveStudent(requester);

        Team team = getTeamForUpdate(teamId);
        validateCanJoin(team, requester);

        LocalDateTime now = LocalDateTime.now();
        boolean hasPendingRequest = teamInvitationRepository
                .existsByTeamIdAndInviteeIdAndTypeAndStatusAndExpiresAtAfter(
                        teamId,
                        requester.getId(),
                        TeamInvitationType.JOIN_REQUEST,
                        InvitationStatus.PENDING,
                        now
                );
        if (hasPendingRequest) {
            throw new ConflictException("You already have a pending join request for this team.");
        }

        TeamInvitation joinRequest = TeamInvitation.builder()
                .team(team)
                .invitedBy(requester)
                .inviteEmail(requester.getEmail().trim().toLowerCase())
                .invitee(requester)
                .token(generateToken())
                .status(InvitationStatus.PENDING)
                .type(TeamInvitationType.JOIN_REQUEST)
                .message(trimToNull(request == null ? null : request.message()))
                .expiresAt(now.plusHours(REQUEST_TTL_HOURS))
                .createdAt(now)
                .build();

        TeamInvitation saved = teamInvitationRepository.save(joinRequest);
        audit(saved, requester, AuditActionType.TEAM_JOIN_REQUEST_SENT);
        notifier.notifyLeader(saved);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamJoinRequestResponse> getForTeam(UUID teamId, Authentication authentication) {
        Team team = getTeam(teamId);
        ensureLeader(team, authentication);
        return teamInvitationRepository
                .findByTeamIdAndTypeOrderByCreatedAtDesc(teamId, TeamInvitationType.JOIN_REQUEST)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamJoinRequestResponse> getForCurrentUser(Authentication authentication) {
        User currentUser = currentUserService.getCurrentUser(authentication);
        return teamInvitationRepository
                .findByInviteeIdAndTypeOrderByCreatedAtDesc(
                        currentUser.getId(),
                        TeamInvitationType.JOIN_REQUEST
                )
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TeamJoinRequestResponse getByToken(String token) {
        return mapper.toResponse(teamInvitationRepository
                .findDetailByTokenAndType(token, TeamInvitationType.JOIN_REQUEST)
                .orElseThrow(() -> new NotFoundException("Team join request not found.")));
    }

    @Override
    @Transactional
    public TeamMemberResponse accept(UUID requestId, Authentication authentication) {
        TeamInvitation request = getLockedById(requestId);
        ensureLeader(request.getTeam(), authentication);
        return acceptLocked(request, request.getTeam().getLeader());
    }

    @Override
    @Transactional
    public TeamMemberResponse acceptByToken(String token) {
        TeamInvitation request = getLockedByToken(token);
        return acceptLocked(request, request.getTeam().getLeader());
    }

    @Override
    @Transactional
    public void reject(UUID requestId, ReasonRequest reason, Authentication authentication) {
        TeamInvitation request = getLockedById(requestId);
        ensureLeader(request.getTeam(), authentication);
        rejectLocked(request, reason, request.getTeam().getLeader());
    }

    @Override
    @Transactional
    public void rejectByToken(String token, ReasonRequest reason) {
        TeamInvitation request = getLockedByToken(token);
        rejectLocked(request, reason, request.getTeam().getLeader());
    }

    private TeamMemberResponse acceptLocked(TeamInvitation request, User actor) {
        ensurePendingAndCurrent(request);
        Team team = lockRequestTeam(request);
        User requester = requesterOrThrow(request);
        ensureActiveStudent(requester);
        validateCanJoin(team, requester);

        LocalDateTime now = LocalDateTime.now();
        request.accept(now);
        TeamMember member = TeamMember.builder()
                .team(team)
                .user(requester)
                .role(MemberRole.MEMBER)
                .joinedAt(now)
                .build();

        team.incrementMemberCount();
        team.setUpdatedAt(now);
        TeamMember savedMember = teamMemberRepository.save(member);
        cancelPendingRequestsWhenFull(team, now);
        audit(request, actor, AuditActionType.TEAM_JOIN_REQUEST_ACCEPTED);
        notifier.notifyRequester(request, actor, true);
        return toMemberResponse(savedMember);
    }

    private void rejectLocked(TeamInvitation request, ReasonRequest reason, User actor) {
        ensurePendingAndCurrent(request);
        request.decline(LocalDateTime.now());
        request.setResponseReason(trimToNull(reason == null ? null : reason.reason()));
        audit(request, actor, AuditActionType.TEAM_JOIN_REQUEST_REJECTED);
        notifier.notifyRequester(request, actor, false);
    }

    private TeamInvitation getLockedById(UUID requestId) {
        return teamInvitationRepository
                .findLockedDetailByIdAndType(requestId, TeamInvitationType.JOIN_REQUEST)
                .orElseThrow(() -> new NotFoundException("Team join request not found."));
    }

    private TeamInvitation getLockedByToken(String token) {
        return teamInvitationRepository
                .findLockedDetailByTokenAndType(token, TeamInvitationType.JOIN_REQUEST)
                .orElseThrow(() -> new NotFoundException("Team join request not found."));
    }

    private Team lockRequestTeam(TeamInvitation request) {
        Team team = getTeamForUpdate(request.getTeam().getId());
        request.setTeam(team);
        return team;
    }

    private void validateCanJoin(Team team, User requester) {
        if (team.getStatus() != TeamStatus.FORMING) {
            throw new BadRequestException("Team is not in forming status.");
        }
        if (team.isAtMemberLimit(maxMembersFor(team))) {
            throw new ConflictException("Team already reached maximum member limit.");
        }
        if (team.getLeader().getId().equals(requester.getId())
                || teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(team.getId(), requester.getId())) {
            throw new ConflictException("You are already an active member of this team.");
        }
        if (team.getTrack() != null && teamMemberRepository.existsActiveMembershipInSameTrack(
                requester.getId(), team.getId(), team.getTrack().getId())) {
            throw new ConflictException("You already have an active team in this track.");
        }
    }

    private void ensurePendingAndCurrent(TeamInvitation request) {
        if (!request.isPending()) {
            throw new ConflictException("This join request is no longer pending.");
        }
        if (request.isExpired(LocalDateTime.now())) {
            throw new ConflictException("This join request has expired.");
        }
    }

    private void ensureActiveStudent(User user) {
        if (!user.isStudent() || !user.isActive()) {
            throw new BadRequestException("Only active students can request to join a team.");
        }
        if (studentProfileRepository.findByUserId(user.getId()).isEmpty()) {
            throw new BadRequestException("Student profile is required to request to join a team.");
        }
    }

    private void ensureLeader(Team team, Authentication authentication) {
        User currentUser = currentUserService.getCurrentUser(authentication);
        if (team.getLeader() == null || !team.getLeader().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only the team leader can manage join requests.");
        }
    }

    private User requesterOrThrow(TeamInvitation request) {
        User requester = mapper.requesterOf(request);
        if (requester == null) {
            throw new ConflictException("The requester account is no longer available.");
        }
        return requester;
    }

    private Team getTeam(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found " + teamId));
    }

    private Team getTeamForUpdate(UUID teamId) {
        return teamRepository.findByIdForUpdate(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found " + teamId));
    }

    private int maxMembersFor(Team team) {
        return team.getTrack() != null && team.getTrack().getMaxMembers() != null
                ? team.getTrack().getMaxMembers()
                : DEFAULT_MAX_TEAM_MEMBERS;
    }

    private void cancelPendingRequestsWhenFull(Team team, LocalDateTime now) {
        if (!team.isAtMemberLimit(maxMembersFor(team))) {
            return;
        }
        team.setJoinCodeEnabled(false);
        teamInvitationRepository.findByTeamIdAndStatus(team.getId(), InvitationStatus.PENDING)
                .forEach(pending -> pending.cancel(now));
    }

    private void audit(TeamInvitation request, User actor, AuditActionType action) {
        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .actionType(action)
                .targetTable("team_invitations")
                .targetId(request.getId())
                .afterState(java.util.Map.of(
                        "teamId", request.getTeam().getId().toString(),
                        "requesterId", requesterOrThrow(request).getId().toString(),
                        "type", TeamInvitationType.JOIN_REQUEST.name(),
                        "status", request.getStatus().name()
                ))
                .build());
    }

    private TeamMemberResponse toMemberResponse(TeamMember member) {
        return new TeamMemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getFullName(),
                member.getUser().getEmail(),
                member.getRole().name(),
                member.getJoinedAt()
        );
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

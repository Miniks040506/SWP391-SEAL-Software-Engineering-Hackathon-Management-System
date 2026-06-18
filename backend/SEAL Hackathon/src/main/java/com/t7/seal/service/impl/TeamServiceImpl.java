package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.*;
import com.t7.seal.request.team.CreateTeamRequest;
import com.t7.seal.request.team.InviteMemberRequest;
import com.t7.seal.request.team.JoinTeamByCodeRequest;
import com.t7.seal.request.team.ReasonRequest;
import com.t7.seal.request.team.ToggleJoinCodeRequest;
import com.t7.seal.request.team.TransferLeaderRequest;
import com.t7.seal.request.team.UpdateTeamRequest;
import com.t7.seal.request.track.RegisterTeamTrackRequest;
import com.t7.seal.response.team.TeamDetailResponse;
import com.t7.seal.response.team.TeamInvitationResponse;
import com.t7.seal.response.team.TeamJoinCodePreviewResponse;
import com.t7.seal.response.team.TeamMemberResponse;
import com.t7.seal.response.team.TeamResponse;
import com.t7.seal.response.team.TeamSummaryResponse;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.EmailService;
import com.t7.seal.service.NotificationService;
import com.t7.seal.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamServiceImpl implements TeamService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int DEFAULT_MAX_TEAM_MEMBERS = 5;
    private static final int INVITATION_TTL_HOURS = 48;

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TrackRepository trackRepository;
    private final AuditLogRepository auditLogRepository;

    private final CurrentUserService currentUserService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    @Override
    public TeamResponse createTeam(CreateTeamRequest request, Authentication authentication) {
        User leader = currentUserService.getCurrentUser(authentication);

        ensureActiveStudent(leader);

        LocalDateTime now = LocalDateTime.now();

        Team team = Team.builder()
                .leader(leader)
                .name(request.name().trim())
                .projectTitle(blankToNull(request.projectTitle()))
                .description(blankToNull(request.description()))
                .joinCode(generateUniqueJoinCode())
                .joinCodeEnabled(true)
                .status(TeamStatus.FORMING)
                .memberCount(1)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Team saved = teamRepository.save(team);

        TeamMember leaderMembership = TeamMember.builder()
                .team(saved)
                .user(leader)
                .role(MemberRole.LEADER)
                .joinedAt(now)
                .build();
        teamMemberRepository.save(leaderMembership);

        return toTeamResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamSummaryResponse> getMyTeams(Authentication authentication) {

        UUID currentUserId = CurrentUser.id(authentication);

        return teamRepository.findActiveTeamByUserId(currentUserId)
                .stream()
                .map(t -> toTeamSummaryResponse(t, currentUserId))
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public TeamDetailResponse getTeamById(UUID teamId, Authentication authentication) {

        Team team = getTeam(teamId);

        ensureTeamMemberForCoordinator(team, authentication);

        List<TeamMember> members = activeMembers(team.getId());

        return new TeamDetailResponse(
                team.getId(),
                team.getName(),
                team.getProjectTitle(),
                team.getDescription(),
                team.getLeader() == null ? null : team.getLeader().getId(),
                team.getLeader() == null ? null : team.getLeader().getFullName(),
                team.getTrack() == null ? null : team.getTrack().getId(),
                team.getStatus().name(),
                team.getJoinCode(),
                team.getJoinCodeEnabled(),
                members.stream().map(this::toTeamMemberResponse).toList()
        );
    }

    @Transactional
    @Override
    public TeamResponse updateTeam(UUID teamId, UpdateTeamRequest request, Authentication authentication) {
        Team team = getTeam(teamId);

        ensureTeamLeader(team, authentication);

        ensureTeamEditable(team);

        if (request.name() != null && !request.name().isBlank()) {
            team.setName(request.name().trim());
        }

        if (request.projectTitle() != null) {
            team.setProjectTitle(blankToNull(request.projectTitle()));
        }

        if (request.description() != null) {
            team.setDescription(blankToNull(request.description()));
        }

        team.setUpdatedAt(LocalDateTime.now());

        return toTeamResponse(teamRepository.save(team));
    }

    @Transactional
    @Override
    public TeamInvitationResponse inviteMember(UUID teamId, InviteMemberRequest request, Authentication authentication) {
        Team team = getTeam(teamId);
        ensureTeamLeader(team, authentication);
        ensureTeamEditable(team);
        ensureTeamHasSpace(team);

        User inviter = currentUserService.getCurrentUser(authentication);
        String email = normalizeEmail(request.email());

        LocalDateTime now = LocalDateTime.now();
        if (teamInvitationRepository.existsByTeamIdAndInviteEmailIgnoreCaseAndTypeAndStatusAndExpiresAtAfter(
                teamId, email, TeamInvitationType.INVITATION, InvitationStatus.PENDING, now)) {
            throw new ConflictException("This email already has a pending invitation for this team.");
        }

        User invitee = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (invitee != null && teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(teamId, invitee.getId())) {
            throw new ConflictException("This user is already an active member of the team.");
        }
        if (invitee != null) {
            ensureNoSameTrackMembership(team, invitee, "This user already has an active team in this track.");
        }

        TeamInvitation invitation = TeamInvitation.builder()
                .team(team)
                .invitedBy(inviter)
                .inviteEmail(email)
                .invitee(invitee)
                .token(generateToken())
                .status(InvitationStatus.PENDING)
                .type(TeamInvitationType.INVITATION)
                .expiresAt(now.plusHours(INVITATION_TTL_HOURS))
                .createdAt(now)
                .build();

        TeamInvitation saved = teamInvitationRepository.save(invitation);
        createInvitationSentNotification(saved, inviter);
        sendInvitationSentEmail(saved, inviter, invitee);

        return toTeamInvitationResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamInvitationResponse> getTeamInvitations(UUID teamId, Authentication authentication) {
        Team team = getTeam(teamId);
        ensureTeamLeader(team, authentication);

        return teamInvitationRepository.findByTeamIdAndTypeOrderByCreatedAtDesc(
                        teamId, TeamInvitationType.INVITATION)
                .stream()
                .map(this::toTeamInvitationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamInvitationResponse> getMyInvitations(Authentication authentication) {
        User currentUser = currentUserService.getCurrentUser(authentication);

        return teamInvitationRepository.findByInviteEmailIgnoreCaseAndTypeAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(
                        currentUser.getEmail(),
                        TeamInvitationType.INVITATION,
                        InvitationStatus.PENDING,
                        LocalDateTime.now()
                )
                .stream()
                .map(this::toTeamInvitationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public TeamInvitationResponse getInvitationByToken(String token) {
        TeamInvitation invitation = teamInvitationRepository.findByTokenAndType(token, TeamInvitationType.INVITATION)
                .orElseThrow(() -> new NotFoundException("Invitation not found."));

        return toTeamInvitationResponse(invitation);
    }

    @Transactional(readOnly = true)
    @Override
    public TeamJoinCodePreviewResponse previewJoinCode(String joinCode, Authentication authentication) {
        User currentUser = currentUserService.getCurrentUser(authentication);
        ensureActiveStudent(currentUser);

        Team team = teamRepository.findByJoinCode(normalizeJoinCode(joinCode))
                .orElseThrow(() -> new NotFoundException("Team join code was not found."));

        ensureJoinCodeUsable(team);
        ensureNotAlreadyActiveMember(team, currentUser);
        ensureNoSameTrackMembership(team, currentUser);

        return toTeamJoinCodePreviewResponse(team);
    }

    @Transactional
    @Override
    public TeamMemberResponse joinByCode(JoinTeamByCodeRequest request, Authentication authentication) {
        return joinByCode(request.joinCode(), authentication);
    }

    @Transactional
    @Override
    public TeamMemberResponse joinByCode(String joinCode, Authentication authentication) {
        User currentUser = currentUserService.getCurrentUser(authentication);
        ensureActiveStudent(currentUser);

        Team team = teamRepository.findByJoinCode(normalizeJoinCode(joinCode))
                .orElseThrow(() -> new NotFoundException("Team join code was not found."));

        ensureJoinCodeUsable(team);
        ensureTeamEditable(team);
        ensureTeamHasSpace(team);
        ensureNotAlreadyActiveMember(team, currentUser);
        ensureNoSameTrackMembership(team, currentUser);

        LocalDateTime now = LocalDateTime.now();
        TeamMember member = TeamMember.builder()
                .team(team)
                .user(currentUser)
                .role(MemberRole.MEMBER)
                .joinedAt(now)
                .build();

        team.incrementMemberCount();
        team.setUpdatedAt(now);

        TeamMember savedMember = teamMemberRepository.save(member);
        cancelPendingInvitationsIfTeamFull(team, now);
        createTeamMemberJoinedByCodeNotification(team, currentUser);

        return toTeamMemberResponse(savedMember);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamMemberResponse> getTeamMembers(UUID teamId, Authentication authentication) {
        Team team = getTeam(teamId);

        ensureTeamMemberForCoordinator(team, authentication);

        List<TeamMember> members = activeMembers(team.getId());

        return members.stream().map(this::toTeamMemberResponse).toList();
    }

    @Transactional
    @Override
    public void removeTeamMember(UUID teamId, UUID memberId, ReasonRequest reason, Authentication authentication) {
        Team team = getTeam(teamId);

        ensureTeamLeader(team, authentication);
        ensureTeamEditable(team);

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Team member not found."));

        if (!member.getTeam().getId().equals(team.getId())) {
            throw new BadRequestException("Member does not belong to this team.");
        }

        if (member.isLeader()) {
            throw new BadRequestException("Leader cannot be removed from the team.");
        }

        if (!member.isActive()) {
            throw new BadRequestException("Member is not active");
        }

        LocalDateTime now = LocalDateTime.now();
        member.leave(now, LeftReason.KICKED_BY_LEADER, blankToNull(reason == null ? null : reason.reason()));
        team.decrementMemberCount();
        team.setUpdatedAt(now);
    }

    @Transactional
    @Override
    public TeamMemberResponse acceptInvitation(UUID invitationId, Authentication authentication) {
        TeamInvitation invitation = getInvitation(invitationId);
        return acceptInvitationInternal(invitation, authentication);
    }

    @Transactional
    @Override
    public TeamMemberResponse acceptInvitationByToken(String token, Authentication authentication) {
        TeamInvitation invitation = teamInvitationRepository.findByTokenAndType(token, TeamInvitationType.INVITATION)
                .orElseThrow(() -> new NotFoundException("Invitation not found."));
        return acceptInvitationInternal(invitation, authentication);
    }

    @Transactional
    @Override
    public void rejectInvitation(UUID invitationId, ReasonRequest request, Authentication authentication) {
        TeamInvitation invitation = getInvitation(invitationId);
        rejectInvitationInternal(invitation, request, authentication);
    }

    @Transactional
    @Override
    public void rejectInvitationByToken(String token, ReasonRequest request, Authentication authentication) {
        TeamInvitation invitation = teamInvitationRepository.findByTokenAndType(token, TeamInvitationType.INVITATION)
                .orElseThrow(() -> new NotFoundException("Invitation not found."));
        rejectInvitationInternal(invitation, request, authentication);
    }

    @Transactional
    @Override
    public void rejectInvitationByToken(String token, ReasonRequest request) {
        TeamInvitation invitation = teamInvitationRepository.findByTokenAndType(token, TeamInvitationType.INVITATION)
                .orElseThrow(() -> new NotFoundException("Invitation not found."));
        rejectInvitationByTokenInternal(invitation, request);
    }

    @Transactional
    @Override
    public void cancelInvitation(UUID invitationId, Authentication authentication) {
        TeamInvitation invitation = getInvitation(invitationId);
        ensureTeamLeader(invitation.getTeam(), authentication);

        if (!invitation.isPending()) {
            throw new ConflictException("Only pending invitations can be cancelled.");
        }

        invitation.cancel(LocalDateTime.now());
    }

    @Transactional
    @Override
    public TeamResponse transferLeader(UUID teamId, TransferLeaderRequest request, Authentication authentication) {
        Team team = getTeam(teamId);

        ensureTeamLeader(team, authentication);
        ensureTeamEditable(team);

        TeamMember oldLeader = teamMemberRepository
                .findByTeamIdAndUserIdAndLeftAtIsNull(teamId, team.getLeader().getId())
                .orElseThrow(() -> new ConflictException("Current leader membership was not found."));

        TeamMember newLeader = teamMemberRepository
                .findByTeamIdAndUserIdAndLeftAtIsNull(teamId, request.newLeaderUserId())
                .orElseThrow(() -> new BadRequestException("New leader must be an active member."));

        oldLeader.setRole(MemberRole.MEMBER);
        newLeader.setRole(MemberRole.LEADER);
        team.setUpdatedAt(LocalDateTime.now());
        team.setLeader(newLeader.getUser());

        return toTeamResponse(teamRepository.save(team));
    }

    @Transactional
    @Override
    public void leaveTeam(UUID teamId, ReasonRequest request, Authentication authentication) {
        Team team = getTeam(teamId);

        UUID currentUserId = CurrentUser.id(authentication);

        TeamMember member = teamMemberRepository.findByTeamIdAndUserIdAndLeftAtIsNull(teamId, currentUserId)
                .orElseThrow(() -> new UnauthorizedException("You are not an active member of this team."));

        ensureTeamEditable(team);

        if (member.isLeader()) {
            throw new BadRequestException("Transfer leadership to another member before leaving the team.");
        }

        LocalDateTime now = LocalDateTime.now();
        member.leave(now, LeftReason.SELF_LEFT, blankToNull(request == null ? null : request.reason()));
        team.decrementMemberCount();
        team.setUpdatedAt(now);
    }

    @Transactional
    @Override
    public TeamResponse toggleJoinCode(UUID teamId, ToggleJoinCodeRequest request, Authentication authentication) {
        Team team = getTeam(teamId);
        ensureTeamLeader(team, authentication);
        ensureTeamEditable(team);

        team.setJoinCodeEnabled(request.enabled());
        team.setUpdatedAt(LocalDateTime.now());
        return toTeamResponse(teamRepository.save(team));
    }

    @Transactional
    @Override
    public TeamResponse registerTeamForTrack(UUID teamId, RegisterTeamTrackRequest request, Authentication authentication) {
        if (request == null || request.trackId() == null) {
            throw new BadRequestException("trackId is required.");
        }

        User leader = currentUserService.getCurrentUser(authentication);
        Team team = getTeam(teamId);

        ensureActiveStudent(leader);
        ensureTeamLeader(team, authentication);
        ensureTeamEditable(team);

        if (team.getTrack() != null && team.getRegisteredAt() != null) {
            throw new ConflictException("Track is already registered for this team.");
        }

        Track track = trackRepository.findById(request.trackId())
                .orElseThrow(() -> new NotFoundException("Track not found."));
        HackathonEvent event = track.getEvent();

        if (event == null) {
            throw new ConflictException("Track is not registered for any event.");
        }

        if (!event.isRegistrationWindowOpen(LocalDateTime.now())) {
            throw new ConflictException("Registration window is not open.");
        }

        List<TeamMember> teamMembers = activeMembers(team.getId());
        int memberCount = teamMembers.size();

        if (!track.isMemberCountAllowed(memberCount)) {
            throw new ConflictException("Team member count must be between "
                    + track.getMinMembers() + " and " + track.getMaxMembers() + ".");
        }

        List<String> inactiveMembers = teamMembers.stream()
                .map(TeamMember::getUser)
                .filter(u -> u == null || !u.isActive())
                .map(user -> user == null ? "Unknown member" : user.getEmail())
                .toList();

        if (!inactiveMembers.isEmpty()) {
            throw new ConflictException("The following members are not active: "
                    + String.join(", ", inactiveMembers)
                    + ". All team members must be active before track registration.");
        }

        for (TeamMember member : teamMembers) {
            if (teamMemberRepository
                    .existsActiveRegisteredMembershipInEvent(member.getUser().getId(),
                            team.getId(), event.getId())) {
                throw new ConflictException(member.getUser().getEmail()
                        + " is already active in another registered team for this event.");
            }
        }

        int registeredCount = teamRepository.CountActiveTeamByTrackId(track.getId());

        if (track.getMaxTeams() != null && registeredCount >= track.getMaxTeams()) {
            throw new ConflictException("Maximum number of teams for this track has been reached.");
        }

        team.setTrack(track);
        team.register(LocalDateTime.now());
        team.setUpdatedAt(LocalDateTime.now());

        Team teamSaved = teamRepository.save(team);

        auditLogRepository.save(AuditLog.builder()
                .actor(leader)
                .actionType(AuditActionType.TEAM_REGISTERED)
                .targetTable("teams")
                .targetId(teamSaved.getId())
                .afterState(Map.of(
                        "eventId", event.getId().toString(),
                        "trackId", track.getId().toString(),
                        "status", teamSaved.getStatus().name(),
                        "memberCount", memberCount
                ))
                .build()
        );

        notificationService.createSystemNotification(
                leader,
                event,
                NotificationType.TEAM_REGISTERED,
                "Team registered to track",
                "Team " + team.getName() + " has been registered for track " + track.getName() + ".",
                NotificationTargetScope.TEAM,
                teamSaved.getId(),
                null,
                NotificationChannel.BOTH,
                null
        );

        return toTeamResponse(teamSaved);
    }

    //HELPERS
    private TeamMemberResponse acceptInvitationInternal(TeamInvitation invitation, Authentication authentication) {
        User currentUser = currentUserService.getCurrentUser(authentication);
        ensureActiveStudent(currentUser);

        if (!currentUser.getEmail().equalsIgnoreCase(invitation.getInviteEmail())) {
            throw new UnauthorizedException("This invitation is not for your account.");
        }

        if (!invitation.isPending()) {
            throw new ConflictException("This invitation is no longer pending.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (invitation.isExpired(now)) {
            throw new ConflictException("This invitation has expired.");
        }

        Team team = invitation.getTeam();
        ensureTeamEditable(team);
        ensureTeamHasSpace(team);

        if (teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(team.getId(), currentUser.getId())) {
            throw new ConflictException("You are already an active member of this team.");
        }
        ensureNoSameTrackMembership(team, currentUser);

        invitation.accept(now);
        invitation.setInvitee(currentUser);

        TeamMember member = TeamMember.builder()
                .team(team)
                .user(currentUser)
                .role(MemberRole.MEMBER)
                .joinedAt(now)
                .build();

        team.incrementMemberCount();
        team.setUpdatedAt(now);

        TeamMember savedMember = teamMemberRepository.save(member);
        cancelPendingInvitationsIfTeamFull(team, now);
        createInvitationAcceptedNotification(invitation, currentUser);

        return toTeamMemberResponse(savedMember);
    }

    private void rejectInvitationInternal(TeamInvitation invitation, ReasonRequest request, Authentication authentication) {
        User currentUser = currentUserService.getCurrentUser(authentication);

        if (!currentUser.getEmail().equalsIgnoreCase(invitation.getInviteEmail())) {
            throw new UnauthorizedException("This invitation is not for your account.");
        }

        declineInvitation(invitation, request, currentUser, currentUser);
    }

    private void rejectInvitationByTokenInternal(TeamInvitation invitation, ReasonRequest request) {
        User invitee = invitation.getInvitee();
        if (invitee == null) {
            invitee = userRepository.findByEmailIgnoreCase(invitation.getInviteEmail()).orElse(null);
        }
        declineInvitation(invitation, request, invitee, invitee == null ? invitation.getInvitedBy() : invitee);
    }

    private void declineInvitation(
            TeamInvitation invitation,
            ReasonRequest request,
            User invitee,
            User notificationActor
    ) {
        if (!invitation.isPending()) {
            throw new ConflictException("This invitation is no longer pending.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (invitation.isExpired(now)) {
            throw new ConflictException("This invitation has expired.");
        }

        invitation.decline(now);
        if (invitee != null) {
            invitation.setInvitee(invitee);
        }
        invitation.setResponseReason(blankToNull(request == null ? null : request.reason()));
        createInvitationRejectedNotification(invitation, notificationActor);
    }

    private void ensureActiveStudent(User user) {
        if (!user.isStudent()) {
            throw new BadRequestException("Only students can create a team.");
        }

        if (!user.isActive()) {
            throw new BadRequestException("User is not active");
        }

        if (studentProfileRepository.findByUserId(user.getId()).isEmpty()) {
            throw new BadRequestException("Student profile is required to create a team.");
        }
    }

    private String generateUniqueJoinCode() {
        String code;
        do {
            code = "SEAL-" + randomHex(4).toUpperCase(Locale.ROOT);
        } while (teamRepository.findByJoinCode(code).isPresent());
        return code;
    }

    private String randomHex(int bytes) {
        byte[] data = new byte[bytes];
        RANDOM.nextBytes(data);
        return HexFormat.of().formatHex(data);
    }

    private String generateToken() {
        return randomHex(32);
    }

    private void ensureTeamHasSpace(Team team) {
        int maxMembers = maxMembersFor(team);

        if (team.getMemberCount() != null && team.getMemberCount() >= maxMembers) {
            throw new ConflictException("Team already reached maximum member limit.");
        }
    }

    private int maxMembersFor(Team team) {
        return team.getTrack() != null && team.getTrack().getMaxMembers() != null
                ? team.getTrack().getMaxMembers()
                : DEFAULT_MAX_TEAM_MEMBERS;
    }

    private void cancelPendingInvitationsIfTeamFull(Team team, LocalDateTime now) {
        int maxMembers = maxMembersFor(team);
        if (team.getMemberCount() == null || team.getMemberCount() < maxMembers) {
            return;
        }

        team.setJoinCodeEnabled(false);
        teamInvitationRepository.findByTeamIdAndStatus(team.getId(), InvitationStatus.PENDING)
                .forEach(invitation -> invitation.cancel(now));
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Invite email is required.");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeJoinCode(String joinCode) {
        if (joinCode == null || joinCode.isBlank()) {
            throw new BadRequestException("Join code is required.");
        }
        return joinCode.trim().toUpperCase(Locale.ROOT);
    }

    private void ensureJoinCodeUsable(Team team) {
        if (!team.hasJoinCodeEnabled()) {
            throw new BadRequestException("Team join code is disabled.");
        }
    }

    private void ensureNotAlreadyActiveMember(Team team, User user) {
        if (teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(team.getId(), user.getId())) {
            throw new ConflictException("You are already an active member of this team.");
        }
    }

    private void ensureNoSameTrackMembership(Team team, User user) {
        ensureNoSameTrackMembership(team, user, "You already have an active team in this track.");
    }

    private void ensureNoSameTrackMembership(Team team, User user, String conflictMessage) {
        if (team.getTrack() == null) {
            return;
        }

        if (teamMemberRepository.existsActiveMembershipInSameTrack(user.getId(), team.getId(), team.getTrack().getId())) {
            throw new ConflictException(conflictMessage);
        }
    }

    private void createInvitationSentNotification(TeamInvitation invitation, User actor) {
        if (invitation.getInvitee() == null) {
            return;
        }

        notificationService.createSystemNotification(
                actor,
                invitation.getTeam().getTrack() == null ? null : invitation.getTeam().getTrack().getEvent(),
                NotificationType.TEAM_INVITATION_SENT,
                "You are invited to join " + invitation.getTeam().getName(),
                "You are invited to join team " + invitation.getTeam().getName() + ".",
                NotificationTargetScope.SINGLE_USER,
                invitation.getInvitee().getId(),
                null,
                NotificationChannel.IN_APP,
                null
        );
    }

    private void createTeamMemberJoinedByCodeNotification(Team team, User actor) {
        notificationService.createSystemNotification(
                actor,
                team.getTrack() == null ? null : team.getTrack().getEvent(),
                NotificationType.TEAM_INVITATION_ACCEPTED,
                "New team member joined",
                actor.getFullName() + " joined team " + team.getName() + " using the team code.",
                NotificationTargetScope.TEAM,
                team.getId(),
                null,
                NotificationChannel.BOTH,
                null
        );
    }

    private void createInvitationAcceptedNotification(TeamInvitation invitation, User actor) {
        notificationService.createSystemNotification(
                actor,
                invitation.getTeam().getTrack() == null ? null : invitation.getTeam().getTrack().getEvent(),
                NotificationType.TEAM_INVITATION_ACCEPTED,
                actor.getFullName() + " accepted the invitation to join " + invitation.getTeam().getName(),
                actor.getFullName() + " joined team " + invitation.getTeam().getName() + ".",
                NotificationTargetScope.TEAM,
                invitation.getTeam().getId(),
                null,
                NotificationChannel.BOTH,
                null
        );
    }

    private void createInvitationRejectedNotification(TeamInvitation invitation, User actor) {
        User leader = invitation.getTeam().getLeader();
        if (leader == null) {
            return;
        }
        notificationService.createSystemNotification(
                actor,
                invitation.getTeam().getTrack() == null ? null : invitation.getTeam().getTrack().getEvent(),
                NotificationType.TEAM_INVITATION_REJECTED,
                "Team invitation declined",
                invitation.getInviteEmail() + " declined the invitation to join team " + invitation.getTeam().getName() + ".",
                NotificationTargetScope.SINGLE_USER,
                leader.getId(),
                null,
                NotificationChannel.BOTH,
                null
        );
    }

    private void sendInvitationSentEmail(TeamInvitation invitation, User inviter, User invitee) {
        try {
            emailService.sendTeamInvitationSent(
                    invitation.getInviteEmail(),
                    invitee == null ? invitation.getInviteEmail() : invitee.getFullName(),
                    invitation.getTeam().getName(),
                    inviter.getFullName(),
                    buildInvitationUrl("accept", invitation.getToken()),
                    buildInvitationUrl("reject", invitation.getToken()),
                    invitation.getExpiresAt()
            );
        } catch (RuntimeException ex) {
            log.warn("Failed to send team invitation email. invitationId={}, to={}", invitation.getId(), invitation.getInviteEmail(), ex);
        }
    }

    private void sendTeamMemberJoinedByCodeEmail(Team team, User joinedMember) {
        User leader = team.getLeader();
        if (leader == null || leader.getEmail() == null || leader.getEmail().isBlank()) {
            return;
        }

        List<String> cc = activeMembers(team.getId()).stream()
                .map(TeamMember::getUser)
                .filter(user -> user != null && user.getEmail() != null && !user.getEmail().isBlank())
                .filter(user -> !user.getId().equals(leader.getId()))
                .map(User::getEmail)
                .distinct()
                .toList();

        try {
            emailService.sendTeamInvitationAccepted(
                    leader.getEmail(),
                    cc,
                    team.getName(),
                    joinedMember.getFullName(),
                    buildTeamUrl(team.getId())
            );
        } catch (RuntimeException ex) {
            log.warn("Failed to send team join-code accepted email. teamId={}, joinedUserId={}", team.getId(), joinedMember.getId(), ex);
        }
    }

    private void sendInvitationAcceptedEmail(TeamInvitation invitation, User acceptedMember) {
        Team team = invitation.getTeam();
        User leader = team.getLeader();
        if (leader == null || leader.getEmail() == null || leader.getEmail().isBlank()) {
            return;
        }

        List<String> cc = activeMembers(team.getId()).stream()
                .map(TeamMember::getUser)
                .filter(user -> user != null && user.getEmail() != null && !user.getEmail().isBlank())
                .filter(user -> !user.getId().equals(leader.getId()))
                .map(User::getEmail)
                .distinct()
                .toList();

        try {
            emailService.sendTeamInvitationAccepted(
                    leader.getEmail(),
                    cc,
                    team.getName(),
                    acceptedMember.getFullName(),
                    buildTeamUrl(team.getId())
            );
        } catch (RuntimeException ex) {
            log.warn("Failed to send team invitation accepted email. invitationId={}, teamId={}", invitation.getId(), team.getId(), ex);
        }
    }

    private void sendInvitationRejectedEmail(TeamInvitation invitation) {
        Team team = invitation.getTeam();
        User leader = team.getLeader();
        if (leader == null || leader.getEmail() == null || leader.getEmail().isBlank()) {
            return;
        }

        try {
            emailService.sendTeamInvitationRejected(
                    leader.getEmail(),
                    team.getName(),
                    invitation.getInviteEmail(),
                    buildTeamUrl(team.getId())
            );
        } catch (RuntimeException ex) {
            log.warn("Failed to send team invitation rejected email. invitationId={}, teamId={}", invitation.getId(), team.getId(), ex);
        }
    }

    private String buildInvitationUrl(String action, String token) {
        String base = frontendUrl == null || frontendUrl.isBlank() ? "http://localhost:5173" : frontendUrl;
        return stripTrailingSlash(base) + "/invitations/" + action + "?token=" + token;
    }

    private String buildTeamUrl(UUID teamId) {
        String base = frontendUrl == null || frontendUrl.isBlank() ? "http://localhost:5173" : frontendUrl;
        return stripTrailingSlash(base) + "/participant/teams/" + teamId;
    }

    private String stripTrailingSlash(String value) {
        while (value.endsWith("/")) {
            value = value.substring(0, value.length() - 1);
        }
        return value;
    }

    private TeamResponse toTeamResponse(Team team) {
        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getProjectTitle(),
                team.getLeader().getId(),
                team.getLeader().getFullName(),
                team.getTrack() == null ? null : team.getTrack().getId(),
                team.getStatus().name(),
                team.getMemberCount() == null ? 0 : team.getMemberCount(),
                team.getJoinCode(),
                team.getJoinCodeEnabled()
        );
    }

    private TeamMemberResponse toTeamMemberResponse(TeamMember m) {
        return new TeamMemberResponse(
                m.getId(),
                m.getUser().getId(),
                m.getUser().getFullName(),
                m.getUser().getEmail(),
                m.getRole().name(),
                m.getJoinedAt()
        );
    }

    private TeamJoinCodePreviewResponse toTeamJoinCodePreviewResponse(Team team) {
        return new TeamJoinCodePreviewResponse(
                team.getId(),
                team.getName(),
                team.getProjectTitle(),
                team.getDescription(),
                team.getLeader() == null ? null : team.getLeader().getId(),
                team.getLeader() == null ? null : team.getLeader().getFullName(),
                team.getTrack() == null ? null : team.getTrack().getId(),
                team.getTrack() == null ? null : team.getTrack().getName(),
                team.getTrack() == null || team.getTrack().getEvent() == null ? null : team.getTrack().getEvent().getId(),
                team.getTrack() == null || team.getTrack().getEvent() == null ? null : team.getTrack().getEvent().getName(),
                team.getStatus().name(),
                team.getMemberCount() == null ? 0 : team.getMemberCount(),
                maxMembersFor(team),
                team.hasJoinCodeEnabled()
        );
    }

    private TeamSummaryResponse toTeamSummaryResponse(Team team, UUID currentUserId) {
        String role = teamMemberRepository.findByTeamIdAndUserIdAndLeftAtIsNull(team.getId(), currentUserId)
                .map(m -> m.getRole().name())
                .orElse("MEMBER");
        return new TeamSummaryResponse(
                team.getId(),
                team.getName(),
                team.getProjectTitle(),
                team.getStatus().name(),
                role
        );
    }

    private TeamInvitationResponse toTeamInvitationResponse(TeamInvitation invitation) {
        return new TeamInvitationResponse(
                invitation.getId(),
                invitation.getTeam().getId(),
                invitation.getTeam().getName(),
                invitation.getInviteEmail(),
                effectiveStatus(invitation, LocalDateTime.now()).name(),
                invitation.getExpiresAt(),
                invitation.getToken(),
                buildInvitationUrl("accept", invitation.getToken()),
                buildInvitationUrl("reject", invitation.getToken())
        );
    }

    // Display status shown to clients: a PENDING invitation past its deadline reads as EXPIRED on every endpoint,
    // even though the row is not yet persisted as EXPIRED (B8). Keeps token/list/team views consistent.
    private InvitationStatus effectiveStatus(TeamInvitation invitation, LocalDateTime now) {
        if (invitation.isPending() && invitation.isExpired(now)) {
            return InvitationStatus.EXPIRED;
        }
        return invitation.getStatus();
    }

    private void ensureTeamMemberForCoordinator(Team team, Authentication authentication) {
        if (CurrentUser.isCoordinator(authentication) || CurrentUser.isAdmin(authentication)) {
            return;
        }

        UUID currentUserId = CurrentUser.id(authentication);

        if (!teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(team.getId(), currentUserId)) {
            throw new UnauthorizedException("You don not have permission to access this team.");
        }
    }

    private Team getTeam(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found " + teamId));
    }

    private TeamInvitation getInvitation(UUID invitationId) {
        TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new NotFoundException("Invitation not found."));
        if (invitation.getType() != TeamInvitationType.INVITATION) {
            throw new NotFoundException("Invitation not found.");
        }
        return invitation;
    }

    private List<TeamMember> activeMembers(UUID teamId) {
        return teamMemberRepository.findByTeamIdAndLeftAtIsNullOrderByJoinedAtAsc(teamId);
    }

    private void ensureTeamLeader(Team team, Authentication authentication) {
        UUID userId = CurrentUser.id(authentication);

        if (team.getLeader() == null || !team.getLeader().getId().equals(userId)) {
            throw new UnauthorizedException("You don not have permission to access this team.");
        }
    }

    private void ensureTeamEditable(Team team) {
        if (team.getStatus() != TeamStatus.FORMING) {
            throw new BadRequestException("Team is not in forming status.");
        }
    }

    private void sendTeamRegisterEmailSafely(
            Team team, List<TeamMember> members, HackathonEvent event, Track track
    ) {
        try {
            User leader = team.getLeader();

            List<String> cc = members.stream()
                    .map(TeamMember::getUser)
                    .filter(user -> user != null && user.getEmail() != null)
                    .filter(user -> leader == null || !user.getId().equals(leader.getId()))
                    .map(User::getEmail)
                    .distinct()
                    .toList();
            if (leader != null && leader.getEmail() != null) {
                emailService.sendTeamRegisterEmail(
                        leader.getEmail(),
                        cc,
                        leader.getFullName(),
                        team.getName(),
                        event.getName(),
                        track.getName()
                );
            }
        } catch (RuntimeException ex) {
            //TODO
            ex.printStackTrace();
        }
    }
}

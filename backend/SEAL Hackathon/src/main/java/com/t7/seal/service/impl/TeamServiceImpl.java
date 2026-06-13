package com.t7.seal.service.impl;

import com.t7.seal.domain.InvitationStatus;
import com.t7.seal.domain.LeftReason;
import com.t7.seal.domain.MemberRole;
import com.t7.seal.domain.NotificationChannel;
import com.t7.seal.domain.NotificationStatus;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.entities.Notification;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.TeamInvitation;
import com.t7.seal.entities.TeamMember;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.NotificationRepository;
import com.t7.seal.repository.StudentProfileRepository;
import com.t7.seal.repository.TeamInvitationRepository;
import com.t7.seal.repository.TeamMemberRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.request.team.CreateTeamRequest;
import com.t7.seal.request.team.InviteMemberRequest;
import com.t7.seal.request.team.ReasonRequest;
import com.t7.seal.request.team.TransferLeaderRequest;
import com.t7.seal.request.team.UpdateTeamRequest;
import com.t7.seal.response.team.TeamDetailResponse;
import com.t7.seal.response.team.TeamInvitationResponse;
import com.t7.seal.response.team.TeamMemberResponse;
import com.t7.seal.response.team.TeamResponse;
import com.t7.seal.response.team.TeamSummaryResponse;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.EmailService;
import com.t7.seal.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

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
    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;
    private final EmailService emailService;

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

        if (teamInvitationRepository.existsByTeamIdAndInviteEmailIgnoreCaseAndStatus(teamId, email, InvitationStatus.PENDING)) {
            throw new ConflictException("This email already has a pending invitation for this team.");
        }

        User invitee = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (invitee != null && teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(teamId, invitee.getId())) {
            throw new ConflictException("This user is already an active member of the team.");
        }

        LocalDateTime now = LocalDateTime.now();
        TeamInvitation invitation = TeamInvitation.builder()
                .team(team)
                .invitedBy(inviter)
                .inviteEmail(email)
                .invitee(invitee)
                .token(generateToken())
                .status(InvitationStatus.PENDING)
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

        return teamInvitationRepository.findByTeamIdOrderByCreatedAtDesc(teamId)
                .stream()
                .map(this::toTeamInvitationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamInvitationResponse> getMyInvitations(Authentication authentication) {
        User currentUser = currentUserService.getCurrentUser(authentication);

        return teamInvitationRepository.findByInviteEmailIgnoreCaseOrderByCreatedAtDesc(currentUser.getEmail())
                .stream()
                .map(this::toTeamInvitationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public TeamInvitationResponse getInvitationByToken(String token) {
        TeamInvitation invitation = teamInvitationRepository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Invitation not found."));

        if (invitation.isPending() && invitation.isExpired(LocalDateTime.now())) {
            return toTeamInvitationResponseWithStatus(invitation, InvitationStatus.EXPIRED);
        }

        return toTeamInvitationResponse(invitation);
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

        member.leave(LocalDateTime.now(), LeftReason.KICKED_BY_LEADER);
        team.decrementMemberCount();
        team.setUpdatedAt(LocalDateTime.now());
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

        member.leave(LocalDateTime.now(), LeftReason.SELF_LEFT);
        team.decrementMemberCount();
        team.setUpdatedAt(LocalDateTime.now());
    }

    //HELPERS
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

    private void createInvitationSentNotification(TeamInvitation invitation, User actor) {
        if (invitation.getInvitee() == null) {
            return;
        }

        Notification notification = Notification.builder()
                .event(invitation.getTeam().getTrack() == null ? null : invitation.getTeam().getTrack().getEvent())
                .createdBy(actor)
                .type(NotificationType.TEAM_INVITATION_SENT)
                .title("Team invitation")
                .body("You are invited to join team " + invitation.getTeam().getName() + ".")
                .targetScope(NotificationTargetScope.SINGLE_USER)
                .targetId(invitation.getInvitee().getId())
                .channel(NotificationChannel.BOTH)
                .status(NotificationStatus.SENT)
                .sentAt(LocalDateTime.now())
                .recipientCount(1)
                .build();
        notificationRepository.save(notification);
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

    private String buildInvitationUrl(String action, String token) {
        String base = frontendUrl == null || frontendUrl.isBlank() ? "http://localhost:5173" : frontendUrl;
        return stripTrailingSlash(base) + "/invitations/" + action + "?token=" + token;
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
                team.getMemberCount() == null ? 0 : team.getMemberCount()
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
                invitation.getStatus().name(),
                invitation.getExpiresAt(),
                invitation.getToken(),
                buildInvitationUrl("accept", invitation.getToken()),
                buildInvitationUrl("reject", invitation.getToken())
        );
    }

    private TeamInvitationResponse toTeamInvitationResponseWithStatus(TeamInvitation invitation, InvitationStatus status) {
        return new TeamInvitationResponse(
                invitation.getId(),
                invitation.getTeam().getId(),
                invitation.getTeam().getName(),
                invitation.getInviteEmail(),
                status.name(),
                invitation.getExpiresAt(),
                invitation.getToken(),
                buildInvitationUrl("accept", invitation.getToken()),
                buildInvitationUrl("reject", invitation.getToken())
        );
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
}

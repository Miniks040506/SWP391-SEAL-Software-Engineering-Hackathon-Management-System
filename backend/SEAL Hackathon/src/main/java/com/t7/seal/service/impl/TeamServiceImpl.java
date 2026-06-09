package com.t7.seal.service.impl;

import com.t7.seal.domain.MemberRole;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.TeamMember;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.StudentProfileRepository;
import com.t7.seal.repository.TeamMemberRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.request.team.CreateTeamRequest;
import com.t7.seal.request.team.UpdateTeamRequest;
import com.t7.seal.response.team.TeamDetailResponse;
import com.t7.seal.response.team.TeamMemberResponse;
import com.t7.seal.response.team.TeamResponse;
import com.t7.seal.response.team.TeamSummaryResponse;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.TeamService;
import lombok.RequiredArgsConstructor;
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
public class TeamServiceImpl implements TeamService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CurrentUserService currentUserService;

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

        if (request.name() != null || !request.name().isBlank()) {
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

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
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
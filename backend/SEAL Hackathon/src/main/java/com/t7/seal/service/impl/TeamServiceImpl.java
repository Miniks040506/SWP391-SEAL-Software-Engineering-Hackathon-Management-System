package com.t7.seal.service.impl;

import com.t7.seal.domain.MemberRole;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.TeamMember;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.repository.StudentProfileRepository;
import com.t7.seal.repository.TeamMemberRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.request.team.CreateTeamRequest;
import com.t7.seal.response.team.TeamResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Random;

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
}

package com.t7.seal.service.impl;

import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.Team;
import com.t7.seal.entities.TeamMember;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.MentorAssignmentRepository;
import com.t7.seal.repository.RoundJudgeAssignmentRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.TeamMemberRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.response.system.NotificationRecipientResolutionResponse;
import com.t7.seal.response.system.NotificationRecipientResponse;
import com.t7.seal.service.NotificationRecipientResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationRecipientResolverImpl implements NotificationRecipientResolver {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TrackRepository trackRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final RoundJudgeAssignmentRepository roundJudgeAssignmentRepository;
    private final RoundRepository roundRepository;

    @Transactional(readOnly = true)
    @Override
    public NotificationRecipientResolutionResponse resolve(
            String targetScope,
            UUID targetId,
            UUID eventId,
            String role
    ) {
        NotificationTargetScope scope = parseScope(targetScope);

        return switch (scope) {
            case USER, SINGLE_USER -> resolveSingleUser(scope, targetId, eventId, role);
            case ROLE, JUDGE, STUDENT, COORDINATOR, COORDINATION -> resolveRole(scope, targetId, eventId, role);
            case TEAM -> resolveTeam(targetId, eventId, role);
            case TRACK -> resolveTrack(targetId, eventId, role);
            case EVENT_PARTICIPANTS -> resolveEventParticipants(scope, targetId, requireEventId(eventId), role);
            case EVENT_MENTORS -> resolveEventMentors(scope, targetId, requireEventId(eventId), role);
            case EVENT_JUDGES -> resolveEventJudges(scope, targetId, requireEventId(eventId), role);
            case EVENT_COORDINATORS -> resolveEventCoordinators(scope, targetId, requireEventId(eventId), role);
            case ROUND_JUDGES -> resolveRoundJudges(targetId, eventId, role);
            case ALL_EVENT_USERS -> resolveAllEventUsers(scope, targetId, requireEventId(eventId), role);
            case ALL -> resolveAllActive(scope, targetId, eventId, role);
        };
    }

    private NotificationRecipientResolutionResponse resolveSingleUser(
            NotificationTargetScope scope,
            UUID userId,
            UUID eventId,
            String role
    ) {
        if (userId == null) {
            throw new BadRequestException("targetId is required for user notification target.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found " + userId));
        List<User> users = isDeliverable(user) ? List.of(user) : List.of();
        List<NotificationRecipientResponse> inApp = toResponses(users, "IN_APP");
        List<NotificationRecipientResponse> to = toResponses(users, "TO");
        return build(scope, userId, eventId, role, firstOrNull(to), to, List.of(), inApp);
    }

    private NotificationRecipientResolutionResponse resolveRole(
            NotificationTargetScope scope,
            UUID targetId,
            UUID eventId,
            String role
    ) {
        UserRole resolvedRole = switch (scope) {
            case JUDGE -> UserRole.JUDGE;
            case STUDENT -> UserRole.STUDENT;
            case COORDINATOR, COORDINATION -> UserRole.COORDINATOR;
            default -> parseRole(role);
        };
        List<User> users = userRepository.findByRoleAndStatusOrderByFullNameAsc(resolvedRole, UserStatus.ACTIVE);
        return build(scope, targetId, eventId, resolvedRole.name(), firstOrNull(toResponses(users, "TO")), toResponses(users, "TO"), List.of(), toResponses(users, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse resolveTeam(UUID teamId, UUID eventId, String role) {
        if (teamId == null) {
            throw new BadRequestException("targetId is required for TEAM target scope.");
        }
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found " + teamId));

        User leader = team.getLeader();
        List<TeamMember> members = teamMemberRepository.findByTeamIdAndLeftAtIsNullOrderByJoinedAtAsc(team.getId());
        List<User> activeMembers = members.stream()
                .map(TeamMember::getUser)
                .filter(this::isDeliverable)
                .toList();

        List<User> toUsers = isDeliverable(leader) ? List.of(leader) : List.of();
        List<User> ccUsers = activeMembers.stream()
                .filter(member -> leader == null || !member.getId().equals(leader.getId()))
                .toList();
        List<User> inAppUsers = dedupeUsers(activeMembers);

        UUID resolvedEventId = team.getTrack() == null || team.getTrack().getEvent() == null
                ? eventId
                : team.getTrack().getEvent().getId();

        List<NotificationRecipientResponse> to = toResponses(toUsers, "TO");
        return build(NotificationTargetScope.TEAM, teamId, resolvedEventId, role,
                firstOrNull(to),
                to,
                toResponses(ccUsers, "CC"),
                toResponses(inAppUsers, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse resolveTrack(UUID trackId, UUID eventId, String role) {
        if (trackId == null) {
            throw new BadRequestException("targetId is required for TRACK target scope.");
        }
        var track = trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found " + trackId));

        List<User> users = new ArrayList<>();
        users.addAll(teamMemberRepository.findActiveUsersByTrackId(trackId));
        users.addAll(mentorAssignmentRepository.findActiveMentorsByTrackId(trackId));

        UUID resolvedEventId = track.getEvent() == null ? eventId : track.getEvent().getId();
        List<User> deduped = dedupeUsers(users);
        return build(NotificationTargetScope.TRACK, trackId, resolvedEventId, role,
                firstOrNull(toResponses(deduped, "TO")),
                toResponses(deduped, "TO"),
                List.of(),
                toResponses(deduped, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse resolveEventParticipants(NotificationTargetScope scope, UUID targetId, UUID eventId, String role) {
        ensureEventExists(eventId);
        List<User> users = teamMemberRepository.findActiveUsersByEventId(eventId);
        return build(scope, targetId, eventId, role, firstOrNull(toResponses(users, "TO")), toResponses(users, "TO"), List.of(), toResponses(users, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse resolveEventMentors(NotificationTargetScope scope, UUID targetId, UUID eventId, String role) {
        ensureEventExists(eventId);
        List<User> users = mentorAssignmentRepository.findActiveMentorsByEventId(eventId);
        return build(scope, targetId, eventId, role, firstOrNull(toResponses(users, "TO")), toResponses(users, "TO"), List.of(), toResponses(users, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse resolveEventJudges(NotificationTargetScope scope, UUID targetId, UUID eventId, String role) {
        ensureEventExists(eventId);
        List<User> users = roundJudgeAssignmentRepository.findActiveJudgeUsersByEventId(eventId);
        return build(scope, targetId, eventId, role, firstOrNull(toResponses(users, "TO")), toResponses(users, "TO"), List.of(), toResponses(users, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse resolveEventCoordinators(NotificationTargetScope scope, UUID targetId, UUID eventId, String role) {
        ensureEventExists(eventId);
        List<User> users = userRepository.findByRoleAndStatusOrderByFullNameAsc(UserRole.COORDINATOR, UserStatus.ACTIVE);
        return build(scope, targetId, eventId, role, firstOrNull(toResponses(users, "TO")), toResponses(users, "TO"), List.of(), toResponses(users, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse resolveRoundJudges(UUID roundId, UUID eventId, String role) {
        if (roundId == null) {
            throw new BadRequestException("targetId is required for ROUND_JUDGES target scope.");
        }
        var round = roundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found " + roundId));
        List<User> users = roundJudgeAssignmentRepository.findActiveJudgeUsersByRoundId(roundId);
        UUID resolvedEventId = round.getEvent() == null ? eventId : round.getEvent().getId();
        return build(NotificationTargetScope.ROUND_JUDGES, roundId, resolvedEventId, role,
                firstOrNull(toResponses(users, "TO")), toResponses(users, "TO"), List.of(), toResponses(users, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse resolveAllEventUsers(NotificationTargetScope scope, UUID targetId, UUID eventId, String role) {
        ensureEventExists(eventId);
        List<User> users = new ArrayList<>();
        users.addAll(teamMemberRepository.findActiveUsersByEventId(eventId));
        users.addAll(mentorAssignmentRepository.findActiveMentorsByEventId(eventId));
        users.addAll(roundJudgeAssignmentRepository.findActiveJudgeUsersByEventId(eventId));
        users.addAll(userRepository.findByRoleAndStatusOrderByFullNameAsc(UserRole.COORDINATOR, UserStatus.ACTIVE));
        List<User> deduped = dedupeUsers(users);
        return build(scope, targetId, eventId, role, firstOrNull(toResponses(deduped, "TO")), toResponses(deduped, "TO"), List.of(), toResponses(deduped, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse resolveAllActive(NotificationTargetScope scope, UUID targetId, UUID eventId, String role) {
        List<User> users = userRepository.findByStatusOrderByFullNameAsc(UserStatus.ACTIVE);
        return build(scope, targetId, eventId, role, firstOrNull(toResponses(users, "TO")), toResponses(users, "TO"), List.of(), toResponses(users, "IN_APP"));
    }

    private NotificationRecipientResolutionResponse build(
            NotificationTargetScope scope,
            UUID targetId,
            UUID eventId,
            String role,
            NotificationRecipientResponse primary,
            List<NotificationRecipientResponse> to,
            List<NotificationRecipientResponse> cc,
            List<NotificationRecipientResponse> inApp
    ) {
        int total = dedupeResponses(inApp.isEmpty() ? merge(to, cc) : inApp).size();
        return new NotificationRecipientResolutionResponse(
                scope.name(),
                targetId,
                eventId,
                role,
                total,
                primary,
                to,
                cc,
                inApp
        );
    }

    private List<NotificationRecipientResponse> toResponses(List<User> users, String deliveryRole) {
        return dedupeUsers(users).stream()
                .map(user -> new NotificationRecipientResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole() == null ? null : user.getRole().name(),
                        user.getStatus() == null ? null : user.getStatus().name(),
                        deliveryRole
                ))
                .toList();
    }

    private List<User> dedupeUsers(List<User> users) {
        Map<UUID, User> ordered = new LinkedHashMap<>();
        for (User user : users) {
            if (isDeliverable(user) && user.getId() != null) {
                ordered.putIfAbsent(user.getId(), user);
            }
        }
        return new ArrayList<>(ordered.values());
    }

    private List<NotificationRecipientResponse> dedupeResponses(List<NotificationRecipientResponse> responses) {
        Map<UUID, NotificationRecipientResponse> ordered = new LinkedHashMap<>();
        for (NotificationRecipientResponse response : responses) {
            if (response != null && response.userId() != null) {
                ordered.putIfAbsent(response.userId(), response);
            }
        }
        return new ArrayList<>(ordered.values());
    }

    private List<NotificationRecipientResponse> merge(
            List<NotificationRecipientResponse> first,
            List<NotificationRecipientResponse> second
    ) {
        List<NotificationRecipientResponse> merged = new ArrayList<>(first);
        merged.addAll(second);
        return merged;
    }

    private boolean isDeliverable(User user) {
        return user != null
                && user.getStatus() == UserStatus.ACTIVE
                && user.getEmail() != null
                && !user.getEmail().isBlank();
    }

    private NotificationRecipientResponse firstOrNull(List<NotificationRecipientResponse> values) {
        return values.isEmpty() ? null : values.get(0);
    }

    private UUID requireEventId(UUID eventId) {
        if (eventId == null) {
            throw new BadRequestException("eventId is required for this target scope.");
        }
        return eventId;
    }

    private void ensureEventExists(UUID eventId) {
        if (!hackathonEventRepository.existsById(eventId)) {
            throw new NotFoundException("Event not found " + eventId);
        }
    }

    private NotificationTargetScope parseScope(String rawScope) {
        if (rawScope == null || rawScope.isBlank()) {
            throw new BadRequestException("targetScope is required.");
        }
        try {
            return NotificationTargetScope.valueOf(rawScope.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid target scope: " + rawScope);
        }
    }

    private UserRole parseRole(String role) {
        if (role == null || role.isBlank()) {
            throw new BadRequestException("role is required for ROLE target scope.");
        }
        try {
            return UserRole.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role: " + role);
        }
    }
}

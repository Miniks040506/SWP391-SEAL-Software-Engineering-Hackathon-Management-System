package com.t7.seal.service.impl;

import com.t7.seal.domain.NotificationChannel;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.TeamInvitation;
import com.t7.seal.entities.User;
import com.t7.seal.service.EmailService;
import com.t7.seal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TeamJoinRequestNotifier {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final TeamJoinRequestMapper mapper;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void notifyLeader(TeamInvitation request) {
        User leader = request.getTeam().getLeader();
        User requester = mapper.requesterOf(request);
        if (leader == null || requester == null) {
            return;
        }

        notificationService.createSystemNotification(
                requester,
                eventOf(request),
                NotificationType.TEAM_JOIN_REQUEST_SENT,
                requester.getFullName() + " requested to join " + request.getTeam().getName(),
                requester.getFullName() + " wants to join your team. Review the request before it expires.",
                NotificationTargetScope.SINGLE_USER,
                leader.getId(),
                null,
                NotificationChannel.IN_APP,
                null
        );

        if (leader.getEmail() == null || leader.getEmail().isBlank()) {
            return;
        }
        try {
            emailService.sendTeamJoinRequestReceived(
                    leader.getEmail(),
                    leader.getFullName(),
                    requester.getFullName(),
                    requester.getEmail(),
                    request.getTeam().getName(),
                    request.getMessage(),
                    actionUrl("accept", request.getToken()),
                    actionUrl("reject", request.getToken()),
                    request.getExpiresAt()
            );
        } catch (RuntimeException ex) {
            log.warn("Failed to email team join request to leader. requestId={}, leaderId={}",
                    request.getId(), leader.getId(), ex);
        }
    }

    public void notifyRequester(TeamInvitation request, User actor, boolean accepted) {
        User requester = mapper.requesterOf(request);
        if (requester == null) {
            return;
        }

        notificationService.createSystemNotification(
                actor,
                eventOf(request),
                accepted
                        ? NotificationType.TEAM_JOIN_REQUEST_ACCEPTED
                        : NotificationType.TEAM_JOIN_REQUEST_REJECTED,
                accepted ? "Your team join request was accepted" : "Your team join request was rejected",
                accepted
                        ? "You are now a member of team " + request.getTeam().getName() + "."
                        : "Your request to join team " + request.getTeam().getName() + " was rejected.",
                NotificationTargetScope.SINGLE_USER,
                requester.getId(),
                null,
                NotificationChannel.IN_APP,
                null
        );

        if (requester.getEmail() == null || requester.getEmail().isBlank()) {
            return;
        }
        try {
            if (accepted) {
                emailService.sendTeamJoinRequestAccepted(
                        requester.getEmail(),
                        requester.getFullName(),
                        request.getTeam().getName(),
                        teamUrl(request)
                );
            } else {
                emailService.sendTeamJoinRequestRejected(
                        requester.getEmail(),
                        requester.getFullName(),
                        request.getTeam().getName(),
                        request.getResponseReason(),
                        baseUrl() + "/participant/teams"
                );
            }
        } catch (RuntimeException ex) {
            log.warn("Failed to email team join request decision. requestId={}, requesterId={}",
                    request.getId(), requester.getId(), ex);
        }
    }

    private HackathonEvent eventOf(TeamInvitation request) {
        return request.getTeam().getTrack() == null ? null : request.getTeam().getTrack().getEvent();
    }

    private String actionUrl(String action, String token) {
        return baseUrl() + "/join-requests/" + action + "?token=" + token;
    }

    private String teamUrl(TeamInvitation request) {
        return baseUrl() + "/participant/teams/" + request.getTeam().getId();
    }

    private String baseUrl() {
        String value = frontendUrl == null || frontendUrl.isBlank() ? "http://localhost:5173" : frontendUrl;
        while (value.endsWith("/")) {
            value = value.substring(0, value.length() - 1);
        }
        return value;
    }
}

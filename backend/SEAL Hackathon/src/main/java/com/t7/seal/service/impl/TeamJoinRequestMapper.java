package com.t7.seal.service.impl;

import com.t7.seal.domain.InvitationStatus;
import com.t7.seal.entities.TeamInvitation;
import com.t7.seal.entities.User;
import com.t7.seal.response.team.TeamJoinRequestResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TeamJoinRequestMapper {

    public TeamJoinRequestResponse toResponse(TeamInvitation request) {
        User requester = requesterOf(request);
        InvitationStatus effectiveStatus = effectiveStatus(request, LocalDateTime.now());
        String status = effectiveStatus == InvitationStatus.DECLINED
                ? "REJECTED"
                : effectiveStatus.name();

        return new TeamJoinRequestResponse(
                request.getId(),
                request.getTeam().getId(),
                request.getTeam().getName(),
                requester == null ? null : requester.getId(),
                requester == null ? null : requester.getFullName(),
                requester == null ? null : requester.getEmail(),
                status,
                request.getMessage(),
                request.getResponseReason(),
                request.getCreatedAt(),
                request.getExpiresAt(),
                request.getRespondAt()
        );
    }

    public User requesterOf(TeamInvitation request) {
        return request.getInvitee() != null ? request.getInvitee() : request.getInvitedBy();
    }

    private InvitationStatus effectiveStatus(TeamInvitation request, LocalDateTime now) {
        if (request.isPending() && request.isExpired(now)) {
            return InvitationStatus.EXPIRED;
        }
        return request.getStatus();
    }
}

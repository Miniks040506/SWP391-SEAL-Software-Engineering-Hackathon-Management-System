package com.t7.seal.response.team;

import java.util.UUID;

public record FormingTeamResponse(
        UUID id,
        String name,
        String projectTitle,
        String description,
        UUID leaderId,
        String leaderName,
        UUID trackId,
        String trackName,
        UUID eventId,
        String eventName,
        String status,
        int memberCount,
        int maxMembers,
        boolean joinCodeEnabled,
        boolean canRequestJoin,
        boolean alreadyMember,
        boolean pendingJoinRequest
) {}

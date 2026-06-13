package com.t7.seal.response.team;

import java.util.UUID;

public record TeamJoinCodePreviewResponse(
        UUID teamId,
        String teamName,
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
        boolean joinCodeEnabled
) {
}

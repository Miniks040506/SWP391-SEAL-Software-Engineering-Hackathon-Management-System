package com.t7.seal.response.team;

import java.util.UUID;

public record TeamResponse(
        UUID id,
        String name,
        String projectTitle,
        UUID leaderId,
        String leaderName,
        UUID trackId,
        String status,
        String registrationStatus,
        int memberCount,
        String joinCode,
        Boolean joinCodeEnabled
) {}

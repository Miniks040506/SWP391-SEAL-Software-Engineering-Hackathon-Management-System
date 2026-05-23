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
        int memberCount
) {}

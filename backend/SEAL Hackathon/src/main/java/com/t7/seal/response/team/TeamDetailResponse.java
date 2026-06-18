package com.t7.seal.response.team;

import java.util.List;
import java.util.UUID;

public record TeamDetailResponse(
        UUID id, String name,
        String projectTitle,
        String description,
        UUID leaderId,
        String leaderName,
        UUID trackId,
        String status,
        String joinCode,
        Boolean joinCodeEnabled,
        List<TeamMemberResponse> members
) {}

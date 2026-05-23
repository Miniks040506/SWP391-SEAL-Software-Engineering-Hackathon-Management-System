package com.t7.seal.response.team;

import java.util.UUID;

public record TeamSummaryResponse(
        UUID id, String name,
        String projectTitle,
        String status,
        String roleInTeam
) {}

package com.t7.seal.request.team;

import jakarta.validation.constraints.Size;

public record CreateTeamJoinRequest(
        @Size(max = 1000) String message
) {}

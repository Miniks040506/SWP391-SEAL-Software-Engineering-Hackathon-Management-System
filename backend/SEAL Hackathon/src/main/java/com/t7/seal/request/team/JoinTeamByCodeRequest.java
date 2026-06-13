package com.t7.seal.request.team;

import jakarta.validation.constraints.NotBlank;

public record JoinTeamByCodeRequest(
        @NotBlank String joinCode
) {
}

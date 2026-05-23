package com.t7.seal.request.team;

import jakarta.validation.constraints.NotNull;

public record ToggleJoinCodeRequest(
        @NotNull Boolean enabled
) {}

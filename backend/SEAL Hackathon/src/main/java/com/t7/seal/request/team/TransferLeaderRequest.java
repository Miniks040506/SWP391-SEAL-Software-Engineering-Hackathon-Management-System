package com.t7.seal.request.team;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TransferLeaderRequest(
        @NotNull UUID newLeaderUserId
) {}

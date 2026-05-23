package com.t7.seal.request.track;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RegisterTeamTrackRequest(@NotNull UUID trackId) {}

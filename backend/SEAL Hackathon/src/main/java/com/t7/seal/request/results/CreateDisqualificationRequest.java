package com.t7.seal.request.results;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateDisqualificationRequest(
        @NotNull UUID submissionId, @NotBlank String reason, String evidenceUrl
) {}
package com.t7.seal.request.results;

import jakarta.validation.constraints.NotBlank;

public record UpdateAppealRequest(@NotBlank String appealNote) {}

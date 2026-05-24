package com.t7.seal.request.system;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateExportJobRequest(@NotBlank String exportType, @NotNull Object params) {}

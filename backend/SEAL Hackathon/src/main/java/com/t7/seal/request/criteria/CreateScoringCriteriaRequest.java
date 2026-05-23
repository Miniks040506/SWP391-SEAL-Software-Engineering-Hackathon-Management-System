package com.t7.seal.request.criteria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateScoringCriteriaRequest(
        @NotBlank @Size(max = 200) String name,
        String description,
        String rubric,
        @NotNull Double maxScore,
        @NotNull Double defaultWeight,
        @NotBlank String category,
        @NotNull Boolean isTechnical,
        Boolean isDefault
) {}

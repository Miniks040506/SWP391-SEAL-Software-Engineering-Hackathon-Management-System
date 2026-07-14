package com.t7.seal.request.grading;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Schema(name = "SaveScoreSheetRequest", description = "Request payload for save score sheet.")
public record SaveScoreSheetRequest(
        @Schema(
                description = "Collection of scores.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotEmpty List<ScoreItemRequest> scores,
        @Schema(
                description = "Client-supplied value for general comment.",
                example = "general comment example"
        )
        String generalComment,
        @Schema(
                description = "Client-supplied value for draft.",
                example = "true"
        )
        Boolean draft
) {}
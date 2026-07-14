package com.t7.seal.request.grading;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ConfirmScoreSheetRequest", description = "Request payload for confirm score sheet.")
public record ConfirmScoreSheetRequest(
        @Schema(
                description = "Client-supplied value for confirmation note.",
                example = "confirmation note example"
        )
        String confirmationNote
) {}
package com.t7.seal.request.submission;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Schema(
        name = "ImportGoogleDriveFileRequest",
        description = "Imports a Google Picker selection into immutable submission object storage."
)
public record ImportGoogleDriveFileRequest(
        @Schema(description = "Stable Google Drive file identifier returned by Picker.", example = "1AbCdEfGhIjKlMnOpQrStUvWxYz")
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9_-]{10,200}$", message = "Google Drive file ID is invalid.")
        String fileId,
        @Schema(
                description = "Submission evidence type.",
                example = "REPORT",
                allowableValues = {"REPOSITORY", "DEMO", "SLIDE", "REPORT", "VIDEO", "OTHER"}
        )
        @NotBlank String linkType,
        @Schema(description = "Optional display label.", example = "Technical report")
        @Size(max = 200) String label,
        @Schema(description = "Whether this is the primary evidence for its type.", example = "true")
        Boolean isPrimary,
        @Schema(description = "Zero-based evidence display order.", example = "0")
        @PositiveOrZero Integer displayOrder
) {
}

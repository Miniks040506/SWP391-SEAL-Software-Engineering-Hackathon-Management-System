package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(name = "SubmissionUploadPolicyResponse", description = "Server-authoritative file upload limits.")
public record SubmissionUploadPolicyResponse(
        @Schema(description = "Accepted MIME types.", accessMode = Schema.AccessMode.READ_ONLY)
        List<String> acceptedMimeTypes,
        @Schema(description = "Accepted lowercase file extensions including the leading dot.", accessMode = Schema.AccessMode.READ_ONLY)
        List<String> acceptedExtensions,
        @Schema(description = "Maximum size of one file in bytes.", example = "26214400", accessMode = Schema.AccessMode.READ_ONLY)
        long maximumFileSizeBytes,
        @Schema(description = "Maximum number of uploaded or imported files in the current submission.", example = "10", accessMode = Schema.AccessMode.READ_ONLY)
        int maximumFiles
) {
}

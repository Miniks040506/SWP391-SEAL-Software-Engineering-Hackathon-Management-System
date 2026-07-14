package com.t7.seal.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "UploadFileResponse", description = "Response payload for upload file.")
public record UploadFileResponse(
        @Schema(
                description = "Absolute resource URL.",
                example = "https://example.test/resource",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String url
) {
}
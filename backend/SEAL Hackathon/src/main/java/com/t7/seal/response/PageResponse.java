package com.t7.seal.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(name = "PageResponse", description = "Response payload for page.")
public record PageResponse<T>(
        @Schema(
                description = "Business content or page content collection, depending on the DTO.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<T> content,
        @Schema(
                description = "Zero-based page index.",
                example = "0",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int page,
        @Schema(
                description = "Requested number of items per page.",
                example = "20",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int size,
        @Schema(
                description = "Total number of matching records.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long totalElements,
        @Schema(
                description = "Total number of pages.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int totalPages,
        @Schema(
                description = "Whether this is the last page.",
                example = "false",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean last
) {
}

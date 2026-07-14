package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "UnreadCountResponse", description = "Response payload for unread count.")
public record UnreadCountResponse(
        @Schema(
                description = "Number of unread notifications.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long unreadCount
) {
}
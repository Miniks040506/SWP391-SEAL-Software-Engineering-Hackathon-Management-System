package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "PublishResultsRequest", description = "Request payload for publish results.")
public record PublishResultsRequest(
        @Schema(
                description = "Human-readable title.",
                example = "Submission deadline reminder"
        )
        String title,
        @Schema(
                description = "Business content or page content collection, depending on the DTO.",
                example = "content example"
        )
        String content,
        @Schema(
                description = "Client-supplied value for send notification.",
                example = "true"
        )
        Boolean sendNotification,
        @Schema(
                description = "Client-supplied value for create announcement.",
                example = "true"
        )
        Boolean createAnnouncement,
        @Schema(
                description = "Client-supplied value for announcement title.",
                example = "announcement title example"
        )
        String announcementTitle,
        @Schema(
                description = "Client-supplied value for announcement body.",
                example = "announcement body example"
        )
        String announcementBody,
        @Schema(
                description = "Client-supplied value for send email.",
                example = "true"
        )
        Boolean sendEmail,
        @Schema(
                description = "Client-supplied value for send in app.",
                example = "true"
        )
        Boolean sendInApp
) {}

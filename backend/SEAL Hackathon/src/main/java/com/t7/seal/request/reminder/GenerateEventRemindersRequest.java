package com.t7.seal.request.reminder;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "GenerateEventRemindersRequest", description = "Request payload for generate event reminders.")
public record GenerateEventRemindersRequest(
        @Schema(
                description = "Client-supplied value for submission days before.",
                example = "10"
        )
        Integer submissionDaysBefore,
        @Schema(
                description = "Client-supplied value for judging days before.",
                example = "10"
        )
        Integer judgingDaysBefore,
        @Schema(
                description = "Client-supplied value for include submission reminders.",
                example = "true"
        )
        Boolean includeSubmissionReminders,
        @Schema(
                description = "Client-supplied value for include judging reminders.",
                example = "true"
        )
        Boolean includeJudgingReminders,
        @Schema(
                description = "Client-supplied value for email enabled.",
                example = "true"
        )
        Boolean emailEnabled
) {}

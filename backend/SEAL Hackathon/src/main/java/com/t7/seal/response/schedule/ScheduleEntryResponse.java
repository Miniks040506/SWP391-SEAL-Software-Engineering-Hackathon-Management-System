package com.t7.seal.response.schedule;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "ScheduleEntryResponse", description = "A role-visible event, round, deadline, or operation on the schedule.")
public record ScheduleEntryResponse(
        String id,
        String type,
        String title,
        String description,
        LocalDateTime startAt,
        LocalDateTime endAt,
        UUID eventId,
        String eventName,
        UUID sourceId,
        UUID roundId,
        String status
) {
}

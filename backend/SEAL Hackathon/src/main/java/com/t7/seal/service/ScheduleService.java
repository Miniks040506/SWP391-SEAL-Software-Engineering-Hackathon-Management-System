package com.t7.seal.service;

import com.t7.seal.response.schedule.ScheduleEntryResponse;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ScheduleService {

    List<ScheduleEntryResponse> getSchedule(
            LocalDateTime from,
            LocalDateTime to,
            UUID eventId,
            String requestedType,
            Authentication authentication
    );
}

package com.t7.seal.request.event;

import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UpdateEventRequest(
        @Size(max = 200) String name,
        @Size(max = 2000) String description,
        String season,
        Integer year,
        LocalDateTime registrationStartAt,
        LocalDateTime registrationEndAt,
        String bannerUrl,
        String status
) {}

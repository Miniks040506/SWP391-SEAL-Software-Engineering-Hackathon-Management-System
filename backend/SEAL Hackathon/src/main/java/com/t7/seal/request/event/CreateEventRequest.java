package com.t7.seal.request.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateEventRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 2000) String description,
        @NotBlank String season,
        @NotNull Integer year,
        LocalDateTime registrationStartAt,
        LocalDateTime registrationEndAt,
        String bannerUrl,
        String status
) {}

package com.t7.seal.request.event;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateEventRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 2000) String description,
        @NotBlank String season,
        @NotNull Integer year,
        LocalDateTime registrationStartAt,
        LocalDateTime registrationEndAt,
        LocalDateTime competitionStartAt,
        LocalDateTime competitionEndAt,
        @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 6, fraction = 2)
        BigDecimal varianceThresholdPoints,
        String bannerUrl,
        String status
) {}

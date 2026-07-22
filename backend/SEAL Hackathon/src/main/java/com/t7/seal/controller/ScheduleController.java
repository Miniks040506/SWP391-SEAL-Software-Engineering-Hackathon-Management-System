package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.schedule.ScheduleEntryResponse;
import com.t7.seal.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1)
@RequiredArgsConstructor
@Tag(name = "Schedule", description = "Role-aware operational schedule.")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/schedule")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'JUDGE', 'MENTOR')")
    @Operation(summary = "Get my schedule", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<ScheduleEntryResponse>> getSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) String type,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(scheduleService.getSchedule(from, to, eventId, type, authentication));
    }
}

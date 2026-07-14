package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.reminder.CreateReminderRequest;
import com.t7.seal.request.reminder.GenerateEventRemindersRequest;
import com.t7.seal.response.reminder.ReminderResponse;
import com.t7.seal.service.ReminderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Reminders",
        description = "Manual and generated event deadline reminders."
)
public class ReminderController {

    private final ReminderService reminderService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/events/{eventId}/reminders")
    public ResponseEntity<List<ReminderResponse>> listEventReminders(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(reminderService.listEventReminders(eventId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/events/{eventId}/reminders")
    public ResponseEntity<ReminderResponse> createReminder(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateReminderRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reminderService.createReminder(eventId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/events/{eventId}/reminders/generate-deadlines")
    public ResponseEntity<List<ReminderResponse>> generateDeadlineReminders(
            @PathVariable UUID eventId,
            @RequestBody(required = false) GenerateEventRemindersRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reminderService.generateEventDeadlineReminders(eventId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/reminders/{reminderId}/send")
    public ResponseEntity<ReminderResponse> sendReminderNow(
            @PathVariable UUID reminderId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(reminderService.sendReminderNow(reminderId, authentication));
    }
}

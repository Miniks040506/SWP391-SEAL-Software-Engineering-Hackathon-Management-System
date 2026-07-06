package com.t7.seal.service.impl;

import com.t7.seal.request.reminder.CreateReminderRequest;
import com.t7.seal.request.reminder.GenerateEventRemindersRequest;
import com.t7.seal.response.reminder.ReminderResponse;
import com.t7.seal.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReminderServiceImpl implements ReminderService {
    @Override
    public List<ReminderResponse> listEventReminders(UUID eventId, Authentication authentication) {
        return List.of();
    }

    @Override
    public ReminderResponse createReminder(UUID eventId, CreateReminderRequest createReminderRequest, Authentication authentication) {
        return null;
    }

    @Override
    public List<ReminderResponse> generateEventDeadlineReminders(UUID eventId, GenerateEventRemindersRequest request, Authentication authentication) {
        return List.of();
    }

    @Override
    public ReminderResponse sendReminderNow(UUID reminderId, Authentication authentication) {
        return null;
    }
}

package com.t7.seal.service;

import com.t7.seal.request.reminder.CreateReminderRequest;
import com.t7.seal.request.reminder.GenerateEventRemindersRequest;
import com.t7.seal.response.reminder.ReminderResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface ReminderService {

    List<ReminderResponse> listEventReminders(UUID eventId, Authentication authentication);

    ReminderResponse createReminder(UUID eventId,
                                    CreateReminderRequest createReminderRequest,
                                    Authentication authentication);

    List<ReminderResponse> generateEventDeadlineReminders(UUID eventId,
                                                          GenerateEventRemindersRequest request,
                                                          Authentication authentication);

    ReminderResponse sendReminderNow(UUID reminderId, Authentication authentication);
}

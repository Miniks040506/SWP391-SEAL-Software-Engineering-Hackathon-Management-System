package com.t7.seal.service;

import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.User;

import java.util.UUID;

public interface RoundDeadlineReminderService {
    int synchronizeSubmissionDeadlineReminders(Round round, User actor);

    int cancelSubmissionDeadlineReminders(Round round);

    int synchronizeEventSubmissionDeadlineReminders(HackathonEvent event, User actor);

    int cancelEventSubmissionDeadlineReminders(UUID eventId);

    int reconcileSubmissionDeadlineReminders();
}

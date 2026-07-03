package com.t7.seal.service;

import com.t7.seal.entities.Round;
import com.t7.seal.entities.User;

public interface RoundDeadlineReminderService {
    int synchronizeSubmissionDeadlineReminders(Round round, User actor);

    int cancelSubmissionDeadlineReminders(Round round);
}

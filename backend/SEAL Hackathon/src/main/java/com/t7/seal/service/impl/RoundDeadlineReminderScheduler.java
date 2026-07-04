package com.t7.seal.service.impl;

import com.t7.seal.service.RoundDeadlineReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoundDeadlineReminderScheduler {

    private final RoundDeadlineReminderService roundDeadlineReminderService;

    @Scheduled(
            initialDelayString = "${app.round.deadline-reminder-initial-delay-ms:60000}",
            fixedDelayString = "${app.round.deadline-reminder-reconciliation-delay-ms:300000}"
    )
    public void reconcileSubmissionDeadlineReminders() {
        int affectedCount = roundDeadlineReminderService.reconcileSubmissionDeadlineReminders();

        if (affectedCount > 0) {
            log.info("Reconciled {} round deadline reminder schedule(s).", affectedCount);
        }
    }
}

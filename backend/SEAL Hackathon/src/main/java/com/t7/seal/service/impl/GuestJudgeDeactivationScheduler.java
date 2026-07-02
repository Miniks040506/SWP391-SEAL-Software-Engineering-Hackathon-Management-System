package com.t7.seal.service.impl;

import com.t7.seal.service.GuestJudgeDeactivationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class GuestJudgeDeactivationScheduler {

    private final GuestJudgeDeactivationService guestJudgeDeactivationService;

    @Scheduled(
            initialDelayString = "${app.guest-judge.deactivation-initial-delay-ms:60000}",
            fixedDelayString = "${app.guest-judge.deactivation-delay-ms:3600000}"
    )
    public void deactivateGuestJudgesAfterCompletedEvents() {
        int deactivatedCount = guestJudgeDeactivationService.deactivateGuestJudgesAfterCompletedEvents();

        if (deactivatedCount > 0) {
            log.info("Deactivated {} guest judge account(s) after event completion.", deactivatedCount);
        }
    }
}

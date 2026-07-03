package com.t7.seal.service.impl;

import com.t7.seal.service.RoundDeadlineTransitionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoundDeadlineTransitionScheduler {

    private final RoundDeadlineTransitionService roundDeadlineTransitionService;

    @Scheduled(
            initialDelayString = "${app.round.deadline-transition-initial-delay-ms:60000}",
            fixedDelayString = "${app.round.deadline-transition-delay-ms:60000}"
    )
    public void transitionExpiredOpenRoundsToPendingLock() {
        int transitionedCount = roundDeadlineTransitionService.transitionExpiredOpenRoundsToPendingLock();

        if (transitionedCount > 0) {
            log.info("Transitioned {} expired open round(s) to PENDING_LOCK.", transitionedCount);
        }
    }
}

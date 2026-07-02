package com.t7.seal.service.impl;

import com.t7.seal.service.UnverifiedAccountAnonymizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UnverifiedAccountAnonymizationScheduler {

    private final UnverifiedAccountAnonymizationService anonymizationService;

    @Scheduled(
            initialDelayString = "${app.unverified-account.anonymization-initial-delay-ms:60000}",
            fixedDelayString = "${app.unverified-account.anonymization-delay-ms:3600000}"
    )
    public void anonymizeExpiredUnverifiedAccounts() {
        int anonymizedCount = anonymizationService.anonymizeExpiredUnverifiedAccounts();

        if (anonymizedCount > 0) {
            log.info("Anonymized {} expired unverified account(s).", anonymizedCount);
        }
    }
}

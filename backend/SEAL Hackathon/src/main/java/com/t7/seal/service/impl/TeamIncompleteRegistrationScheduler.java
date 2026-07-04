package com.t7.seal.service.impl;

import com.t7.seal.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TeamIncompleteRegistrationScheduler {

    private final TeamService teamService;

    @Scheduled(
            initialDelayString = "${app.team.incomplete-scan-initial-delay-ms:60000}",
            fixedDelayString = "${app.team.incomplete-scan-delay-ms:3600000}"
    )
    public void markIncompleteTeamsAfterRegistrationClose() {
        int markedCount = teamService.markIncompleteTeamsAfterRegistrationClose();

        if (markedCount > 0) {
            log.info("Marked {} incomplete team(s) after registration close.", markedCount);
        }
    }
}

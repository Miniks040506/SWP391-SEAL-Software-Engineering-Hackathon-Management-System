package com.t7.seal.request.results;

import java.util.UUID;

public record AssignPrizesFromRankingRequest(
        UUID roundId,
        UUID trackId,
        Boolean overwriteExistingAwards,
        Boolean sendNotification,
        Boolean sendInApp,
        Boolean sendEmail
) {
}

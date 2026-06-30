package com.t7.seal.request.system;

import java.util.UUID;

public record EventExportRequest(
        UUID roundId,
        UUID trackId,
        String format,
        Boolean includeDraftScores,
        Boolean includeDisqualified,
        Boolean anonymize
) {
}

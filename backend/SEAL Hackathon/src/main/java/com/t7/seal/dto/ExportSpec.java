package com.t7.seal.dto;

import com.t7.seal.domain.ExportType;
import com.t7.seal.entities.HackathonEvent;

import java.util.UUID;

public record ExportSpec(
        HackathonEvent event,
        ExportType type,
        UUID roundId,
        UUID trackId,
        String format,
        Boolean includeDraftScores,
        Boolean includeDisqualified,
        Boolean anonymize
) {
}

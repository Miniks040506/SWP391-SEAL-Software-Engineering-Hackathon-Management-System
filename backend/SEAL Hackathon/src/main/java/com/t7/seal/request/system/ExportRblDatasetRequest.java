package com.t7.seal.request.system;

import java.util.UUID;

public record ExportRblDatasetRequest(
        UUID roundId,
        UUID trackId,
        String format
) {
}

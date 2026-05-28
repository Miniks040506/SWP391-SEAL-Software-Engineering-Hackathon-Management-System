package com.t7.seal.request.track;

import java.util.List;

public record UpdateTrackRequest(
        String name,
        String description,
        Integer maxTeams,
        List<String> requiredLinkTypes
) {
}

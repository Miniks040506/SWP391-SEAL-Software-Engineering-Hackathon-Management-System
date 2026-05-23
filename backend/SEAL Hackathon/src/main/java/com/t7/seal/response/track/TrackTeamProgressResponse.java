package com.t7.seal.response.track;

import java.util.UUID;

public record TrackTeamProgressResponse(
        UUID teamId, String teamName,
        String leaderName, int memberCount,
        String latestSubmissionStatus
) {}

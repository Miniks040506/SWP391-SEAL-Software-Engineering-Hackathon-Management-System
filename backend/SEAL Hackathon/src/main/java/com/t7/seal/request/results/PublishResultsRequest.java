package com.t7.seal.request.results;

public record PublishResultsRequest(
        String title, String content,
        Boolean sendNotification,
        Boolean createAnnouncement
) {}

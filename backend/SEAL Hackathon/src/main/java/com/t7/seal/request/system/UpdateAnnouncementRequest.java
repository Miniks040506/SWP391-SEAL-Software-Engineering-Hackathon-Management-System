package com.t7.seal.request.system;

public record UpdateAnnouncementRequest(
        String title, String content,
        Boolean pinned, Boolean resultAnnouncement
) {}

package com.t7.seal.request.system;

import jakarta.validation.constraints.NotBlank;

public record CreateAnnouncementRequest(
        @NotBlank String title, @NotBlank String content,
        Boolean pinned, Boolean resultAnnouncement, Boolean publishNow
) {}

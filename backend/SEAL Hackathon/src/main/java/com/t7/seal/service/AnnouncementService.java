package com.t7.seal.service;

import com.t7.seal.response.system.AnnouncementResponse;

import java.util.List;
import java.util.UUID;

public interface AnnouncementService {
    List<AnnouncementResponse> getEventAnnouncements(UUID eventId);

    AnnouncementResponse getAnnouncementById(UUID announcementId);
}

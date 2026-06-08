package com.t7.seal.service;

import com.t7.seal.request.system.CreateAnnouncementRequest;
import com.t7.seal.request.system.UpdateAnnouncementRequest;
import com.t7.seal.response.system.AnnouncementResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface AnnouncementService {
    List<AnnouncementResponse> getEventAnnouncements(UUID eventId);

    List<AnnouncementResponse> getManageEventAnnouncements(UUID eventId, Authentication authentication);

    AnnouncementResponse createAnnouncement(UUID eventId, CreateAnnouncementRequest request, Authentication authentication);

    AnnouncementResponse getAnnouncementById(UUID announcementId);

    AnnouncementResponse getAnnouncementByIdForManage(UUID announcementId, Authentication authentication);

    AnnouncementResponse updateAnnouncement(UUID announcementId, UpdateAnnouncementRequest request, Authentication authentication);

    void deleteAnnouncement(UUID announcementId, Authentication authentication);

    AnnouncementResponse publishAnnouncement(UUID announcementId, Authentication authentication);

    AnnouncementResponse scheduleAnnouncement(UUID announcementId, UpdateAnnouncementRequest request, Authentication authentication);

    AnnouncementResponse unpublishAnnouncement(UUID announcementId, Authentication authentication);

    AnnouncementResponse pinAnnouncement(UUID announcementId, Authentication authentication);

    AnnouncementResponse unpinAnnouncement(UUID announcementId, Authentication authentication);

    AnnouncementResponse markResultAnnouncement(UUID announcementId, Authentication authentication);
}

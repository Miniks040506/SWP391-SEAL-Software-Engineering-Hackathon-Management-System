package com.t7.seal.service.impl;

import com.t7.seal.entities.EventAnnouncement;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.EventAnnouncementRepository;
import com.t7.seal.response.system.AnnouncementResponse;
import com.t7.seal.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final EventAnnouncementRepository eventAnnouncementRepository;

    @Transactional(readOnly = true)
    @Override
    public List<AnnouncementResponse> getEventAnnouncements(UUID eventId) {
        return eventAnnouncementRepository.findPublishedByEventId(eventId)
                .stream()
                .map(this::toAnnouncementResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public AnnouncementResponse getAnnouncementById(UUID announcementId) {
        EventAnnouncement ea = eventAnnouncementRepository.findPublicById(announcementId)
                .orElseThrow(() -> new NotFoundException("Announcement not found " + announcementId));

        return toAnnouncementResponse(ea);
    }

    //HELPERS
    private AnnouncementResponse toAnnouncementResponse(EventAnnouncement announcement) {
        return new AnnouncementResponse(
                announcement.getId(),
                announcement.getEvent().getId(),
                announcement.getTitle(),
                announcement.getContent(),
                announcement.getIsPinned(),
                announcement.getIsResultAnnouncement(),
                announcement.getPublishedAt(),
                announcement.getCreatedBy().getId(),
                announcement.getStatus().name(),
                announcement.getSendEmail(),
                announcement.getSendInApp(),
                announcement.getScheduledAt(),
                announcement.getTargetScope().name(),
                announcement.getTargetId(),
                announcement.getTargetTrackIds() == null ? List.of() : announcement.getTargetTrackIds(),
                announcement.getTargetRoleNames() == null ? List.of() : announcement.getTargetRoleNames()
        );
    }
}

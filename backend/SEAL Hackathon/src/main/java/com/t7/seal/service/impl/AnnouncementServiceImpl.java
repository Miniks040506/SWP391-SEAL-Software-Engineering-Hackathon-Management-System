package com.t7.seal.service.impl;

import com.t7.seal.domain.NotificationChannel;
import com.t7.seal.domain.NotificationStatus;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import com.t7.seal.entities.EventAnnouncement;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Notification;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.EventAnnouncementRepository;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.NotificationRepository;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.request.system.CreateAnnouncementRequest;
import com.t7.seal.request.system.UpdateAnnouncementRequest;
import com.t7.seal.response.system.AnnouncementResponse;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.AnnouncementService;
import com.t7.seal.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final NotificationRepository notificationRepository;
    private final EventAnnouncementRepository eventAnnouncementRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

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
    public List<AnnouncementResponse> getManageEventAnnouncements(
            UUID eventId,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        ensureEventExists(eventId);
        return eventAnnouncementRepository.findByEventIdOrderByCreatedAtDesc(eventId)
                .stream()
                .map(this::toAnnouncementResponse)
                .toList();
    }

    @Override
    @Transactional
    public AnnouncementResponse createAnnouncement(
            UUID eventId,
            CreateAnnouncementRequest request,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        HackathonEvent event = getEvent(eventId);
        User actor = currentUserService.getCurrentUser(authentication);

        EventAnnouncement eventAnnouncement = EventAnnouncement.builder()
                .event(event)
                .title(request.title().trim())
                .content(request.content().trim())
                .isPinned(Boolean.TRUE.equals(request.pinned()))
                .isResultAnnouncement(
                        Boolean.TRUE.equals(request.resultAnnouncement()))
                .sendEmail(Boolean.TRUE.equals(request.sendEmail()))
                .sendInApp(request.sendInApp() == null
                        || Boolean.TRUE.equals(request.sendInApp()))
                .targetScope(request.targetScope() == null
                        ? NotificationTargetScope.ALL : request.targetScope())
                .targetId(request.targetId())
                .targetTrackIds(request.targetTrackIds() == null
                        ? new ArrayList<>() : new ArrayList<>(request.targetTrackIds()))
                .targetRoleNames(request.targetRoleNames() == null
                        ? new ArrayList<>() : new ArrayList<>(request.targetRoleNames()))
                .createdBy(actor)
                .build();

        if (request.scheduledAt() != null) {
            eventAnnouncement.schedule(request.scheduledAt());
        } else if (Boolean.TRUE.equals(request.publishNow())) {
            eventAnnouncement.publish(LocalDateTime.now());
        }

        EventAnnouncement saved = eventAnnouncementRepository.save(eventAnnouncement);
        if (saved.isPublished()) {
            createNotificationForAnnouncement(saved, actor);
        }

        return toAnnouncementResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public AnnouncementResponse getAnnouncementById(UUID announcementId) {
        EventAnnouncement ea = eventAnnouncementRepository.findPublicById(announcementId)
                .orElseThrow(()
                        -> new NotFoundException("Announcement not found " + announcementId));

        return toAnnouncementResponse(ea);
    }

    @Override
    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncementByIdForManage(
            UUID announcementId,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        return toAnnouncementResponse(getAnnouncement(announcementId));
    }

    @Override
    @Transactional
    public AnnouncementResponse updateAnnouncement(
            UUID announcementId,
            UpdateAnnouncementRequest request,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        EventAnnouncement announcement = getAnnouncement(announcementId);
        ensureEditable(announcement);

        if (request.title() != null && !request.title().isBlank()) {
            announcement.setTitle(request.title().trim());
        }
        if (request.content() != null && !request.content().isBlank()) {
            announcement.setContent(request.content().trim());
        }
        if (request.pinned() != null) {
            announcement.setIsPinned(request.pinned());
        }
        if (request.resultAnnouncement() != null) {
            announcement.setIsResultAnnouncement(request.resultAnnouncement());
        }
        if (request.sendEmail() != null) {
            announcement.setSendEmail(request.sendEmail());
        }
        if (request.sendInApp() != null) {
            announcement.setSendInApp(request.sendInApp());
        }
        if (request.targetScope() != null) {
            announcement.setTargetScope(request.targetScope());
        }
        if (request.targetId() != null) {
            announcement.setTargetId(request.targetId());
        }
        if (request.targetTrackIds() != null) {
            announcement.setTargetTrackIds(new ArrayList<>(request.targetTrackIds()));
        }
        if (request.targetRoleNames() != null) {
            announcement.setTargetRoleNames(new ArrayList<>(request.targetRoleNames()));
        }
        if (request.scheduledAt() != null) {
            announcement.schedule(request.scheduledAt());
        }

        EventAnnouncement saved = eventAnnouncementRepository.save(announcement);

        return toAnnouncementResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(UUID announcementId, Authentication authentication) {
        ensureCoordinator(authentication);
        EventAnnouncement announcement = getAnnouncement(announcementId);

        if (announcement.isPublished()) {
            throw new ConflictException(
                    "Published announcements cannot be deleted. Cancel or unpublish first.");
        }

        eventAnnouncementRepository.delete(announcement);
    }

    @Override
    @Transactional
    public AnnouncementResponse publishAnnouncement(
            UUID announcementId,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        EventAnnouncement announcement = getAnnouncement(announcementId);
        User actor = currentUserService.getCurrentUser(authentication);

        if (announcement.isCancelled()) {
            throw new ConflictException("Cancelled announcement cannot be published.");
        }

        announcement.publish(LocalDateTime.now());
        createNotificationForAnnouncement(announcement, actor);

        EventAnnouncement saved = eventAnnouncementRepository.save(announcement);

        return toAnnouncementResponse(saved);
    }

    @Override
    @Transactional
    public AnnouncementResponse scheduleAnnouncement(
            UUID announcementId,
            UpdateAnnouncementRequest request,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        EventAnnouncement announcement = getAnnouncement(announcementId);
        ensureEditable(announcement);

        if (request.scheduledAt() == null) {
            throw new BadRequestException("scheduledAt is required.");
        }

        announcement.schedule(request.scheduledAt());

        return toAnnouncementResponse(eventAnnouncementRepository.save(announcement));
    }

    @Override
    @Transactional
    public AnnouncementResponse unpublishAnnouncement(
            UUID announcementId,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        EventAnnouncement announcement = getAnnouncement(announcementId);
        announcement.unpublish();

        return toAnnouncementResponse(eventAnnouncementRepository.save(announcement));
    }

    @Transactional
    @Override
    public AnnouncementResponse pinAnnouncement(
            UUID announcementId,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        EventAnnouncement announcement = getAnnouncement(announcementId);
        announcement.pin();

        return toAnnouncementResponse(eventAnnouncementRepository.save(announcement));
    }

    @Transactional
    @Override
    public AnnouncementResponse unpinAnnouncement(
            UUID announcementId,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        EventAnnouncement announcement = getAnnouncement(announcementId);
        announcement.unpin();

        return toAnnouncementResponse(eventAnnouncementRepository.save(announcement));
    }

    @Transactional
    @Override
    public AnnouncementResponse markResultAnnouncement(
            UUID announcementId,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);
        EventAnnouncement announcement = getAnnouncement(announcementId);
        announcement.markAsResultAnnouncement();

        return toAnnouncementResponse(eventAnnouncementRepository.save(announcement));
    }

    //HELPERS
    private void createNotificationForAnnouncement(EventAnnouncement announcement, User actor) {
        NotificationChannel channel = resolveChannel(announcement);
        Notification notification = Notification.builder()
                .event(announcement.getEvent())
                .createdBy(actor)
                .type(NotificationType.GENERAL)
                .title(announcement.getTitle())
                .body(announcement.getContent())
                .targetScope(announcement.getTargetScope())
                .targetId(announcement.getTargetId())
                .channel(channel)
                .status(NotificationStatus.SENT)
                .sentAt(LocalDateTime.now())
                .recipientCount(0)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationChannel resolveChannel(EventAnnouncement announcement) {
        boolean email = Boolean.TRUE.equals(announcement.getSendEmail());
        boolean inApp = Boolean.TRUE.equals(announcement.getSendInApp());
        if (email && inApp) return NotificationChannel.BOTH;
        if (email) return NotificationChannel.EMAIL;
        return NotificationChannel.IN_APP;
    }

    private void ensureEditable(EventAnnouncement announcement) {
        if (announcement.isPublished()) {
            throw new ConflictException("Published announcement cannot be edited. Unpublish it first.");
        }
        if (announcement.isCancelled()) {
            throw new ConflictException("Cancelled announcement cannot be edited.");
        }
    }

    private void ensureCoordinator(Authentication authentication) {
        if (!CurrentUser.isCoordinator(authentication)) {
            throw new UnauthorizedException("Only coordinators can manage event announcements.");
        }
    }

    private EventAnnouncement getAnnouncement(UUID announcementId) {
        return eventAnnouncementRepository.findById(announcementId)
                .orElseThrow(() -> new NotFoundException("Announcement not found " + announcementId));
    }

    private HackathonEvent getEvent(UUID eventId) {
        return hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));
    }

    private void ensureEventExists(UUID eventId) {
        if (!hackathonEventRepository.existsById(eventId)) {
            throw new NotFoundException("Event not found " + eventId);
        }
    }

    private AnnouncementResponse toAnnouncementResponse(EventAnnouncement announcement) {
        List<UUID> targetTrackIds = announcement.getTargetTrackIds() == null
                ? List.of()
                : List.copyOf(announcement.getTargetTrackIds());
        List<String> targetRoleNames = announcement.getTargetRoleNames() == null
                ? List.of()
                : List.copyOf(announcement.getTargetRoleNames());

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
                targetTrackIds,
                targetRoleNames
        );
    }
}

package com.t7.seal.service.impl;

import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.HackathonSeason;
import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.request.event.CreateEventRequest;
import com.t7.seal.request.event.UpdateEventRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.event.EventDetailResponse;
import com.t7.seal.response.event.EventSummaryResponse;
import com.t7.seal.response.round.RoundResponse;
import com.t7.seal.response.track.TrackResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.EventService;
import com.t7.seal.service.RoundDeadlineReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final HackathonEventRepository hackathonEventRepository;
    private final TrackRepository trackRepository;
    private final RoundRepository roundRepository;
    private final TeamRepository teamRepository;
    private final CurrentUserService currentUserService;
    private final RoundDeadlineReminderService roundDeadlineReminderService;
    private final AuditLogService auditLogService;

    private static final int MAX_PAGE_SIZE = 50;

    @Transactional(readOnly = true)
    @Override
    public PageResponse<EventSummaryResponse> getPublicEvent(
            String season, Integer year, String status, int size, int page) {

        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Page<HackathonEvent> events = hackathonEventRepository.searchPublicEvents(
                normalize(status),
                normalize(season),
                year,
                PageRequest.of(safePage, safeSize));

        List<EventSummaryResponse> content = events.getContent()
                .stream()
                .map(this::toEventSummaryResponse)
                .toList();

        return new PageResponse<>(
                content,
                events.getNumber(),
                events.getSize(),
                events.getTotalElements(),
                events.getTotalPages(),
                events.isLast()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponse<EventSummaryResponse> getAllEvents(
            String season, Integer year, String status, int size, int page) {

        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Page<HackathonEvent> events = hackathonEventRepository.searchAllEvents(
                normalize(status),
                normalize(season),
                year,
                PageRequest.of(safePage, safeSize));

        List<EventSummaryResponse> content = events.getContent()
                .stream()
                .map(this::toEventSummaryResponse)
                .toList();

        return new PageResponse<>(
                content,
                events.getNumber(),
                events.getSize(),
                events.getTotalElements(),
                events.getTotalPages(),
                events.isLast()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public EventDetailResponse getEventById(UUID eventId, Authentication authentication) {
        User user = authentication == null ? null : currentUserService.getCurrentUser(authentication);
        boolean canManageEvent = user != null
                && (user.getRole() == UserRole.COORDINATOR || user.getRole() == UserRole.ADMIN);

        HackathonEvent event = canManageEvent
                ? hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId))
                : hackathonEventRepository.findPublicEventById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        return buildEventDetailResponse(event, canManageEvent);
    }

    @Transactional
    @Override
    public EventDetailResponse createEvent(CreateEventRequest event, Authentication authentication) {

        User user = currentUserService.getCurrentUser(authentication);

//        take user from authentication instead of from request

//        UUID userId = CurrentUser.id(authentication);
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new NotFoundException("User not found"));

        validateRequest(event);

        if (hackathonEventRepository.existsByNameIgnoreCaseAndYear(event.name().trim(), event.year())) {
            throw new ConflictException("Event with this name and year already exists.");
        }

        HackathonEvent newEvent = new HackathonEvent();

        newEvent.setName(event.name().trim());
        newEvent.setCreatedBy(user);
        newEvent.setDescription(trimToNull(event.description()));
        newEvent.setSeason(parseEnum(HackathonSeason.class, event.season(), "season"));
        newEvent.setYear(event.year());
        newEvent.setRegistrationOpen(event.registrationStartAt());
        newEvent.setRegistrationClose(event.registrationEndAt());
        newEvent.setCompetitionStartAt(event.competitionStartAt());
        newEvent.setCompetitionEndAt(event.competitionEndAt());
        if (event.varianceThresholdPoints() != null) {
            newEvent.setVarianceThresholdPoints(event.varianceThresholdPoints());
        }
        newEvent.setBannerUrl(trimToNull(event.bannerUrl()));

        if (event.status() != null
                && !event.status().isBlank()
                && parseEnum(RegistrationStatus.class, event.status(), "status") != RegistrationStatus.DRAFT) {
            throw new BadRequestException("New event must start from DRAFT status.");
        }
        newEvent.setStatus(RegistrationStatus.DRAFT);
        newEvent.setSlug(getSlug(event.name()));

        HackathonEvent saved = hackathonEventRepository.save(newEvent);

        return buildEventDetailResponse(saved, true);
    }

    @Transactional
    @Override
    public EventDetailResponse updateEvent(UUID eventId, UpdateEventRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        assertEventInfoEditable(event);

        if (request.status() != null && !request.status().isBlank()) {
            throw new BadRequestException("Event status must be changed through workflow endpoints.");
        }

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new BadRequestException("Event name is required");
            }

            event.setName(request.name().trim());
            event.setSlug(getSlug(request.name()));
        }

        if (request.season() != null && !request.season().isBlank()) {
            event.setSeason(parseEnum(HackathonSeason.class, request.season(), "season"));
        }

        if (request.year() != null) {
            event.setYear(request.year());
        }

        applyIfNotNull(request.description(), v -> event.setDescription(trimToNull(v)));

        applyIfNotNull(request.registrationStartAt(), v -> event.setRegistrationOpen(v));
        if (request.registrationEndAt() != null) {
            event.setRegistrationClose(request.registrationEndAt());
        }

        applyIfNotNull(request.competitionStartAt(), event::setCompetitionStartAt);
        applyIfNotNull(request.competitionEndAt(), event::setCompetitionEndAt);

        validateEventTimeline(
                event.getRegistrationOpen(),
                event.getRegistrationClose(),
                event.getCompetitionStartAt(),
                event.getCompetitionEndAt()
        );
        validateNoCompetitionOverlap(event.getId(), event.getSeason(), event.getCompetitionStartAt(), event.getCompetitionEndAt());

        if (request.varianceThresholdPoints() != null) {
            event.setVarianceThresholdPoints(request.varianceThresholdPoints());
        }

        if (request.bannerUrl() != null) {
            event.setBannerUrl(trimToNull(request.bannerUrl()));
        }
        event.setUpdatedAt(LocalDateTime.now());

        HackathonEvent saved = hackathonEventRepository.save(event);

        return buildEventDetailResponse(saved, true);
    }

    @Transactional
    @Override
    public EventDetailResponse advanceEventStatus(UUID eventId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        RegistrationStatus nextStatus = switch (event.getStatus()) {
            case DRAFT -> RegistrationStatus.REGISTRATION;
            case REGISTRATION -> RegistrationStatus.ONGOING;
            case ONGOING -> RegistrationStatus.JUDGING;
            case JUDGING -> RegistrationStatus.COMPLETED;
            case COMPLETED, CANCELLED, ARCHIVED -> throw new ConflictException("Event has no next status.");
        };

        changeEventStatus(event, nextStatus);
        event.setUpdatedAt(LocalDateTime.now());

        HackathonEvent saved = hackathonEventRepository.save(event);
        roundDeadlineReminderService.synchronizeEventSubmissionDeadlineReminders(saved, actor);
        return buildEventDetailResponse(saved, true);
    }


    @Transactional
    @Override
    public EventDetailResponse cancelEvent(UUID eventId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        Map<String, Object> beforeState = Map.of(
                "name", event.getName(),
                "status", event.getStatus().name()
        );

        RegistrationStatus deletedStatus = teamRepository.existsByEventId(eventId)
                ? RegistrationStatus.ARCHIVED
                : RegistrationStatus.CANCELLED;

        changeEventStatus(event, deletedStatus);
        event.setUpdatedAt(LocalDateTime.now());

        HackathonEvent saved = hackathonEventRepository.save(event);
        roundDeadlineReminderService.cancelEventSubmissionDeadlineReminders(saved.getId());
        auditLogService.record(
                actor,
                AuditActionType.EVENT_CANCELLED,
                "hackathon_events",
                saved.getId(),
                beforeState,
                Map.of("name", saved.getName(), "status", saved.getStatus().name()),
                null
        );
        return buildEventDetailResponse(saved, true);
    }

    @Transactional
    @Override
    public void deleteEvent(UUID eventId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        if (event.getStatus() != RegistrationStatus.DRAFT) {
            throw new ConflictException(
                    "EVENT_DELETE_REQUIRES_DRAFT",
                    "Only draft events can be deleted. Cancel the event instead."
            );
        }

        Map<String, Object> beforeState = Map.of(
                "name", event.getName(),
                "status", event.getStatus().name(),
                "season", event.getSeason().name(),
                "year", event.getYear()
        );

        try {
            roundDeadlineReminderService.cancelEventSubmissionDeadlineReminders(eventId);
            hackathonEventRepository.delete(event);
            hackathonEventRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException(
                    "EVENT_DELETE_HAS_DEPENDENCIES",
                    "This draft event has dependent records and cannot be deleted."
            );
        }

        auditLogService.record(
                actor,
                AuditActionType.EVENT_DELETED,
                "hackathon_events",
                eventId,
                beforeState,
                null,
                null
        );
    }

    //HELPERS
    private TrackResponse toTrackResponse(Track track) {
        return new TrackResponse(
                track.getId(),
                track.getEvent().getId(),
                track.getName(),
                track.getDescription(),
                track.getMaxTeams(),
                track.getRequiredLinkTypes()
        );
    }

    private RoundResponse toRoundResponse(Round round) {
        return new RoundResponse(
                round.getId(),
                round.getEvent().getId(),
                round.getName(),
                round.getDescription(),
                round.getOrderIndex(),
                round.getIsFinal(),
                round.getStatus().name(),
                round.getStartAt(),
                round.getEndAt(),
                round.getSubmissionDeadline(),
                round.getJudgingDeadline(),
                round.getResultPublishedAt()
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank() || value.equalsIgnoreCase("ALL")) {
            return null;
        }

        return value.trim().toUpperCase();
    }

    private EventSummaryResponse toEventSummaryResponse(HackathonEvent e) {
        return new EventSummaryResponse(
                e.getId(),
                e.getName(),
                e.getSeason().name(),
                e.getYear(),
                e.getStatus().name(),
                e.getBannerUrl(),
                e.getCompetitionStartAt(),
                e.getCompetitionEndAt()
        );
    }

    private void validateRequest(CreateEventRequest request) {
        if (request.name().isBlank()) {
            throw new BadRequestException("Event name is required");
        }

        if (request.season().isBlank()) {
            throw new BadRequestException("Event season is required");
        }

        if (request.year() == null) {
            throw new BadRequestException("Event year is required");
        }

        validateEventTimeline(
                request.registrationStartAt(),
                request.registrationEndAt(),
                request.competitionStartAt(),
                request.competitionEndAt()
        );
        validateNoCompetitionOverlap(
                null,
                parseEnum(HackathonSeason.class, request.season(), "season"),
                request.competitionStartAt(),
                request.competitionEndAt()
        );

    }

    private void validateEventTimeline(
            LocalDateTime registrationStartAt,
            LocalDateTime registrationEndAt,
            LocalDateTime competitionStartAt,
            LocalDateTime competitionEndAt) {

        requireTime(registrationStartAt, "Registration start time");
        requireTime(registrationEndAt, "Registration end time");
        requireTime(competitionStartAt, "Competition start time");
        requireTime(competitionEndAt, "Competition end time");

        if (!registrationStartAt.isBefore(registrationEndAt)) {
            throw new BadRequestException("Registration start time must be before registration end time");
        }

        if (!competitionStartAt.isBefore(competitionEndAt)) {
            throw new BadRequestException("Competition start time must be before competition end time");
        }

        if (registrationEndAt.isAfter(competitionStartAt)) {
            throw new BadRequestException("Registration end time must be before or equal to competition start time");
        }
    }

    private void requireTime(LocalDateTime value, String fieldName) {
        if (value == null) {
            throw new BadRequestException(fieldName + " is required");
        }
    }

    private void validateNoCompetitionOverlap(
            UUID excludedEventId,
            HackathonSeason season,
            LocalDateTime competitionStartAt,
            LocalDateTime competitionEndAt) {

        if (hackathonEventRepository.existsOverlappingCompetitionPeriod(
                season,
                excludedEventId,
                competitionStartAt,
                competitionEndAt
        )) {
            throw new ConflictException("Competition period overlaps with another event in the same season.");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        try {
            return Enum.valueOf(enumClass, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(String.format("Invalid %s: %s", fieldName, value));
        }
    }

    private EventDetailResponse buildEventDetailResponse(HackathonEvent event, boolean includeAllChildren) {
        List<Track> trackEntities = includeAllChildren
                ? trackRepository.findByEventIdOrderByNameAsc(event.getId())
                : trackRepository.findPublicByEventIdOrderByNameAsc(event.getId());

        List<TrackResponse> tracks = trackEntities.stream()
                .map(this::toTrackResponse)
                .toList();

        List<Round> roundEntities = includeAllChildren
                ? roundRepository.findByEventIdOrderByOrderIndexAsc(event.getId())
                : roundRepository.findPublicByEventIdOrderByOrderIndexAsc(event.getId());

        List<RoundResponse> rounds = roundEntities.stream()
                .map(this::toRoundResponse)
                .toList();

        return new EventDetailResponse(
                event.getId(),
                event.getName(),
                event.getDescription(),
                event.getSeason().name(),
                event.getYear(),
                event.getStatus().name(),
                event.getBannerUrl(),
                event.getRegistrationOpen(),
                event.getRegistrationClose(),
                event.getCompetitionStartAt(),
                event.getCompetitionEndAt(),
                event.getResultPublishedAt(),
                event.getVarianceThresholdPoints(),
                tracks,
                rounds
        );
    }


    private void assertEventInfoEditable(HackathonEvent event) {
        RegistrationStatus status = event.getStatus();

        if (status == RegistrationStatus.JUDGING
                || status == RegistrationStatus.COMPLETED
                || status == RegistrationStatus.CANCELLED
                || status == RegistrationStatus.ARCHIVED) {
            throw new ConflictException("Event information is locked in status " + status + ".");
        }
    }

    private void changeEventStatus(HackathonEvent event, RegistrationStatus requestedStatus) {
        if (requestedStatus == event.getStatus()) {
            return;
        }

        if (requestedStatus == RegistrationStatus.ARCHIVED) {
            event.setStatus(RegistrationStatus.ARCHIVED);
            return;
        }

        if (requestedStatus == RegistrationStatus.CANCELLED) {
            if (event.getStatus() == RegistrationStatus.COMPLETED) {
                throw new ConflictException("Completed event cannot be cancelled.");
            }
            event.setStatus(RegistrationStatus.CANCELLED);
            return;
        }

        switch (requestedStatus) {
            case REGISTRATION -> event.openRegistration();
            case ONGOING -> event.startEvent();
            case JUDGING -> event.startJudging();
            case COMPLETED -> event.complete();
            case DRAFT -> throw new BadRequestException("Event status cannot move back to DRAFT.");
            case CANCELLED -> throw new BadRequestException("Invalid status transition.");
            case ARCHIVED -> throw new BadRequestException("Invalid status transition.");
        }
    }

    private <T> void applyIfNotNull(T value, Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }

    private String getSlug(String eventName) {
        if (eventName == null || eventName.isBlank()) {
            throw new BadRequestException("Event name is required");
        }

        eventName = eventName.toLowerCase().replace(" ", "-");

        return eventName;
    }
}

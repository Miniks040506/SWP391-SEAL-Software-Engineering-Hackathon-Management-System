package com.t7.seal.service.impl;

import com.t7.seal.domain.HackathonSeason;
import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.Track;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.request.event.UpdateEventRequest;
import com.t7.seal.request.system.CreateEventRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.event.EventDetailResponse;
import com.t7.seal.response.event.EventSummaryResponse;
import com.t7.seal.response.round.RoundResponse;
import com.t7.seal.response.track.TrackResponse;
import com.t7.seal.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final HackathonEventRepository hackathonEventRepository;
    private final TrackRepository trackRepository;
    private final RoundRepository roundRepository;

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
    public EventDetailResponse getEventById(UUID eventId) {
        HackathonEvent event = hackathonEventRepository.findPublicEventById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));
        return buildEventDetailResponse(event);
    }

    @Transactional
    @Override
    public EventDetailResponse createEvent(CreateEventRequest event) {

        validateRequest(event);

        if (hackathonEventRepository.existsByNameIgnoreCaseAndYear(event.name().trim(), event.year())) {
            throw new ConflictException("Event with this name and year already exists.");
        }

        HackathonEvent newEvent = new HackathonEvent();

        newEvent.setName(event.name().trim());
        newEvent.setDescription(trimToNull(event.description()));
        newEvent.setSeason(parseEnum(HackathonSeason.class, event.season(), "season"));
        newEvent.setYear(event.year());
        newEvent.setRegistrationOpen(event.registrationStartAt());
        newEvent.setRegistrationClose(event.registrationEndAt());
        newEvent.setBannerUrl(trimToNull(event.bannerUrl()));
        newEvent.setStatus(event.status() == null || event.status().isBlank() ?
                RegistrationStatus.DRAFT :
                parseEnum(RegistrationStatus.class, event.status(), "status"));

        HackathonEvent saved = hackathonEventRepository.save(newEvent);

        return buildEventDetailResponse(saved);
    }

    @Transactional
    @Override
    public EventDetailResponse updateEvent(UUID eventId, UpdateEventRequest request) {
        HackathonEvent event = hackathonEventRepository.findPublicEventById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new BadRequestException("Event name is required");
            }

            event.setName(request.name().trim());
        }

        applyIfNotNull(request.description(), v -> event.setDescription(trimToNull(v)));

        applyIfNotNull(request.registrationStartAt(), v -> event.setRegistrationOpen(v));
        if (request.registrationEndAt() != null) {
            event.setRegistrationClose(request.registrationEndAt());
        }

        validateRegistrationTime(event.getRegistrationOpen(), event.getRegistrationClose());

        if (request.bannerUrl() != null) {
            event.setBannerUrl(trimToNull(request.bannerUrl()));
        }
        if (request.status() != null) {
            event.setStatus(parseEnum(RegistrationStatus.class, request.status(), "status"));
        }

        HackathonEvent saved = hackathonEventRepository.save(event);

        return buildEventDetailResponse(saved);
    }

    @Transactional
    @Override
    public void deleteEvent(UUID eventId) {
        HackathonEvent event = hackathonEventRepository.findPublicEventById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        if (event.getResultPublishedAt() != null) {
            throw new ConflictException("Cannot delete event that has already published result");
        }

        event.setStatus(RegistrationStatus.CANCELLED);

        hackathonEventRepository.save(event);
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
                round.getOrderIndex(),
                round.getIsFinal(),
                round.getStatus().name()
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
                e.getBannerUrl()
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

        validateRegistrationTime(request.registrationStartAt(), request.registrationEndAt());

    }

    private void validateRegistrationTime(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null && start.isAfter(end)) {
            throw new BadRequestException("Registration start time must be before registration end time");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, String fieldName) {
        try {
            return Enum.valueOf(enumClass, value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException(String.format("Invalid %s: %s", fieldName, value));
        }
    }

    private EventDetailResponse buildEventDetailResponse(HackathonEvent event) {
        List<TrackResponse> tracks = trackRepository.findPublicByEventIdOrderByNameAsc(event.getId())
                .stream()
                .map(this::toTrackResponse)
                .toList();

        List<RoundResponse> rounds = roundRepository.findPublicByEventIdOrderByOrderIndexAsc(event.getId())
                .stream()
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
                tracks,
                rounds
        );
    }

    private <T> void applyIfNotNull(T value, Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }
}


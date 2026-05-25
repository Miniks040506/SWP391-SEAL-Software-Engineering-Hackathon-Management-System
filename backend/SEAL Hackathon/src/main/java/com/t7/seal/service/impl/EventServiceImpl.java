package com.t7.seal.service.impl;

import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.Track;
import com.t7.seal.exception.EventException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.TrackRepository;
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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final HackathonEventRepository hackathonEventRepository;
    private final TrackRepository trackRepository;
    private final RoundRepository roundRepository;

    private static final int MAX_PAGE_SIZE = 50;

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

    @Override
    public EventDetailResponse getEventById(UUID eventId) {
        HackathonEvent event = hackathonEventRepository.findPublicEventById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        List<TrackResponse> tracks = trackRepository.findPublicByEventIdOrderByNameAsc(eventId)
                .stream()
                .map(this::toTrackResponse)
                .toList();

        List<RoundResponse> rounds = roundRepository.findPublicByEventIdOrderByOrderIndexAsc(eventId)
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
}


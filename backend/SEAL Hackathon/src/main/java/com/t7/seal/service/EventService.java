package com.t7.seal.service;

import com.t7.seal.request.event.CreateEventRequest;
import com.t7.seal.request.event.UpdateEventRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.event.EventDetailResponse;
import com.t7.seal.response.event.EventSummaryResponse;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface EventService {
    PageResponse<EventSummaryResponse> getPublicEvent(String season, Integer year, String status, int size, int page);

    PageResponse<EventSummaryResponse> getAllEvents(String season, Integer year, String status, int size, int page);

    EventDetailResponse getEventById(UUID eventId, Authentication authentication);

    EventDetailResponse createEvent(CreateEventRequest event, Authentication authentication);

    EventDetailResponse updateEvent(UUID eventId, UpdateEventRequest request, Authentication authentication);

    EventDetailResponse advanceEventStatus(UUID eventId, Authentication authentication);

    void deleteEvent(UUID eventId, Authentication authentication);
}

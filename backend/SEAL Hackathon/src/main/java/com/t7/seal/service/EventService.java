package com.t7.seal.service;

import com.t7.seal.request.event.CreateEventRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.event.EventDetailResponse;
import com.t7.seal.response.event.EventSummaryResponse;

import java.util.UUID;

public interface EventService {
    PageResponse<EventSummaryResponse> getPublicEvent(String season, Integer year, String status, int size, int page);

    EventDetailResponse getEventById(UUID eventId);

    EventDetailResponse createEvent(CreateEventRequest event);
}

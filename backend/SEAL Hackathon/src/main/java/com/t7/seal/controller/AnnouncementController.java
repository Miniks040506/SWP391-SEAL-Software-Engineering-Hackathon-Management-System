package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.CreateAnnouncementRequest;
import com.t7.seal.request.system.UpdateAnnouncementRequest;
import com.t7.seal.response.system.AnnouncementResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
public class AnnouncementController {
    @GetMapping("/events/{eventId}/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getEventAnnouncements(
            @PathVariable UUID eventId
    ) {
        return null;
    }

    @PostMapping("/events/{eventId}/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateAnnouncementRequest request
    ) {
        return null;
    }

    @GetMapping("/announcements/{announcementId}")
    public ResponseEntity<AnnouncementResponse>	getAnnouncementById(
            @PathVariable UUID announcementId
    ) {
        return null;
    }

    @PatchMapping("/announcements/{announcementId}")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(
            @PathVariable UUID announcementId,
            @Valid @RequestBody UpdateAnnouncementRequest request
    ) {
        return null;
    }

    @DeleteMapping("/announcements/{announcementId}")
    public ResponseEntity<Void>	deleteAnnouncement(
            @PathVariable UUID announcementId
    ){
        return null;
    }

    @PostMapping("/announcements/{announcementId}/publish")
    public ResponseEntity<AnnouncementResponse> publishAnnouncement(
            @PathVariable UUID announcementId
    ) {
        return null;
    }

    @PostMapping("/announcements/{announcementId}/unpublish")
    public ResponseEntity<AnnouncementResponse> unpublishAnnouncement(
            @PathVariable UUID announcementId
    ) {
        return null;
    }

    @PostMapping("/announcements/{announcementId}/pin")
    public ResponseEntity<AnnouncementResponse> pinAnnouncement(
            @PathVariable UUID announcementId
    ) {
        return null;
    }

    @PostMapping("/announcements/{announcementId}/unpin")
    public ResponseEntity<AnnouncementResponse> unpinAnnouncement(
            @PathVariable UUID announcementId
    ) {
        return null;
    }

    @PostMapping("/announcements/{announcementId}/mark-result")
    public ResponseEntity<AnnouncementResponse> markResultAnnouncement(
            @PathVariable UUID announcementId
    ) {
        return null;
    }
}

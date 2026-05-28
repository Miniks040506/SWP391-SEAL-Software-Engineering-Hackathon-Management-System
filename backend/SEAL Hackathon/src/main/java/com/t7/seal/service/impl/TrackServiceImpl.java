package com.t7.seal.service.impl;

import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.MentorAssignment;
import com.t7.seal.entities.Track;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.MentorAssignmentRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.request.track.CreateTrackRequest;
import com.t7.seal.request.track.UpdateTrackRequest;
import com.t7.seal.response.track.MentorAssignmentResponse;
import com.t7.seal.response.track.TrackDetailResponse;
import com.t7.seal.response.track.TrackResponse;
import com.t7.seal.service.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrackServiceImpl implements TrackService {

    private final HackathonEventRepository hackathonEventRepository;
    private final TrackRepository trackRepository;
    private final TeamRepository teamRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;

    @Transactional
    @Override
    public TrackResponse createTrack(UUID eventId, CreateTrackRequest request) {
        HackathonEvent event = hackathonEventRepository.findPublicEventById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        validateCreateTrackRequest(request);

        String name = request.name().trim();

        if (trackRepository.existsByEventIdAndNameIgnoreCase(eventId, name)) {
            throw new ConflictException("Track with this name already exists in this event.");
        }

        Track track = new Track();
        track.setEvent(event);
        track.setName(name);
        track.setDescription(trimToNull(request.description()));
        track.setRequiredLinkTypes(parseRequiredLinkTypes(request.requiredLinkTypes()));
        track.setMaxTeams(request.maxTeams());

        Track saved = trackRepository.save(track);

        return toTrackResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TrackResponse> getTracksByEvent(UUID eventId) {
        return trackRepository.findPublicByEventIdOrderByNameAsc(eventId)
                .stream()
                .map(this::toTrackResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public TrackDetailResponse getTrackById(UUID trackId) {
        Track track = trackRepository.findPublicById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found " + trackId));

        int registerdTeamCount = teamRepository.CountActiveTeamByTrackId(trackId);

        List<MentorAssignmentResponse> mentorAssignmentResponses = mentorAssignmentRepository
                .findByTrackIdOrderByAssignAtAsc(trackId)
                .stream()
                .map(this::toMentorAssignmentResponse)
                .toList();

        return new TrackDetailResponse(
                track.getId(),
                track.getEvent().getId(),
                track.getName(),
                track.getDescription(),
                track.getMaxTeams(),
                registerdTeamCount,
                mentorAssignmentResponses
        );
    }

    @Transactional
    @Override
    public TrackResponse updateTrack(UUID trackId, UpdateTrackRequest request) {
        Track track = trackRepository.findPublicById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found " + trackId));

        if (request.name() != null) {

            String name = request.name().trim();

            if (name.isBlank()) {
                throw new BadRequestException("Track name is required");
            }

            if (!name.equalsIgnoreCase(track.getName())
                    && trackRepository.existsByEventIdAndNameIgnoreCase(track.getEvent().getId(), name)) {
                throw new ConflictException("Track with this name already exists in this event.");
            }

            track.setName(name);
        }

        if (request.description() != null) {
            track.setDescription(trimToNull(request.description()));
        }

        if (request.maxTeams() != null) {
            if (request.maxTeams() <= 0) {
                throw new BadRequestException("Track maxTeams must be greater than 0");
            }

            int activeTeamCount = teamRepository.CountActiveTeamByTrackId(trackId);
            if (request.maxTeams() < activeTeamCount) {
                throw new ConflictException("Track maxTeams cannot be less than current active team count");
            }

            track.setMaxTeams(request.maxTeams());
        }

        if (request.requiredLinkTypes() != null) {
            track.setRequiredLinkTypes(parseRequiredLinkTypes(request.requiredLinkTypes()));
        }

        Track saved = trackRepository.save(track);

        return toTrackResponse(saved);
    }

    @Transactional
    @Override
    public void deleteTrack(UUID trackId) {
        Track track = trackRepository.findPublicById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found " + trackId));

        if (teamRepository.CountActiveTeamByTrackId(trackId) > 0) {
            throw new ConflictException("Cannot delete track that has active teams");
        }

        trackRepository.delete(track);
    }

    //HELPERS
    private void validateCreateTrackRequest(CreateTrackRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new BadRequestException("Track name is required");
        }

        if (request.maxTeams() != null && request.maxTeams() <= 0) {
            throw new BadRequestException("Track maxTeams must be greater than 0");
        }
    }

    private List<SubmissionLinkType> parseRequiredLinkTypes(List<String> requiredLinkTypes) {
        if (requiredLinkTypes == null) {
            return null;
        }

        return requiredLinkTypes.stream()
                .map(linkType -> parseEnum(SubmissionLinkType.class, linkType, "requiredLinkTypes"))
                .toList();
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

    private MentorAssignmentResponse toMentorAssignmentResponse(MentorAssignment assignment) {
        return new MentorAssignmentResponse(
                assignment.getId(),
                assignment.getTrack().getId(),
                assignment.getUser().getId(),
                assignment.getUser().getFullName(),
                assignment.getAssignAt()
        );
    }
}

package com.t7.seal.service.impl;

import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.MentorAssignment;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
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
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.TrackService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
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

    private final CurrentUserService currentUserService;

    @Transactional
    @Override
    public TrackResponse createTrack(UUID eventId, CreateTrackRequest request, Authentication authentication) {

        currentUserService.getCurrentUser(authentication);

        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        assertTrackRoundEditable(event);

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
    public List<TrackResponse> getTracksByEvent(UUID eventId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        List<Track> tracks;

        if (user.getRole() == UserRole.COORDINATOR) {
            tracks = trackRepository.findByEventIdOrderByNameAsc(eventId);
        } else {
            tracks = trackRepository.findPublicByEventIdOrderByNameAsc(eventId);
        }


        return tracks.stream()
                .map(this::toTrackResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public TrackDetailResponse getTrackById(UUID trackId, Authentication authentication) {
        Track track;

        User user = currentUserService.getCurrentUser(authentication);

        if (user.getRole() == UserRole.COORDINATOR) {
            track = trackRepository.findById(trackId)
                    .orElseThrow(() -> new NotFoundException("Track not found " + trackId));
        } else {
            track = trackRepository.findPublicById(trackId)
                    .orElseThrow(() -> new NotFoundException("Track not found " + trackId));
        }

        int registerdTeamCount = teamRepository.CountActiveTeamByTrackId(trackId);

        List<MentorAssignmentResponse> mentorAssignmentResponses = mentorAssignmentRepository
                .findByTrackIdOrderByAssignedAtAsc(trackId)
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
    public TrackResponse updateTrack(UUID trackId, UpdateTrackRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found " + trackId));

        assertTrackRoundEditable(track.getEvent());

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
    public void deleteTrack(UUID trackId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found " + trackId));

        assertTrackRoundEditable(track.getEvent());

        if (teamRepository.CountActiveTeamByTrackId(trackId) > 0) {
            throw new ConflictException("Cannot delete track that has active teams");
        }

        trackRepository.delete(track);
    }

    //HELPERS

    private void assertTrackRoundEditable(HackathonEvent event) {
        RegistrationStatus status = event.getStatus();

        if (status != RegistrationStatus.DRAFT && status != RegistrationStatus.REGISTRATION) {
            throw new ConflictException("Tracks are locked in event status " + status + ".");
        }
    }

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
                assignment.getAssignedAt()
        );
    }
}

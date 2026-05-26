package com.t7.seal.service.impl;

import com.t7.seal.entities.MentorAssignment;
import com.t7.seal.entities.Track;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.MentorAssignmentRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.repository.TrackRepository;
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

    private final TrackRepository trackRepository;
    private final TeamRepository teamRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;

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

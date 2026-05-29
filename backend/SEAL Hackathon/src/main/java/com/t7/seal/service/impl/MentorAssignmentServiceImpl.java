package com.t7.seal.service.impl;

import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.MentorAssignment;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.MentorAssignmentRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.request.track.AssignMentorRequest;
import com.t7.seal.response.track.MentorAssignmentResponse;
import com.t7.seal.service.MentorAssignmentService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MentorAssignmentServiceImpl implements MentorAssignmentService {

    private final TrackRepository trackRepository;
    private final UserRepository userRepository;
    private final MentorAssignmentRepository assignmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MentorAssignmentResponse> getMentorAssignments(UUID trackId) {
        findTrack(trackId);
        return assignmentRepository.findByTrackIdOrderByAssignedAtAsc(trackId)
                .stream()
                .map(this::toMentorAssignmentResponse)
                .toList();
    }

    @Override
    @Transactional
    public MentorAssignmentResponse assignMentor(UUID trackId, AssignMentorRequest request) {
        Track track = findTrack(trackId);
        User mentor = findUser(request.mentorUserId());

        if (mentor.getRole() != UserRole.MENTOR) {
            throw new BadRequestException("Selected user is not a mentor.");
        }
        if (mentor.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Mentor account must be ACTIVE.");
        }
        if (assignmentRepository.existsByTrackIdAndUserId(trackId, mentor.getId())) {
            throw new ConflictException("This mentor is already assigned to this track.");
        }

        MentorAssignment assignment = new MentorAssignment();
        assignment.setTrack(track);
        assignment.setUser(mentor);

        assignment.setAssignedBy(track.getEvent().getCreatedBy());

        assignment.setAssignedAt(LocalDateTime.now());

        return toMentorAssignmentResponse(assignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public void removeMentorAssignment(UUID trackId, UUID assignmentId) {
        findTrack(trackId);
        MentorAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NotFoundException("Mentor assignment not found."));

        if (!assignment.getTrack().getId().equals(trackId)) {
            throw new BadRequestException("Mentor assignment does not belong to this track.");
        }

        assignmentRepository.delete(assignment);
    }

    //HELPERS
    private Track findTrack(UUID trackId) {
        if (trackId == null) throw new BadRequestException("Track id is required.");
        return trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found."));
    }

    private User findUser(UUID userId) {
        if (userId == null) throw new BadRequestException("Mentor user id is required.");
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Mentor user not found."));
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

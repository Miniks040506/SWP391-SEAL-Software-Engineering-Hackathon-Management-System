package com.t7.seal.service.impl;

import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;
import com.t7.seal.entities.MentorAssignment;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.MentorAssignmentRepository;
import com.t7.seal.repository.RoundJudgeAssignmentRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.repository.UserRepository;
import com.t7.seal.request.track.AssignMentorRequest;
import com.t7.seal.response.track.MentorAssignmentResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.MentorAssignmentService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
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
    private final CurrentUserService currentUserService;
    private final RoundJudgeAssignmentRepository roundJudgeAssignmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MentorAssignmentResponse> getMentorAssignments(UUID trackId) {
//        findTrack(trackId);
        return assignmentRepository.findByTrackIdOrderByAssignedAtAsc(trackId)
                .stream()
                .map(this::toMentorAssignmentResponse)
                .toList();
    }

    @Override
    @Transactional
    public MentorAssignmentResponse assignMentor(UUID trackId, AssignMentorRequest request, Authentication authentication) {
        User assignedBy = currentUserService.getCurrentUser(authentication);

        Track track = findTrack(trackId);
        assertAssignmentEditable(track.getEvent().getStatus());
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

        boolean conflict = roundJudgeAssignmentRepository.existsJudgeAssignedToTrackInSameEvent(
                mentor.getId(),
                track.getEvent().getId(),
                trackId
        );

        if (conflict) {
            throw new ConflictException("This user is already assigned as judge in this track/event.");
        }

        MentorAssignment assignment = new MentorAssignment();
        assignment.setTrack(track);
        assignment.setUser(mentor);

        assignment.setAssignedBy(assignedBy);

        assignment.setAssignedAt(LocalDateTime.now());

        return toMentorAssignmentResponse(assignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public void removeMentorAssignment(UUID trackId, UUID assignmentId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

//        findTrack(trackId);
        MentorAssignment assignment = assignmentRepository.findByIdAndTrackId(assignmentId, trackId)
                .orElseThrow(() -> new NotFoundException("Mentor assignment not found."));

        assertAssignmentEditable(assignment.getTrack().getEvent().getStatus());

        if (!assignment.getTrack().getId().equals(trackId)) {
            throw new BadRequestException("Mentor assignment does not belong to this track.");
        }

        assignmentRepository.delete(assignment);
    }

    //HELPERS

    private void assertAssignmentEditable(RegistrationStatus status) {
        if (status == RegistrationStatus.JUDGING
                || status == RegistrationStatus.COMPLETED
                || status == RegistrationStatus.CANCELLED
                || status == RegistrationStatus.ARCHIVED) {
            throw new ConflictException("Mentor assignments are locked in event status " + status + ".");
        }
    }

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

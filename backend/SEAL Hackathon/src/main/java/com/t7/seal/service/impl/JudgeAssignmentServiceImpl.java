package com.t7.seal.service.impl;

import com.t7.seal.entities.Judge;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.RoundJudgeAssignment;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.JudgeRepository;
import com.t7.seal.repository.MentorAssignmentRepository;
import com.t7.seal.repository.RoundJudgeAssignmentRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.request.round.AssignJudgeRequest;
import com.t7.seal.response.round.JudgeAssignmentResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.JudgeAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JudgeAssignmentServiceImpl implements JudgeAssignmentService {

    private final RoundJudgeAssignmentRepository assignmentRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final JudgeRepository judgeRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public List<JudgeAssignmentResponse> getJudgeAssignments(UUID roundId) {
        return assignmentRepository.findByRoundIdWithJudgeAndTrack(roundId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public JudgeAssignmentResponse assignJudge(UUID roundId, AssignJudgeRequest request, Authentication authentication) {
        User assignedBy = currentUserService.getCurrentUser(authentication);

        if (request.judgeId() == null) {
            throw new BadRequestException("judgeId is required.");
        }

        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found."));

        Judge judge = judgeRepository.findByIdWithUser(request.judgeId())
                .orElseThrow(() -> new NotFoundException("Judge not found."));

        Track track = null;

        if (request.trackId() != null) {
            track = trackRepository.findById(request.trackId())
                    .orElseThrow(() -> new NotFoundException("Track not found."));

            if (!track.getEvent().getId().equals(round.getEvent().getId())) {
                throw new BadRequestException("Track does not belong to the same event as round.");
            }
        }

        UUID trackId = track == null ? null : track.getId();

        if (assignmentRepository.existsByRoundIdAndJudgeIdAndTrackIdNullable(roundId, judge.getId(), trackId)) {
            throw new ConflictException("Judge is already assigned to this round/track.");
        }

        if (track != null && mentorAssignmentRepository.existsByTrackIdAndUserId(track.getId(), judge.getUser().getId())) {
            throw new ConflictException("This user is already assigned as mentor for this track.");
        }

        RoundJudgeAssignment assignment = new RoundJudgeAssignment();
        assignment.setRound(round);
        assignment.setJudge(judge);
        assignment.setTrack(track);
        assignment.setAssignedBy(assignedBy);
        assignment.setTotalToScore(request.totalToScore());
        assignment.setScoringProgress(0);

        return toResponse(assignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public void removeJudgeAssignment(UUID roundId, UUID assignmentId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        RoundJudgeAssignment assignment = assignmentRepository.findByIdAndRoundId(assignmentId, roundId)
                .orElseThrow(() -> new NotFoundException("Judge assignment not found."));

        assignmentRepository.delete(assignment);
    }

    private JudgeAssignmentResponse toResponse(RoundJudgeAssignment assignment) {
        return new JudgeAssignmentResponse(
                assignment.getId(),
                assignment.getRound().getId(),
                assignment.getJudge().getId(),
                assignment.getJudge().getUser().getFullName(),
                assignment.getTrack() == null ? null : assignment.getTrack().getId(),
                assignment.getScoringProgress(),
                assignment.getTotalToScore()
        );
    }
}

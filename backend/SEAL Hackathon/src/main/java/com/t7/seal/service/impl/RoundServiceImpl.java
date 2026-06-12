package com.t7.seal.service.impl;

import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.domain.RoundStatus;
import com.t7.seal.domain.RuleType;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.AdvanceRuleRepository;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.request.round.CreateAdvanceRuleRequest;
import com.t7.seal.request.round.CreateRoundRequest;
import com.t7.seal.request.round.UpdateAdvanceRuleRequest;
import com.t7.seal.request.round.UpdateRoundRequest;
import com.t7.seal.response.round.AdvanceRuleResponse;
import com.t7.seal.response.round.RoundDetailResponse;
import com.t7.seal.response.round.RoundResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.RoundService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoundServiceImpl implements RoundService {

    private final HackathonEventRepository hackathonEventRepository;
    private final RoundRepository roundRepository;
    private final CurrentUserService currentUserService;
    private final AdvanceRuleRepository advanceRuleRepository;
    private final TrackRepository trackRepository;

    @Transactional
    @Override
    public RoundResponse createRound(UUID eventId, CreateRoundRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        assertTrackRoundEditable(event);

        validateCreateRoundRequest(request);

        if (roundRepository.existsByEventIdAndOrderIndex(eventId, request.orderIndex())) {
            throw new ConflictException("Round orderIndex already exists in this event");
        }

        if (roundRepository.existsByEventIdAndNameIgnoreCase(eventId, request.name().trim())) {
            throw new ConflictException("Round with this name already exists in this event");
        }

        Round round = new Round();
        round.setEvent(event);
        round.setName(trimToNull(request.name()));
        round.setOrderIndex(request.orderIndex());
        round.setStatus(RoundStatus.UPCOMING);
        round.setIsFinal(Boolean.TRUE.equals(request.isFinal()));
        round.setSubmissionDeadline(request.submissionDeadline());
        round.setJudgingDeadline(request.judgingDeadline());

        Round saved = roundRepository.save(round);

        return toRoundResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public List<RoundResponse> getRoundsByEvent(UUID eventId, Authentication authentication) {

        User user = currentUserService.getCurrentUser(authentication);

        List<Round> round;

        if (user.getRole() == UserRole.COORDINATOR) {
            round = roundRepository.findByEventIdOrderByOrderIndexAsc(eventId);
        } else {
            round = roundRepository.findPublicByEventIdOrderByOrderIndexAsc(eventId);
        }

        return round.stream()
                .map(this::toRoundResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public RoundDetailResponse getRoundById(UUID roundId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        Round round;

        if (user.getRole() == UserRole.COORDINATOR) {
            round = roundRepository.findById(roundId)
                    .orElseThrow(() -> new NotFoundException("Round not found " + roundId));
        } else {
            round = roundRepository.findPublicById(roundId)
                    .orElseThrow(() -> new NotFoundException("Round not found " + roundId));
        }

        return new RoundDetailResponse(
                round.getId(),
                round.getEvent().getId(),
                round.getName(),
                round.getOrderIndex(),
                round.getIsFinal(),
                round.getStatus().name(),
                round.getSubmissionDeadline(),
                round.getJudgingDeadline(),
                round.getSubmissionLockedAt(),
                round.getGradingLockedAt(),
                round.getAdvancementConfirmedAt()
        );
    }

    @Transactional
    @Override
    public RoundResponse updateRound(UUID roundId, UpdateRoundRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        Round round = getRound(roundId);

        assertTrackRoundEditable(round.getEvent());

        if (request.name() != null) {
            String name = trimToNull(request.name());

            if (name.isBlank()) {
                throw new BadRequestException("Round name is required");
            }

            round.setName(name);
        }

        if (request.orderIndex() != null) {
            if (request.orderIndex() < 0) {
                throw new BadRequestException("Round orderIndex must not be negative");
            }

            if (!request.orderIndex().equals(round.getOrderIndex())
                    && roundRepository.existsByEventIdAndOrderIndex(round.getEvent().getId(), request.orderIndex())) {
                throw new ConflictException("Round orderIndex already exists in this event");
            }

            round.setOrderIndex(request.orderIndex());
        }

        if (request.submissionDeadline() != null) {
            boolean changesSubmissionDeadline = !request.submissionDeadline().equals(round.getSubmissionDeadline());
            if (changesSubmissionDeadline && round.getSubmissionLockedAt() != null) {
                throw new ConflictException("Cannot change submissionDeadline after submissions are locked");
            }

            if (changesSubmissionDeadline) {
                round.setSubmissionDeadline(request.submissionDeadline());
            }
        }

        if (request.judgingDeadline() != null) {
            boolean changesJudgingDeadline = !request.judgingDeadline().equals(round.getJudgingDeadline());
            if (changesJudgingDeadline && round.getGradingLockedAt() != null) {
                throw new ConflictException("Cannot change judgingDeadline after grading is locked");
            }

            if (changesJudgingDeadline) {
                round.setJudgingDeadline(request.judgingDeadline());
            }
        }

        validateDeadlines(round.getSubmissionDeadline(), round.getJudgingDeadline());

        if (request.isFinal() != null) {
            round.setIsFinal(request.isFinal());
        }

        if (request.status() != null && !request.status().isBlank()) {
            // Round status transition validation is intentionally handled by dedicated workflow endpoints.
            round.setStatus(parseEnum(RoundStatus.class, request.status(), "status"));
        }

        Round saved = roundRepository.save(round);

        return toRoundResponse(saved);
    }

    @Transactional
    @Override
    public void deleteRound(UUID roundId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        Round round = getRound(roundId);

        assertTrackRoundEditable(round.getEvent());

        if (round.getSubmissionLockedAt() != null
                || round.getGradingLockedAt() != null
                || round.getAdvancementConfirmedAt() != null) {
            throw new ConflictException("Cannot delete a round that has been locked or had advancement confirmed");
        }

        roundRepository.delete(round);
    }

    @Override
    public List<AdvanceRuleResponse> getAdvanceRules(UUID roundId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        ensureRoundExist(roundId);

        return advanceRuleRepository.findByRoundIdOrderByPriorityAscRuleTypeAsc(roundId)
                .stream()
                .map(this::toAdvanceRuleResponse)
                .toList();
    }

    @Override
    public AdvanceRuleResponse createAdvanceRule(
            UUID roundId,
            CreateAdvanceRuleRequest request,
            Authentication authentication
    ) {
        currentUserService.getCurrentUser(authentication);

        Round round = getRound(roundId);

        assertAdvanceRuleEditable(round);

        RuleType ruleType = parseEnum(RuleType.class, request.ruleType(), "ruleType");

        Track track = resolveTrack(request.trackId(), round);

        assertNoDuplicateAdvanceRule(roundId, ruleType, track.getId());

        return null;
    }

    @Override
    public AdvanceRuleResponse updateAdvanceRule(UUID advanceRuleId, UpdateAdvanceRuleRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public void deleteAdvanceRule(UUID advanceRuleId, Authentication authentication) {

    }

    //HELPERS

    private void assertTrackRoundEditable(HackathonEvent event) {
        RegistrationStatus status = event.getStatus();

        if (status != RegistrationStatus.DRAFT && status != RegistrationStatus.REGISTRATION) {
            throw new ConflictException("Rounds are locked in event status " + status + ".");
        }
    }

    private void validateCreateRoundRequest(CreateRoundRequest request) {
        if (trimToNull(request.name()) == null) {
            throw new BadRequestException("Round name is required");
        }

        if (request.orderIndex() == null || request.orderIndex() < 0) {
            throw new BadRequestException("Round orderIndex must not be negative");
        }

        validateDeadlines(request.submissionDeadline(), request.judgingDeadline());
    }

    private void validateDeadlines(LocalDateTime submissionDeadline, LocalDateTime judgingDeadline) {
        if (judgingDeadline != null && submissionDeadline != null &&
                judgingDeadline.isBefore(submissionDeadline)) {
            throw new BadRequestException("judgingDeadline cannot be before submissionDeadline");
        }
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, String fieldName) {
        try {
            return Enum.valueOf(enumClass, value.trim().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException(String.format("Invalid %s: %s", fieldName, value));
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private RoundResponse toRoundResponse(Round round) {
        return new RoundResponse(
                round.getId(),
                round.getEvent().getId(),
                round.getName(),
                round.getOrderIndex(),
                round.getIsFinal(),
                round.getStatus().name(),
                round.getSubmissionDeadline(),
                round.getJudgingDeadline()
        );
    }

    private void ensureRoundExist(UUID roundId) {
        if (!roundRepository.existsById(roundId)) {
            throw new NotFoundException("Round not found " + roundId);
        }
    }

    private AdvanceRuleResponse toAdvanceRuleResponse(AdvanceRule advanceRule) {
        Integer topN = null;
        Double topPercent = null;
        Double minScore = null;
        Integer wildCardSlots = null;

        if (advanceRule.getValue() != null) {
            switch (advanceRule.getRuleType()) {
                case TOP_N -> topN = Math.round(advanceRule.getValue());
                case TOP_PERCENT -> topPercent = advanceRule.getValue().doubleValue();
                case MIN_SCORE -> minScore = advanceRule.getValue().doubleValue();
                case WILDCARD -> wildCardSlots = Math.round(advanceRule.getValue());
            }
        }

        return new AdvanceRuleResponse(
                advanceRule.getId(),
                advanceRule.getRound().getId(),
                advanceRule.getTrack() == null ? null : advanceRule.getTrack().getId(),
                advanceRule.getRuleType().name(),
                topN,
                topPercent,
                minScore,
                wildCardSlots,
                Boolean.TRUE,
                advanceRule.getValue(),
                advanceRule.getPriority(),
                advanceRule.getDescription()
        );
    }

    private Round getRound(UUID roundId) {
        return roundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found " + roundId));
    }

    private void assertAdvanceRuleEditable(Round round) {
        RegistrationStatus status = round.getEvent().getStatus();

        if (status == RegistrationStatus.JUDGING
                || status == RegistrationStatus.COMPLETED
                || status == RegistrationStatus.CANCELLED) {
            throw new ConflictException("Advance rules cannot be edited in this status " + status + ".");
        }

        if (round.getAdvancementConfirmedAt() != null) {
            throw new ConflictException("Advance rules cannot be edited after advancement has been confirmed.");
        }
    }

    private Track resolveTrack(UUID trackId, Round round) {
        if (trackId == null) {
            return null;
        }

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found " + trackId));

        if (!track.getEvent().getId().equals(round.getEvent().getId())) {
            throw new BadRequestException("Track does not belong to this round's event.");
        }

        return track;
    }

    private void assertNoDuplicateAdvanceRule(
            UUID roundId, RuleType ruleType,
            UUID trackId, UUID currentRuleId
    ) {
        boolean exists = advanceRuleRepository.findByRoundIdOrderByPriorityAscRuleTypeAsc(roundId)
                .stream()
                .filter(r -> !r.getId().equals(currentRuleId))
                .anyMatch(r -> {
                    UUID existingTrackId = r.getTrack() == null ? null : r.getTrack().getId();
                    return r.getRuleType() == ruleType
                            && ((existingTrackId == null && trackId == null)
                            || (existingTrackId != null && existingTrackId.equals(trackId)));
                });

        if (exists) {
            throw new ConflictException("Advance rule already exists for this round and track.");
        }
    }

    private void assertNoDuplicateAdvanceRule(
            UUID roundId, RuleType ruleType, UUID trackId
    ) {
        boolean exists = (trackId == null)
                ? advanceRuleRepository.existGlobalRule(roundId, ruleType)
                : advanceRuleRepository.existsByRoundIdAndRuleTypeAndTrackId(roundId, ruleType, trackId);
    }

    private Float resolveRuleValue(
            RuleType ruleType, Integer topN,
            Double topPercent, Double minScore,
            Integer wildCardSlots
    ) {
        Float value = null;
    }
}

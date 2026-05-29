package com.t7.seal.service.impl;

import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.domain.RoundStatus;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Round;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.request.round.CreateRoundRequest;
import com.t7.seal.request.round.UpdateRoundRequest;
import com.t7.seal.response.round.RoundDetailResponse;
import com.t7.seal.response.round.RoundResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.RoundService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
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

    @Transactional
    @Override
    public RoundResponse createRound(UUID eventId, CreateRoundRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        HackathonEvent event = hackathonEventRepository.findPublicEventById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

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
    public List<RoundResponse> getRoundsByEvent(UUID eventId) {
        return roundRepository.findPublicByEventIdOrderByOrderIndexAsc(eventId)
                .stream()
                .map(this::toRoundResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public RoundDetailResponse getRoundById(UUID roundId) {
        Round round = roundRepository.findPublicById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found " + roundId));

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

        Round round = roundRepository.findPublicById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found " + roundId));


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

        Round round = roundRepository.findPublicById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found " + roundId));

        if (round.getSubmissionLockedAt() != null
                || round.getGradingLockedAt() != null
                || round.getAdvancementConfirmedAt() != null) {
            throw new ConflictException("Cannot delete a round that has been locked or had advancement confirmed");
        }

        roundRepository.delete(round);
    }

    //HELPERS
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
                round.getStatus().name()
        );
    }
}

package com.t7.seal.service.impl;

import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.Prize;
import com.t7.seal.entities.Track;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.PrizeRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.TrackRepository;
import com.t7.seal.request.results.*;
import com.t7.seal.response.results.PrizeAssignmentResponse;
import com.t7.seal.response.results.PrizeResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.PrizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrizeServiceImpl implements PrizeService {

    private final PrizeRepository prizeRepository;
    private final HackathonEventRepository eventRepository;
    private final TrackRepository trackRepository;
    private final RoundRepository roundRepository;

    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    @Transactional
    @Override
    public PrizeResponse createPrize(CreatePrizeRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        validateCreatePrizeRequest(request);

        HackathonEvent event = findEvent(request.eventId());
        assertPrizeEditable(event);
        Track track = resolveTrack(event.getId(), request.trackId());

        if (prizeRepository.existsSameRank(event.getId(), request.trackId(), request.rankPosition())) {
            throw new ConflictException("Prize rank already exists for this event/track.");
        }

        Prize prize = new Prize();
        prize.setEvent(event);
        prize.setTrack(track);
        prize.setRankPosition(request.rankPosition());
        prize.setTitle(request.title().trim());
        prize.setDescription(trimToNull(request.description()));
        prize.setValue(request.value());
        prize.setCurrency(request.currency() == null || request.currency().isBlank()
                ? "VND"
                : request.currency().trim().toUpperCase());
        prize.setSponsorName(trimToNull(request.sponsorName()));

        Prize saved = prizeRepository.save(prize);

        auditLogService.record(
                actor,
                AuditActionType.PRIZE_CREATED,
                "prizes",
                saved.getId(),
                null,
                auditPrize(prize),
                auditContext(event.getId(), null, null, null)
        );

        return toPrizeResponse(saved);
    }

    @Transactional
    @Override
    public PrizeResponse updatePrize(UUID prizeId, UpdatePrizeRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        Prize prize = findPrize(prizeId, null, null);
        assertPrizeEditable(prize.getEvent());

        Map<String, Object> before = auditPrize(prize);

        UUID trackId = prize.getTrack() == null ? null : prize.getTrack().getId();
        Integer newRank = request.rankPosition() == null ? prize.getRankPosition() : request.rankPosition();

        if (request.rankPosition() != null) {
            if (request.rankPosition() < 1) {
                throw new BadRequestException("rankPosition must be greater than 0.");
            }
            if (prizeRepository.existsSameRankExceptSelf(prizeId, prize.getEvent().getId(), trackId, newRank)) {
                throw new ConflictException("Prize rank already exists for this event/track.");
            }
            prize.setRankPosition(request.rankPosition());
        }

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new BadRequestException("Prize title cannot be blank.");
            }
            prize.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            prize.setDescription(trimToNull(request.description()));
        }
        if (request.value() != null) {
            validateNonNegative(request.value(), "value");
            prize.setValue(request.value());
        }
        if (request.currency() != null) {
            prize.setCurrency(request.currency().trim().toUpperCase());
        }
        if (request.sponsorName() != null) {
            prize.setSponsorName(trimToNull(request.sponsorName()));
        }

        Prize saved = prizeRepository.save(prize);

        auditLogService.record(
                actor,
                AuditActionType.PRIZE_UPDATED,
                "prize",
                saved.getId(),
                before,
                auditPrize(prize),
                auditContext(prize.getEvent().getId(), trackId, null, null)
        );

        return toPrizeResponse(saved);
    }

    @Transactional
    @Override
    public void deletePrize(UUID prizeId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        Prize prize = findPrize(prizeId, null, null);
        assertPrizeEditable(prize.getEvent());
        if (prize.getAwardedTeam() != null) {
            throw new ConflictException("Cannot delete prize after it has been awarded. Clear award first.");
        }

        Map<String, Object> before = auditPrize(prize);
        UUID eventId = prize.getEvent().getId();
        UUID trackId = prize.getTrack() == null ? null : prize.getTrack().getId();

        prizeRepository.delete(prize);

        auditLogService.record(
                actor,
                AuditActionType.PRIZE_DELETED,
                "prize",
                prizeId,
                before,
                null,
                auditContext(eventId, trackId, null, null)
        );
    }

    @Transactional(readOnly = true)
    @Override
    public List<PrizeResponse> getPrizesByEvent(UUID eventId) {
        return prizeRepository.findByEventIdOrderByTrackNameAndRankPositionAsc(eventId)
                .stream()
                .map(this::toPrizeResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public PrizeResponse getPrizeById(UUID prizeId) {
        Prize prize = findPrize(prizeId, null, null);
        return toPrizeResponse(prize);
    }

    @Override
    public PrizeResponse awardPrize(UUID prizeId, AwardPrizeRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public PrizeResponse clearPrize(UUID prizeId, ClearPrizeAwardRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public List<PrizeAssignmentResponse> assignPrizesFromRanking(UUID eventId, AssignPrizesFromRankingRequest request, Authentication authentication) {
        return List.of();
    }

    @Transactional(readOnly = true)
    @Override
    public List<PrizeResponse> getPublishedAwards(UUID eventId) {
        HackathonEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found."));

        if (!hasPublishedResults(event)) {
            return List.of();
        }

        return prizeRepository.findAwardedByEventIdOrderByTrackNameAndRankPositionAsc(eventId)
                .stream()
                .map(this::toPrizeResponse)
                .toList();
    }

    //HELPERS

    private boolean hasPublishedResults(HackathonEvent event) {
        return event.getResultPublishedAt() != null
                || roundRepository.existsByEventIdAndResultPublishedAtIsNotNull(event.getId());
    }

    private void assertPrizeEditable(HackathonEvent event) {
        RegistrationStatus status = event.getStatus();

        if (status == RegistrationStatus.JUDGING
                || status == RegistrationStatus.COMPLETED
                || status == RegistrationStatus.CANCELLED) {
            throw new ConflictException("Prizes are locked in event status " + status + ".");
        }
    }

    private HackathonEvent findEvent(UUID eventId) {
        if (eventId == null) {
            throw new BadRequestException("Event id is required.");
        }
        return eventRepository.findByIdCanAssignedPrize(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found."));
    }

    private Track resolveTrack(UUID eventId, UUID trackId) {
        if (trackId == null) {
            return null;
        }
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found."));
        if (!track.getEvent().getId().equals(eventId)) {
            throw new BadRequestException("Track does not belong to this event.");
        }
        return track;
    }

    private Prize findPrize(UUID prizeId, UUID eventId, UUID trackId) {
        if (prizeId == null) {
            throw new BadRequestException("Prize id is required.");
        }
        return prizeRepository.findPrizeByIdInEventAndTrack(prizeId, eventId, trackId)
                .orElseThrow(() -> new NotFoundException("Prize not found."));
    }

    private void validateCreatePrizeRequest(CreatePrizeRequest request) {
        if (request.eventId() == null) {
            throw new BadRequestException("eventId is required.");
        }
        if (request.rankPosition() == null || request.rankPosition() < 1) {
            throw new BadRequestException("rankPosition must be greater than 0.");
        }
        if (request.title() == null || request.title().isBlank()) {
            throw new BadRequestException("Prize title is required.");
        }
        if (request.value() != null) {
            validateNonNegative(request.value(), "value");
        }
    }

    private void validateNonNegative(BigDecimal value, String fieldName) {
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException(fieldName + " must not be negative.");
        }
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private PrizeResponse toPrizeResponse(Prize prize) {
        return new PrizeResponse(
                prize.getId(),
                prize.getEvent().getId(),
                prize.getEvent().getName(),
                prize.getTrack() == null ? null : prize.getTrack().getId(),
                prize.getTrack() == null ? null : prize.getTrack().getName(),
                prize.getRankPosition(),
                prize.getTitle(),
                prize.getDescription(),
                prize.getValue(),
                prize.getCurrency(),
                prize.getSponsorName(),
                prize.getAwardedTeam() == null ? null : prize.getAwardedTeam().getId(),
                prize.getAwardedTeam() == null ? null : prize.getAwardedTeam().getName(),
                prize.getAwardedAt()
        );
    }

    private Map<String, Object> auditPrize(Prize prize) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("id", prize.getId() == null ? null : prize.getId().toString());
        state.put("eventId", prize.getEvent() == null ? null : prize.getEvent().getId().toString());
        state.put("trackId", prize.getTrack() == null ? null : prize.getTrack().getId().toString());
        state.put("rankPosition", prize.getRankPosition());
        state.put("title", prize.getTitle());
        state.put("value", prize.getValue());
        state.put("currency", prize.getCurrency());
        state.put("awardedTeamId", prize.getAwardedTeam() == null
                ? null : prize.getAwardedTeam().getId().toString());
        state.put("awardedAt", prize.getAwardedAt() == null
                ? null : prize.getAwardedAt().toString());

        return state;
    }

    private Map<String, Object> auditContext(UUID eventId, UUID trackId, UUID roundId, String reason) {
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("eventId", eventId == null ? null : eventId.toString());
        context.put("trackId", trackId == null ? null : trackId.toString());
        context.put("roundId", roundId == null ? null : roundId.toString());
        context.put("reason", reason);

        return context;
    }
}

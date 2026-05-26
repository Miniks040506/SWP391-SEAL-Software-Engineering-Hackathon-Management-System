package com.t7.seal.service.impl;

import com.t7.seal.entities.Round;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.response.round.RoundDetailResponse;
import com.t7.seal.response.round.RoundResponse;
import com.t7.seal.service.RoundService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoundServiceImpl implements RoundService {

    private final RoundRepository roundRepository;

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

    //HELPERS
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

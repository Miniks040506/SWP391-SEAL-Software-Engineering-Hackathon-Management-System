package com.t7.seal.service.impl;

import com.t7.seal.entities.Prize;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.PrizeRepository;
import com.t7.seal.response.results.PrizeResponse;
import com.t7.seal.service.PrizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrizeServiceImpl implements PrizeService {

    private final PrizeRepository prizeRepository;
    
    @Transactional(readOnly = true)
    @Override
    public List<PrizeResponse> getPrizesByEvent(UUID eventId) {
        return prizeRepository.findPublicByEventId(eventId)
                .stream()
                .map(this::toPrizeResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public PrizeResponse getPrizeById(UUID prizeId) {
        Prize prize = prizeRepository.findPublicById(prizeId)
                .orElseThrow(() -> new NotFoundException("Prize not found " + prizeId));

        return new PrizeResponse(
                prize.getId(),
                prize.getEvent().getId(),
                prize.getTrack().getId(),
                prize.getRankPosition(),
                prize.getTitle(),
                prize.getDescription(),
                prize.getValue(),
                prize.getCurrency(),
                prize.getSponsorName(),
                prize.getAwardedTeam().getId(),
                prize.getAwardedAt()
        );
    }

    //HELPERS
    PrizeResponse toPrizeResponse(Prize prize) {
        return new PrizeResponse(
                prize.getId(),
                prize.getEvent().getId(),
                prize.getTrack().getId(),
                prize.getRankPosition(),
                prize.getTitle(),
                prize.getDescription(),
                prize.getValue(),
                prize.getCurrency(),
                prize.getSponsorName(),
                prize.getAwardedTeam().getId(),
                prize.getAwardedAt()
        );
    }
}

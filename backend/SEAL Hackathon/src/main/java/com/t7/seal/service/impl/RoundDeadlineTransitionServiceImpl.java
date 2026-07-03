package com.t7.seal.service.impl;

import com.t7.seal.domain.RoundStatus;
import com.t7.seal.entities.Round;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.service.RoundDeadlineReminderService;
import com.t7.seal.service.RoundDeadlineTransitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoundDeadlineTransitionServiceImpl implements RoundDeadlineTransitionService {

    private final RoundRepository roundRepository;
    private final RoundDeadlineReminderService roundDeadlineReminderService;

    @Override
    @Transactional
    public int transitionExpiredOpenRoundsToPendingLock() {
        List<Round> expiredRounds = roundRepository
                .findByStatusAndSubmissionLockedAtIsNullAndSubmissionDeadlineLessThanEqualOrderBySubmissionDeadlineAsc(
                        RoundStatus.OPEN,
                        LocalDateTime.now()
                );

        expiredRounds.forEach(round -> {
            round.setStatus(RoundStatus.PENDING_LOCK);
            roundDeadlineReminderService.cancelSubmissionDeadlineReminders(round);
        });
        roundRepository.saveAll(expiredRounds);

        return expiredRounds.size();
    }
}

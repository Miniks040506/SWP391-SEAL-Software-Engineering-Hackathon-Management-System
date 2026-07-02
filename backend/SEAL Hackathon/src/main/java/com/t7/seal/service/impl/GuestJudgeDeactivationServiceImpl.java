package com.t7.seal.service.impl;

import com.t7.seal.entities.Judge;
import com.t7.seal.repository.JudgeRepository;
import com.t7.seal.service.GuestJudgeDeactivationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuestJudgeDeactivationServiceImpl implements GuestJudgeDeactivationService {

    @Value("${app.guest-judge.deactivation-delay-hours:24}")
    private int deactivationDelayHours;

    private final JudgeRepository judgeRepository;

    @Override
    @Transactional
    public int deactivateGuestJudgesAfterCompletedEvents() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime completedBefore = now.minusHours(Math.max(deactivationDelayHours, 1));
        List<Judge> judges = judgeRepository.findActiveTemporaryGuestJudgesEligibleForDeactivation(completedBefore);

        judges.forEach(judge -> {
            judge.expireTemporaryAccess(now);
            judge.getUser().deactivate();
        });

        judgeRepository.saveAll(judges);

        return judges.size();
    }
}

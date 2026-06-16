package com.t7.seal.service;

import com.t7.seal.request.round.CreateAdvanceRuleRequest;
import com.t7.seal.request.round.CreateRoundRequest;
import com.t7.seal.request.round.UpdateAdvanceRuleRequest;
import com.t7.seal.request.round.UpdateRoundRequest;
import com.t7.seal.response.round.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface RoundService {
    RoundResponse createRound(UUID eventId, CreateRoundRequest request, Authentication authentication);

    List<RoundResponse> getRoundsByEvent(UUID eventId, Authentication authentication);

    RoundDetailResponse getRoundById(UUID roundId, Authentication authentication);

    RoundResponse updateRound(UUID roundId, UpdateRoundRequest request, Authentication authentication);

    void deleteRound(UUID roundId, Authentication authentication);

    List<AdvanceRuleResponse> getAdvanceRules(UUID roundId, Authentication authentication);

    AdvanceRuleResponse createAdvanceRule
            (UUID roundId, CreateAdvanceRuleRequest request, Authentication authentication);

    AdvanceRuleResponse updateAdvanceRule
            (UUID advanceRuleId, UpdateAdvanceRuleRequest request, Authentication authentication);

    void deleteAdvanceRule(UUID advanceRuleId, Authentication authentication);

    RoundResponse openRound(UUID roundId, Authentication authentication);

    RoundResponse closeRound(UUID roundId, Authentication authentication);

    RoundLockResponse lockSubmission(UUID roundId, Authentication authentication);

    RoundOperationStatusResponse getOperationStatus(UUID roundId, Authentication authentication);
}

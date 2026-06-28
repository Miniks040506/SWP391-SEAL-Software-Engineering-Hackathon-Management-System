package com.t7.seal.security.guard;

import com.t7.seal.repository.AdvanceRuleRepository;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RoundRepository;
import com.t7.seal.repository.TrackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("eventSecurity")
@RequiredArgsConstructor
public class EventSecurity {

    private final HackathonEventRepository hackathonEventRepository;
    private final TrackRepository trackRepository;
    private final RoundRepository roundRepository;
    private final AdvanceRuleRepository advanceRuleRepository;

    public boolean canCreateEvent(Authentication authentication) {
        return CurrentUser.isCoordinator(authentication);
    }

    public boolean canManageEvent(UUID eventId, Authentication authentication) {
        return CurrentUser.isCoordinator(authentication)
                && hackathonEventRepository.existsById(eventId);
    }

    public boolean canCreateTrack(UUID eventId, Authentication authentication) {
        return canManageEvent(eventId, authentication);
    }

    public boolean canCreateRound(UUID eventId, Authentication authentication) {
        return canManageEvent(eventId, authentication);
    }

    public boolean canManageTrack(UUID trackId, Authentication authentication) {
        return CurrentUser.isCoordinator(authentication)
                && trackRepository.existsById(trackId);
    }

    public boolean canManageRound(UUID roundId, Authentication authentication) {
        if (CurrentUser.isAdmin(authentication)) {
            return roundRepository.existsById(roundId);
        }
        return CurrentUser.isCoordinator(authentication)
                && roundRepository.existsByIdAndEventCreatedById(
                roundId,
                CurrentUser.id(authentication)
        );
    }

    public boolean canManageAdvanceRule(UUID ruleId, Authentication authentication) {
        if (CurrentUser.isAdmin(authentication)) {
            return advanceRuleRepository.existsById(ruleId);
        }
        return CurrentUser.isCoordinator(authentication)
                && advanceRuleRepository.existsByIdAndRoundEventCreatedById(
                ruleId,
                CurrentUser.id(authentication)
        );
    }

    public boolean canManagePrize(Authentication authentication) {
        return CurrentUser.isCoordinator(authentication);
    }

    public boolean canCreateEventCriteria(UUID eventId, Authentication authentication) {
        return canManageEvent(eventId, authentication);
    }
}

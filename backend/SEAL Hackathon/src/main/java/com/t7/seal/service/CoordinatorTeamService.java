package com.t7.seal.service;

import com.t7.seal.request.team.RejectTeamRegistrationRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.coordinator.CoordinatorTeamDetailResponse;
import com.t7.seal.response.coordinator.CoordinatorTeamSummaryResponse;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface CoordinatorTeamService {
    PageResponse<CoordinatorTeamSummaryResponse> getEventTeams(
            UUID eventId,
            UUID trackId,
            String status,
            String registrationStatus,
            String search,
            int page,
            int size,
            Authentication authentication
    );

    CoordinatorTeamDetailResponse getTeamSummary(UUID teamId, Authentication authentication);

    CoordinatorTeamDetailResponse approveRegistration(UUID teamId, Authentication authentication);

    CoordinatorTeamDetailResponse rejectRegistration(UUID teamId, RejectTeamRegistrationRequest request, Authentication authentication);
}

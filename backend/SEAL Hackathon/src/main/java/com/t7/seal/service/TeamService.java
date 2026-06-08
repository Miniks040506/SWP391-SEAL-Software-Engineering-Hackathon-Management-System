package com.t7.seal.service;

import com.t7.seal.request.team.CreateTeamRequest;
import com.t7.seal.response.team.TeamDetailResponse;
import com.t7.seal.response.team.TeamResponse;
import com.t7.seal.response.team.TeamSummaryResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface TeamService {
    TeamResponse createTeam(CreateTeamRequest request, Authentication authentication);

    List<TeamSummaryResponse> getMyTeams(Authentication authentication);

    TeamDetailResponse getTeamById(UUID teamId, Authentication authentication);
}

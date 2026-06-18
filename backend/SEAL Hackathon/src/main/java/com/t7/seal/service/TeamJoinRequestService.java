package com.t7.seal.service;

import com.t7.seal.request.team.CreateTeamJoinRequest;
import com.t7.seal.request.team.ReasonRequest;
import com.t7.seal.response.team.TeamJoinRequestResponse;
import com.t7.seal.response.team.TeamMemberResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface TeamJoinRequestService {
    TeamJoinRequestResponse create(UUID teamId, CreateTeamJoinRequest request, Authentication authentication);

    List<TeamJoinRequestResponse> getForTeam(UUID teamId, Authentication authentication);

    List<TeamJoinRequestResponse> getForCurrentUser(Authentication authentication);

    TeamJoinRequestResponse getByToken(String token);

    TeamMemberResponse accept(UUID requestId, Authentication authentication);

    TeamMemberResponse acceptByToken(String token);

    void reject(UUID requestId, ReasonRequest reason, Authentication authentication);

    void rejectByToken(String token, ReasonRequest reason);
}

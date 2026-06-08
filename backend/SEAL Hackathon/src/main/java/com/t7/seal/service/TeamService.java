package com.t7.seal.service;

import com.t7.seal.request.team.CreateTeamRequest;
import com.t7.seal.response.team.TeamResponse;
import org.springframework.security.core.Authentication;

public interface TeamService {
    TeamResponse createTeam(CreateTeamRequest request, Authentication authentication);
}

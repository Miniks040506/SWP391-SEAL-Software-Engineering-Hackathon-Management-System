package com.t7.seal.service;

import com.t7.seal.response.team.FormingTeamResponse;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface FormingTeamService {
    Page<FormingTeamResponse> getFormingTeams(
            UUID eventId,
            UUID trackId,
            String search,
            int page,
            int size,
            Authentication authentication
    );
}

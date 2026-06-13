package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.team.TeamInvitationResponse;
import com.t7.seal.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping(ApiPaths.API_V1 + "/invitations")
@RequiredArgsConstructor
public class TeamInvitationController {

    private final TeamService teamService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<List<TeamInvitationResponse>> getMyInvitations(Authentication authentication) {
        return null;
    }
}

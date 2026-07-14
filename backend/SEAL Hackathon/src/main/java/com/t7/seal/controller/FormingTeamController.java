package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.team.FormingTeamResponse;
import com.t7.seal.service.FormingTeamService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/teams/forming")
@RequiredArgsConstructor
@Tag(
        name = "Forming Teams",
        description = "Discover teams currently accepting participants."
)
public class FormingTeamController {

    private final FormingTeamService formingTeamService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PageResponse<FormingTeamResponse>> getFormingTeams(
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) UUID trackId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        Page<FormingTeamResponse> result = formingTeamService.getFormingTeams(
                eventId,
                trackId,
                search,
                page,
                size,
                authentication
        );
        return ResponseEntity.ok(new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        ));
    }
}

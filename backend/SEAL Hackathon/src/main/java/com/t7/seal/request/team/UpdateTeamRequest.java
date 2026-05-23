package com.t7.seal.request.team;

public record UpdateTeamRequest(
        String name,
        String projectTitle,
        String description
) {}

package com.t7.seal.request.team;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTeamRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 200) String projectTitle,
        @Size(max = 1000) String description
) {}

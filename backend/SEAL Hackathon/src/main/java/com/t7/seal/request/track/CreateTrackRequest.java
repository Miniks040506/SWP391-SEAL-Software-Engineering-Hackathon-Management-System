package com.t7.seal.request.track;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateTrackRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 2000) String description,
        Integer maxTeams,
        List<String> requiredLinkTypes
) {}

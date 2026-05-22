package com.t7.seal.request.submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

//merge both UpdateSubmissionLinkRequest and CreateSubmissionLinkRequest into 1
public record SubmissionLinkRequest(
        @NotBlank String linkType,
        @NotBlank @Size(max = 1000) String url,
        String label,
        Boolean isPrimary,
        Integer displayOrder) {
}

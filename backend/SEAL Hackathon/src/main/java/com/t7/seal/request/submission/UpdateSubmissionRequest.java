package com.t7.seal.request.submission;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateSubmissionRequest(
        @Size(max = 5000, message = "Submission note must be at most 5000 characters")
        String note,
        String status,
        List<@Valid SubmissionLinkRequest> links
) {
}
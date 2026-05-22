package com.t7.seal.request.submission;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SubmitDeliverablesRequest(
        @Size(max = 5000) String note,
        @NotEmpty List<SubmissionLinkRequest> links) {
}

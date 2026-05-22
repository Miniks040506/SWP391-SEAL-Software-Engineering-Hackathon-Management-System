package com.t7.seal.response.grading;

import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.submission.SubmissionLinkResponse;

import java.util.List;
import java.util.UUID;

public record GradingSubmissionDetailResponse(
        UUID submissionId, String teamName, String projectTitle, String note,
        List<SubmissionLinkResponse> links, List<EventCriteriaResponse> criteria
) {}
package com.t7.seal.service.impl;

import com.t7.seal.request.submission.SubmissionLinkRequest;
import com.t7.seal.request.submission.SubmitDeliverablesRequest;
import com.t7.seal.request.submission.UpdateSubmissionRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.submission.*;
import com.t7.seal.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    @Override
    public SubmissionResponse submitDeliverables(UUID teamId, UUID roundId, SubmitDeliverablesRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionResponse uploadSubmissionFile(UUID teamId, UUID roundId, String linkType, String note, String label, Boolean isPrimary, Integer displayOrder, Boolean submitNow, MultipartFile file, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionResponse uploadFileToSubmission(UUID submissionId, String linkType, String label, Boolean isPrimary, Integer displayOrder, Boolean submitNow, MultipartFile file, Authentication authentication) {
        return null;
    }

    @Override
    public List<SubmissionSummaryResponse> getTeamSubmissions(UUID teamId, Authentication authentication) {
        return List.of();
    }

    @Override
    public SubmissionDetailResponse getSubmissionById(UUID submissionId, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionDetailResponse getSubmissionForAdmin(UUID submissionId, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionResponse updateSubmission(UUID submissionId, UpdateSubmissionRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionResponse addSubmissionLinks(UUID submissionId, SubmissionLinkRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionLinkResponse updateSubmissionLink(UUID linkId, SubmissionLinkRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public void deleteSubmissionLink(UUID linkId, Authentication authentication) {

    }

    @Override
    public FileDownloadUrlResponse createSubmissionFileDownloadUrl(UUID linkId, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionResponse submitExistingSubmission(UUID submissionId, Authentication authentication) {
        return null;
    }

    @Override
    public PageResponse<CoordinatorSubmissionSummaryResponse> getEventSubmissions(UUID eventId, UUID roundId, UUID trackId, String status, String search, int page, int size, Authentication authentication) {
        return null;
    }

    @Override
    public List<SubmissionSummaryResponse> getRoundSubmissions(UUID roundId, Authentication authentication) {
        return List.of();
    }

    @Override
    public List<SubmissionSummaryResponse> getTrackSubmissions(UUID trackId, Authentication authentication) {
        return List.of();
    }

    @Override
    public List<SubmissionSummaryResponse> getMentorTeamSubmissions(UUID teamId, Authentication authentication) {
        return List.of();
    }

    @Override
    public SubmissionDetailResponse getMentorSubmissionById(UUID submissionId, Authentication authentication) {
        return null;
    }
}
